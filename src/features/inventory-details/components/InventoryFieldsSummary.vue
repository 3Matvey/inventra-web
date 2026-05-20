<script setup lang="ts">
import Message from "primevue/message";
import { getFieldTypeLabel } from "@/entities/inventory/utils";
import type { InventoryDetailsDto } from "@/entities/inventory/types";

defineProps<{
  inventory: InventoryDetailsDto;
}>();
</script>

<template>
  <div class="definition-list">
    <div
      v-for="field in [...inventory.fields].sort((a, b) => a.order - b.order)"
      :key="field.id"
      class="definition-row"
    >
      <strong>{{ field.title }}</strong>
      <span>
        {{ getFieldTypeLabel(field.type) }}
        · {{ field.showInTable ? "shown in item table" : "hidden from item table" }}
      </span>
    </div>
    <Message v-if="inventory.fields.length === 0" severity="info" :closable="false">
      No custom fields configured yet.
    </Message>
  </div>
</template>
