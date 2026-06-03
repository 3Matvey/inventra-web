<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Message from "primevue/message";
import CreateInventoryDialog from "@/features/inventory-create/components/CreateInventoryDialog.vue";
import ProfileInventoriesPanel from "@/features/profile-inventories/components/ProfileInventoriesPanel.vue";
import SalesforceCustomerDialog from "@/features/salesforce-customer/components/SalesforceCustomerDialog.vue";
import { useCurrentUserStore } from "@/entities/user/stores/currentUser";
import { useI18n } from "@/shared/i18n/useI18n";

const router = useRouter();
const currentUser = useCurrentUserStore();
const { t } = useI18n();
const createDialogVisible = ref(false);
const salesforceDialogVisible = ref(false);

const profileUser = computed(() => currentUser.user);
const canCreateSalesforceCustomer = computed(() => {
  if (!currentUser.user || !profileUser.value) return false;
  return currentUser.isAdmin || currentUser.user.id === profileUser.value.id;
});

onMounted(async () => {
  if (!currentUser.checked) {
    await currentUser.load();
  }
});

function handleInventoryCreated(inventoryId: string) {
  void router.push({ name: "inventory", params: { inventoryId } });
}
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <div>
        <p class="eyebrow">{{ t("profile.eyebrow") }}</p>
        <h1>{{ profileUser?.userName ?? t("profile.title") }}</h1>
      </div>
      <Button
        v-if="profileUser && canCreateSalesforceCustomer"
        icon="pi pi-cloud-upload"
        :label="t('salesforce.create')"
        @click="salesforceDialogVisible = true"
      />
    </section>

    <Message v-if="currentUser.checked && !currentUser.user" severity="warn" :closable="false">
      {{ t("profile.guest") }}
    </Message>

    <ProfileInventoriesPanel
      v-if="profileUser"
      :user-id="profileUser.id"
      @create="createDialogVisible = true"
    />

    <CreateInventoryDialog
      v-model:visible="createDialogVisible"
      @created="handleInventoryCreated"
    />

    <SalesforceCustomerDialog
      v-if="profileUser"
      v-model:visible="salesforceDialogVisible"
      :profile-user="profileUser"
    />
  </div>
</template>
