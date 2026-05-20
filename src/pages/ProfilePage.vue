<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Message from "primevue/message";
import CreateInventoryDialog from "@/features/inventory-create/components/CreateInventoryDialog.vue";
import ProfileInventoriesPanel from "@/features/profile-inventories/components/ProfileInventoriesPanel.vue";
import { useCurrentUserStore } from "@/entities/user/stores/currentUser";
import { useI18n } from "@/shared/i18n/useI18n";

const router = useRouter();
const currentUser = useCurrentUserStore();
const { t } = useI18n();
const createDialogVisible = ref(false);

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
        <h1>{{ currentUser.user?.userName ?? t("profile.title") }}</h1>
      </div>
    </section>

    <Message v-if="currentUser.checked && !currentUser.user" severity="warn" :closable="false">
      {{ t("profile.guest") }}
    </Message>

    <ProfileInventoriesPanel
      v-if="currentUser.user"
      :user-id="currentUser.user.id"
      @create="createDialogVisible = true"
    />

    <CreateInventoryDialog
      v-model:visible="createDialogVisible"
      @created="handleInventoryCreated"
    />
  </div>
</template>
