<script setup lang="ts">
import { onMounted, ref } from "vue";
import Message from "primevue/message";
import { getItemDetails, likeItem, unlikeItem } from "@/entities/item/api";
import type { InventoryItemDetailsDto } from "@/entities/item/types";
import ItemDetailsPanel from "@/features/item-details/components/ItemDetailsPanel.vue";

const props = defineProps<{
  itemId: string;
}>();

const item = ref<InventoryItemDetailsDto | null>(null);
const loading = ref(true);
const likeLoading = ref(false);
const errorMessage = ref<string | null>(null);

async function loadItem() {
  loading.value = true;
  errorMessage.value = null;

  try {
    item.value = await getItemDetails(props.itemId);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load item.";
  } finally {
    loading.value = false;
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
      @toggle-like="toggleLike"
    />
  </div>
</template>
