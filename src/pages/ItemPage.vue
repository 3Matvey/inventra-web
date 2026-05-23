<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Message from "primevue/message";
import { getInventoryDetails } from "@/entities/inventory/api";
import { deleteInventoryItem, getItemDetails, likeItem, unlikeItem } from "@/entities/item/api";
import type { InventoryDetailsDto } from "@/entities/inventory/types";
import type { InventoryItemDetailsDto } from "@/entities/item/types";
import ItemDetailsPanel from "@/features/item-details/components/ItemDetailsPanel.vue";
import ItemEditorDialog from "@/features/item-editor/components/ItemEditorDialog.vue";
import { useCurrentUserStore } from "@/entities/user/stores/currentUser";

const props = defineProps<{
  itemId: string;
}>();

const router = useRouter();
const currentUser = useCurrentUserStore();
const item = ref<InventoryItemDetailsDto | null>(null);
const inventory = ref<InventoryDetailsDto | null>(null);
const loading = ref(true);
const likeLoading = ref(false);
const editVisible = ref(false);
const errorMessage = ref<string | null>(null);

const canManageInventory = computed(() => {
  if (!inventory.value || !currentUser.user) return false;
  return currentUser.isAdmin || inventory.value.owner.id === currentUser.user.id;
});

const canWriteItem = computed(() => {
  if (!inventory.value || !currentUser.user) return false;
  return (
    canManageInventory.value ||
    inventory.value.isPublicWriteAccess ||
    inventory.value.accessUsers.some((user) => user.userId === currentUser.user?.id)
  );
});

async function loadItem() {
  loading.value = true;
  errorMessage.value = null;

  try {
    item.value = await getItemDetails(props.itemId);
    inventory.value = await getInventoryDetails(item.value.inventoryId);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load item.";
  } finally {
    loading.value = false;
  }
}

async function deleteItem() {
  if (!item.value) return;

  try {
    await deleteInventoryItem(item.value.id, item.value.version);
    void router.push({ name: "inventory", params: { inventoryId: item.value.inventoryId } });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to delete item.";
  }
}

async function toggleLike() {
  if (!item.value) return;

  likeLoading.value = true;
  errorMessage.value = null;

  try {
    if (item.value.isLikedByCurrentUser) {
      await unlikeItem(item.value.id);
    } else {
      await likeItem(item.value.id);
    }

    item.value = await getItemDetails(props.itemId);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to update like.";
  } finally {
    likeLoading.value = false;
  }
}

onMounted(loadItem);
onMounted(() => {
  if (!currentUser.checked) void currentUser.load();
});
</script>

<template>
  <div class="page-stack">
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <Message v-if="loading" severity="info" :closable="false">Loading item...</Message>

    <ItemDetailsPanel
      v-if="item"
      :item="item"
      :like-loading="likeLoading"
      :can-write="canWriteItem"
      :can-like="currentUser.isAuthenticated"
      @toggle-like="toggleLike"
      @edit="editVisible = true"
      @delete="deleteItem"
    />

    <ItemEditorDialog
      v-if="item && inventory && canWriteItem"
      v-model:visible="editVisible"
      mode="edit"
      :inventory-id="inventory.id"
      :fields="inventory.fields"
      :item="item"
      @saved="loadItem"
    />
  </div>
</template>
