<script setup lang="ts">
import Message from "primevue/message";
import { getIdElementTypeLabel } from "@/entities/inventory/utils";
import type { InventoryDetailsDto } from "@/entities/inventory/types";

defineProps<{
  inventory: InventoryDetailsDto;
}>();
</script>

<template>
  <div class="definition-list">
    <div
      v-for="element in [...inventory.idFormatElements].sort((a, b) => a.order - b.order)"
      :key="element.id"
      class="definition-row"
    >
      <strong>{{ getIdElementTypeLabel(element.type) }}</strong>
      <span>{{ element.value ?? element.format ?? "Default formatting" }}</span>
    </div>
    <Message v-if="inventory.idFormatElements.length === 0" severity="info" :closable="false">
      No custom ID elements configured yet.
    </Message>
  </div>
</template>
