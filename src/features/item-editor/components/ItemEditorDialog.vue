<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Textarea from "primevue/textarea";
import { InventoryFieldType, type InventoryFieldDefinitionDto } from "@/entities/inventory/types";
import { createInventoryItem, updateInventoryItem } from "@/entities/item/api";
import type { InventoryItemDetailsDto } from "@/entities/item/types";
import { getFieldTypeLabel } from "@/entities/inventory/utils";
import {
  createItemDraft,
  ensureFieldDraft,
  fillDraftFromItem,
  toFieldValueRequest
} from "../model/itemDraft";

const visible = defineModel<boolean>("visible", { required: true });

const props = defineProps<{
  mode: "create" | "edit";
  inventoryId: string;
  fields: InventoryFieldDefinitionDto[];
  item?: InventoryItemDetailsDto | null;
}>();

const emit = defineEmits<{
  saved: [itemId: string | null];
}>();

const customId = ref("");
const draft = createItemDraft();
const loading = ref(false);
const errorMessage = ref<string | null>(null);

watch(
  () => [visible.value, props.fields, props.item] as const,
  () => {
    if (!visible.value) return;

    customId.value = props.item?.customId ?? "";
    fillDraftFromItem(draft, props.fields, props.item ?? null);
    errorMessage.value = null;
  },
  { immediate: true }
);

async function submit() {
  loading.value = true;
  errorMessage.value = null;

  try {
    const values = props.fields.map((field) => toFieldValueRequest(draft, field));
    const itemId = await save(values);
    emit("saved", itemId);
    visible.value = false;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to save item.";
  } finally {
    loading.value = false;
  }
}

async function save(values: ReturnType<typeof toFieldValueRequest>[]) {
  if (props.mode === "create") {
    return await createInventoryItem(props.inventoryId, values);
  }

  if (!props.item) throw new Error("Item is required for edit mode.");
  await updateInventoryItem(props.item.id, props.item.version, customId.value.trim(), values);
  return props.item.id;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="mode === 'create' ? 'Add item' : 'Edit item'"
    :style="{ width: 'min(44rem, calc(100vw - 2rem))' }"
  >
    <form class="form-stack" @submit.prevent="submit">
      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <label v-if="mode === 'edit'" class="field-stack">
        <span>Custom ID</span>
        <InputText v-model="customId" />
      </label>

      <Message v-if="fields.length === 0" severity="warn" :closable="false">
        This inventory has no custom fields. Custom ID must still be configured before item creation.
      </Message>

      <label v-for="field in fields" :key="field.id" class="field-stack">
        <span>{{ field.title }}</span>
        <small v-if="field.description" class="muted">{{ field.description }}</small>

        <InputNumber
          v-if="field.type === InventoryFieldType.Number"
          v-model="ensureFieldDraft(draft, field.id).numberValue"
          fluid
        />

        <div v-else-if="field.type === InventoryFieldType.Boolean" class="checkbox-row">
          <Checkbox v-model="ensureFieldDraft(draft, field.id).booleanValue" binary />
          <span>{{ getFieldTypeLabel(field.type) }}</span>
        </div>

        <Textarea
          v-else-if="field.type === InventoryFieldType.MultiLineText"
          v-model="ensureFieldDraft(draft, field.id).textValue"
          rows="4"
          auto-resize
        />

        <InputText
          v-else
          v-model="ensureFieldDraft(draft, field.id).textValue"
          :type="field.type === InventoryFieldType.Link ? 'url' : 'text'"
        />
      </label>

      <div class="dialog-actions">
        <Button type="button" label="Cancel" severity="secondary" outlined @click="visible = false" />
        <Button type="submit" icon="pi pi-check" label="Save item" :loading="loading" />
      </div>
    </form>
  </Dialog>
</template>
