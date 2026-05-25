<script setup lang="ts">
import Button from "primevue/button";
import Tag from "primevue/tag";
import { RouterLink } from "vue-router";
import { InventoryFieldType } from "@/entities/inventory/types";
import { formatDateTime } from "@/shared/utils/date";
import { formatItemFieldValue } from "@/entities/item/utils";
import type { InventoryItemDetailsDto, ItemFieldValueDto } from "@/entities/item/types";

defineProps<{
  item: InventoryItemDetailsDto;
  likeLoading: boolean;
  canWrite: boolean;
  canLike: boolean;
}>();

const emit = defineEmits<{
  toggleLike: [];
  edit: [];
  delete: [];
}>();

function getLinkUrl(value: ItemFieldValueDto) {
  const url = value.textValue?.trim();
  if (!url) return null;

  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}

function getLinkPreviewKind(url: string | null) {
  if (!url) return null;
  const path = new URL(url).pathname.toLowerCase();

  if (/\.(png|jpe?g|webp|gif|bmp|svg)$/.test(path)) return "image";
  if (path.endsWith(".pdf")) return "pdf";
  return null;
}
</script>

<template>
  <section class="item-details">
    <div class="page-heading">
      <div>
        <p class="eyebrow">Item</p>
        <h1>{{ item.customId }}</h1>
      </div>
      <div class="row-action-group">
        <Button v-if="canWrite" icon="pi pi-pencil" label="Edit" outlined @click="emit('edit')" />
        <Button
          v-if="canWrite"
          icon="pi pi-trash"
          label="Delete"
          severity="danger"
          outlined
          @click="emit('delete')"
        />
        <Button
          v-if="canLike"
          :icon="item.isLikedByCurrentUser ? 'pi pi-heart-fill' : 'pi pi-heart'"
          :label="`${item.likesCount} likes`"
          :loading="likeLoading"
          @click="emit('toggleLike')"
        />
        <Tag v-else :value="`${item.likesCount} likes`" severity="secondary" />
      </div>
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
          <div v-if="value.fieldType === InventoryFieldType.Link" class="link-preview-stack">
            <a
              v-if="getLinkUrl(value)"
              class="link-button"
              :href="getLinkUrl(value) ?? undefined"
              target="_blank"
              rel="noreferrer"
            >
              {{ formatItemFieldValue(value) }}
            </a>
            <span v-else>{{ formatItemFieldValue(value) }}</span>

            <img
              v-if="getLinkPreviewKind(getLinkUrl(value)) === 'image'"
              class="item-link-image-preview"
              :src="getLinkUrl(value) ?? undefined"
              :alt="value.fieldTitle"
              loading="lazy"
            />
            <iframe
              v-else-if="getLinkPreviewKind(getLinkUrl(value)) === 'pdf'"
              class="item-link-pdf-preview"
              :src="getLinkUrl(value) ?? undefined"
              :title="value.fieldTitle"
            />
          </div>
          <span v-else>{{ formatItemFieldValue(value) }}</span>
        </div>
        <span v-if="item.fieldValues.length === 0" class="muted">No custom field values.</span>
      </div>
    </section>
  </section>
</template>
