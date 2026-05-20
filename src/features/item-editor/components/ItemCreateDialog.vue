<script setup lang="ts">
import type { InventoryFieldDefinitionDto } from "@/entities/inventory/types";
import ItemEditorDialog from "./ItemEditorDialog.vue";

const visible = defineModel<boolean>("visible", { required: true });

defineProps<{
  inventoryId: string;
  fields: InventoryFieldDefinitionDto[];
}>();

const emit = defineEmits<{
  created: [itemId: string];
}>();
</script>

<template>
  <ItemEditorDialog
    v-model:visible="visible"
    mode="create"
    :inventory-id="inventoryId"
    :fields="fields"
    @saved="emit('created', $event ?? '')"
  />
</template>
