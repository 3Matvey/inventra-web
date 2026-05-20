<script setup lang="ts">
import { computed } from "vue";
import Badge from "primevue/badge";
import Tag from "primevue/tag";
import type { InventoryDetailsDto } from "@/entities/inventory/types";

const props = defineProps<{
  inventory: InventoryDetailsDto;
  itemsCount: number;
}>();

const visibleFieldsCount = computed(
  () => props.inventory.fields.filter((field) => field.showInTable).length
);
</script>

<template>
  <section class="inventory-hero">
    <img
      v-if="inventory.imageUrl"
      class="inventory-image"
      :src="inventory.imageUrl"
      :alt="inventory.title"
    />
    <div class="inventory-summary">
      <div class="inventory-heading-line">
        <p class="eyebrow">{{ inventory.category.name }}</p>
        <Badge
          :value="inventory.isPublicWriteAccess ? 'Public write' : 'Restricted write'"
          :severity="inventory.isPublicWriteAccess ? 'success' : 'secondary'"
        />
      </div>
      <h1>{{ inventory.title }}</h1>
      <p v-if="inventory.descriptionMarkdown" class="inventory-description">
        {{ inventory.descriptionMarkdown }}
      </p>
      <div class="inventory-meta">
        <span><i class="pi pi-user" /> {{ inventory.owner.userName }}</span>
        <span><i class="pi pi-database" /> {{ itemsCount }} items</span>
        <span><i class="pi pi-sliders-h" /> {{ inventory.fields.length }} fields</span>
        <span><i class="pi pi-eye" /> {{ visibleFieldsCount }} shown in table</span>
      </div>
      <div class="tag-list">
        <Tag v-for="tag in inventory.tags" :key="tag.id" :value="tag.name" />
      </div>
    </div>
  </section>
</template>
