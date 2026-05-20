<script setup lang="ts">
import { computed, ref } from "vue";
import AutoComplete, { type AutoCompleteCompleteEvent } from "primevue/autocomplete";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Message from "primevue/message";
import SelectButton from "primevue/selectbutton";
import ToggleSwitch from "primevue/toggleswitch";
import {
  getInventoryDetails,
  grantInventoryAccess,
  revokeInventoryAccess,
  setInventoryPublicWriteAccess
} from "@/entities/inventory/api";
import { autocompleteUsers } from "@/entities/user/api";
import type { InventoryAccessUserDto, InventoryDetailsDto } from "@/entities/inventory/types";
import type { AutocompleteOptionDto } from "@/entities/tag/types";
import { formatDateTime } from "@/shared/utils/date";
import { useI18n } from "@/shared/i18n/useI18n";

const props = defineProps<{
  inventory: InventoryDetailsDto;
}>();

const emit = defineEmits<{
  updated: [inventory: InventoryDetailsDto];
}>();

const { t } = useI18n();
const sortMode = ref<"name" | "email">("name");
const userDraft = ref<string | AutocompleteOptionDto>("");
const userSuggestions = ref<AutocompleteOptionDto[]>([]);
const selectedUsers = ref<InventoryAccessUserDto[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const sortOptions = [
  { label: "Name", value: "name" },
  { label: "Email", value: "email" }
];

const sortedUsers = computed(() => {
  const users = [...props.inventory.accessUsers];
  const selector = sortMode.value === "name" ? "userName" : "email";
  return users.sort((left, right) => left[selector].localeCompare(right[selector]));
});

function userLabel(value: string | AutocompleteOptionDto) {
  return typeof value === "string" ? value.trim() : value.label.trim();
}

async function reloadInventory() {
  emit("updated", await getInventoryDetails(props.inventory.id));
}

async function searchUsers(event: AutoCompleteCompleteEvent) {
  userSuggestions.value = await autocompleteUsers(event.query, 10);
}

async function togglePublicWrite(nextValue: boolean) {
  loading.value = true;
  errorMessage.value = null;

  try {
    await setInventoryPublicWriteAccess(props.inventory.id, props.inventory.version, nextValue);
    await reloadInventory();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to update public access.";
  } finally {
    loading.value = false;
  }
}

async function grantAccess(value = userDraft.value) {
  const userNameOrEmail = userLabel(value);
  if (!userNameOrEmail) return;

  loading.value = true;
  errorMessage.value = null;

  try {
    await grantInventoryAccess(props.inventory.id, props.inventory.version, userNameOrEmail);
    userDraft.value = "";
    await reloadInventory();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to grant access.";
  } finally {
    loading.value = false;
  }
}

async function revokeSelectedAccess() {
  const users = [...selectedUsers.value];
  if (users.length === 0) return;

  loading.value = true;
  errorMessage.value = null;

  try {
    await Promise.all(
      users.map((user) => revokeInventoryAccess(props.inventory.id, user.userId, props.inventory.version))
    );
    selectedUsers.value = [];
    await reloadInventory();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to revoke access.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="manager-stack">
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <section class="access-panel">
      <div>
        <h2>{{ t("access.public") }}</h2>
        <p class="muted">
          {{ t("access.publicHint") }}
        </p>
      </div>
      <ToggleSwitch
        :model-value="inventory.isPublicWriteAccess"
        :disabled="loading"
        @update:model-value="togglePublicWrite"
      />
    </section>

    <section class="content-section">
      <div class="section-heading">
        <div>
          <h2>{{ t("access.individual") }}</h2>
          <span class="muted">{{ t("access.individualHint") }}</span>
        </div>
        <div class="row-action-group">
          <SelectButton v-model="sortMode" :options="sortOptions" option-label="label" option-value="value" />
          <Button
            icon="pi pi-times"
            label="Revoke selected"
            severity="danger"
            outlined
            :disabled="selectedUsers.length === 0 || loading"
            @click="revokeSelectedAccess"
          />
        </div>
      </div>

      <div class="grant-row">
        <AutoComplete
          v-model="userDraft"
          :suggestions="userSuggestions"
          option-label="label"
          placeholder="Username or email"
          @complete="searchUsers"
          @option-select="grantAccess($event.value)"
        >
          <template #option="{ option }">
            <div class="autocomplete-option">
              <strong>{{ option.label }}</strong>
              <span class="muted">{{ option.description }}</span>
            </div>
          </template>
        </AutoComplete>
        <Button icon="pi pi-plus" :label="t('access.grant')" :loading="loading" @click="grantAccess()" />
      </div>

      <DataTable
        v-model:selection="selectedUsers"
        :value="sortedUsers"
        data-key="userId"
        striped-rows
        table-style="min-width: 42rem"
      >
        <template #empty>No individual access grants.</template>
        <Column selection-mode="multiple" header-style="width: 3rem" />
        <Column field="userName" :header="t('common.name')" sortable />
        <Column field="email" :header="t('common.email')" sortable />
        <Column field="grantedAt" header="Granted" sortable>
          <template #body="{ data }">{{ formatDateTime(data.grantedAt) }}</template>
        </Column>
      </DataTable>
    </section>
  </div>
</template>
