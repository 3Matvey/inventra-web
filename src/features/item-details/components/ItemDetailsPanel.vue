<script setup lang="ts">
import Button from "primevue/button";
import Tag from "primevue/tag";
import { RouterLink } from "vue-router";
import { formatDateTime } from "@/shared/utils/date";
import { formatItemFieldValue } from "@/entities/item/utils";
import type { InventoryItemDetailsDto } from "@/entities/item/types";

defineProps<{
  item: InventoryItemDetailsDto;
  likeLoading: boolean;
}>();

const emit = defineEmits<{
  toggleLike: [];
}>();
</script>

<template>
  <section class="item-details">
    <div class="page-heading">
      <div>
        <p class="eyebrow">Item</p>
        <h1>{{ item.customId }}</h1>
      </div>
      <Button
        :icon="item.isLikedByCurrentUser ? 'pi pi-heart-fill' : 'pi pi-heart'"
        :label="`${item.likesCount} likes`"
        :loading="likeLoading"
        @click="emit('toggleLike')"
      />
    </div>

    <div class="info-grid">
      <div>
        <span class="muted">Inventory</span>
        <RouterLink :to="{ name: 'inventory', params: { inventoryId: item.inventoryId } }">
          <strong>{{ item.inventoryId }}</strong>
        </RouterLink>
      </div>
      <div>
        <span class="muted">Created by</span>
        <strong>{{ item.createdByUserName }}</strong>
      </div>
      <div>
        <span class="muted">Created</span>
        <strong>{{ formatDateTime(item.createdAt) }}</strong>
      </div>
      <div>
        <span class="muted">Version</span>
        <strong>{{ item.version }}</strong>
      </div>
    </div>

    <section class="content-section">
      <div class="section-heading">
        <h2>Field values</h2>
        <Tag :value="`${item.fieldValues.length} fields`" severity="secondary" />
      </div>

      <div class="definition-list">
        <div v-for="value in item.fieldValues" :key="value.fieldId" class="definition-row">
          <strong>{{ value.fieldTitle }}</strong>
          <span>{{ formatItemFieldValue(value) }}</span>
        </div>
        <span v-if="item.fieldValues.length === 0" class="muted">No custom field values.</span>
      </div>
    </section>
  </section>
</template>
