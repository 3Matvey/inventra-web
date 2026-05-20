<script setup lang="ts">
import type { InventoryDetailsDto } from "@/entities/inventory/types";

defineProps<{
  inventory: InventoryDetailsDto;
}>();
</script>

<template>
  <div class="info-grid">
    <div>
      <span class="muted">Title</span>
      <strong>{{ inventory.title }}</strong>
    </div>
    <div>
      <span class="muted">Category</span>
      <strong>{{ inventory.category.name }}</strong>
    </div>
    <div>
      <span class="muted">Version</span>
      <strong>{{ inventory.version }}</strong>
    </div>
    <div>
      <span class="muted">Image public ID</span>
      <strong>{{ inventory.imagePublicId ?? "—" }}</strong>
    </div>
  </div>
</template>
