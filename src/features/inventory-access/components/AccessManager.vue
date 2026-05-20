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

const props = defineProps<{
  inventory: InventoryDetailsDto;
}>();

const emit = defineEmits<{
  updated: [inventory: InventoryDetailsDto];
}>();

const sortMode = ref<"name" | "email">("name");
const userDraft = ref<string | AutocompleteOptionDto>("");
const userSuggestions = ref<AutocompleteOptionDto[]>([]);
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

async function revokeAccess(user: InventoryAccessUserDto) {
  loading.value = true;
  errorMessage.value = null;

  try {
    await revokeInventoryAccess(props.inventory.id, user.userId, props.inventory.version);
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
        <h2>Public write access</h2>
        <p class="muted">
          When enabled, every authenticated user can add and edit items in this inventory.
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
          <h2>Individual access</h2>
          <span class="muted">Grant write access by username or email</span>
        </div>
        <SelectButton v-model="sortMode" :options="sortOptions" option-label="label" option-value="value" />
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
        <Button icon="pi pi-plus" label="Grant" :loading="loading" @click="grantAccess()" />
      </div>

      <DataTable :value="sortedUsers" data-key="userId" striped-rows table-style="min-width: 42rem">
        <template #empty>No individual access grants.</template>
        <Column field="userName" header="Name" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="grantedAt" header="Granted" sortable>
          <template #body="{ data }">{{ formatDateTime(data.grantedAt) }}</template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <Button
              text
              rounded
              severity="danger"
              icon="pi pi-times"
              aria-label="Revoke access"
              :disabled="loading"
              @click="revokeAccess(data)"
            />
          </template>
        </Column>
      </DataTable>
    </section>
  </div>
</template>
