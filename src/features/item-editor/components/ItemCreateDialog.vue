<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Textarea from "primevue/textarea";
import { InventoryFieldType, type InventoryFieldDefinitionDto } from "@/entities/inventory/types";
import { createInventoryItem } from "@/entities/item/api";
import type { ItemFieldValueRequest } from "@/entities/item/types";
import { getFieldTypeLabel } from "@/entities/inventory/utils";

const visible = defineModel<boolean>("visible", { required: true });

const props = defineProps<{
  inventoryId: string;
  fields: InventoryFieldDefinitionDto[];
}>();

const emit = defineEmits<{
  created: [itemId: string];
}>();

type DraftValue = {
  textValue: string;
  numberValue: number | null;
  booleanValue: boolean;
};

const draft = reactive<Record<string, DraftValue>>({});
const loading = ref(false);
const errorMessage = ref<string | null>(null);

function fieldDraft(fieldId: string) {
  draft[fieldId] = draft[fieldId] ?? {
    textValue: "",
    numberValue: null,
    booleanValue: false
  };

  return draft[fieldId];
}

watch(
  () => [visible.value, props.fields] as const,
  () => {
    if (!visible.value) return;

    props.fields.forEach((field) => fieldDraft(field.id));
  },
  { immediate: true }
);

function toRequest(field: InventoryFieldDefinitionDto): ItemFieldValueRequest {
  const value = fieldDraft(field.id);

  if (field.type === InventoryFieldType.Number) {
    return {
      fieldId: field.id,
      textValue: null,
      numberValue: value.numberValue,
      booleanValue: null
    };
  }

  if (field.type === InventoryFieldType.Boolean) {
    return {
      fieldId: field.id,
      textValue: null,
      numberValue: null,
      booleanValue: value.booleanValue
    };
  }

  return {
    fieldId: field.id,
    textValue: value.textValue.trim() || null,
    numberValue: null,
    booleanValue: null
  };
}

function resetDraft() {
  Object.keys(draft).forEach((key) => {
    const value = fieldDraft(key);
    value.textValue = "";
    value.numberValue = null;
    value.booleanValue = false;
  });
  errorMessage.value = null;
}

async function submit() {
  loading.value = true;
  errorMessage.value = null;

  try {
    const itemId = await createInventoryItem(props.inventoryId, props.fields.map(toRequest));
    emit("created", itemId);
    visible.value = false;
    resetDraft();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to create item.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Add item"
    :style="{ width: 'min(44rem, calc(100vw - 2rem))' }"
  >
    <form class="form-stack" @submit.prevent="submit">
      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <Message v-if="fields.length === 0" severity="warn" :closable="false">
        This inventory has no custom fields. Custom ID must still be configured on the backend before
        an item can be created.
      </Message>

      <label v-for="field in fields" :key="field.id" class="field-stack">
        <span>{{ field.title }}</span>
        <small v-if="field.description" class="muted">{{ field.description }}</small>

        <InputNumber
          v-if="field.type === InventoryFieldType.Number"
          v-model="fieldDraft(field.id).numberValue"
          fluid
        />

        <div v-else-if="field.type === InventoryFieldType.Boolean" class="checkbox-row">
          <Checkbox v-model="fieldDraft(field.id).booleanValue" binary />
          <span>{{ getFieldTypeLabel(field.type) }}</span>
        </div>

        <Textarea
          v-else-if="field.type === InventoryFieldType.MultiLineText"
          v-model="fieldDraft(field.id).textValue"
          rows="4"
          auto-resize
        />

        <InputText
          v-else
          v-model="fieldDraft(field.id).textValue"
          :type="field.type === InventoryFieldType.Link ? 'url' : 'text'"
        />
      </label>

      <div class="dialog-actions">
        <Button type="button" label="Cancel" severity="secondary" outlined @click="visible = false" />
        <Button type="submit" icon="pi pi-check" label="Create item" :loading="loading" />
      </div>
    </form>
  </Dialog>
</template>
