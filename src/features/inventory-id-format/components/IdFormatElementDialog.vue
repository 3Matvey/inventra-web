<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Select from "primevue/select";
import type {
  InventoryDetailsDto,
  InventoryIdElementType,
  InventoryIdFormatElementDto
} from "@/entities/inventory/types";
import {
  addInventoryIdFormatElement,
  updateInventoryIdFormatElement
} from "@/entities/inventory/api";
import {
  defaultIdElementType,
  getFormatHint,
  idElementTypeOptions,
  needsValue,
  supportsFormat
} from "../model/idFormatOptions";

const visible = defineModel<boolean>("visible", { required: true });

const props = defineProps<{
  inventory: InventoryDetailsDto;
  element: InventoryIdFormatElementDto | null;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const type = ref<InventoryIdElementType>(defaultIdElementType);
const value = ref("");
const format = ref("");
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const isEditing = computed(() => props.element !== null);
const canSubmit = computed(() => !needsValue(type.value) || value.value.length > 0);

watch(
  () => [visible.value, props.element] as const,
  () => {
    if (!visible.value) return;

    type.value = props.element?.type ?? defaultIdElementType;
    value.value = props.element?.value ?? "";
    format.value = props.element?.format ?? "";
    errorMessage.value = null;
  },
  { immediate: true }
);

async function submit() {
  loading.value = true;
  errorMessage.value = null;

  try {
    if (props.element) {
      await updateInventoryIdFormatElement(props.inventory.id, props.element.id, {
        expectedVersion: props.inventory.version,
        value: needsValue(type.value) ? value.value : null,
        format: supportsFormat(type.value) ? format.value.trim() || null : null
      });
    } else {
      await addInventoryIdFormatElement(props.inventory.id, {
        expectedVersion: props.inventory.version,
        type: type.value,
        value: needsValue(type.value) ? value.value : null,
        format: supportsFormat(type.value) ? format.value.trim() || null : null
      });
    }

    emit("saved");
    visible.value = false;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to save ID format element.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEditing ? 'Edit ID element' : 'Add ID element'"
    :style="{ width: 'min(36rem, calc(100vw - 2rem))' }"
  >
    <form class="form-stack" @submit.prevent="submit">
      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <label class="field-stack">
        <span>Element type</span>
        <Select
          v-model="type"
          :options="idElementTypeOptions"
          option-label="label"
          option-value="value"
          :disabled="isEditing"
        />
      </label>

      <label v-if="needsValue(type)" class="field-stack">
        <span>Value</span>
        <InputText v-model="value" />
      </label>

      <label v-if="supportsFormat(type)" class="field-stack">
        <span>Format</span>
        <InputText v-model="format" :placeholder="getFormatHint(type)" />
        <small class="muted">{{ getFormatHint(type) }}</small>
      </label>

      <Message severity="info" :closable="false">
        Existing item IDs are not regenerated when the format changes. New and edited items use the
        current format rules.
      </Message>

      <div class="dialog-actions">
        <Button type="button" label="Cancel" severity="secondary" outlined @click="visible = false" />
        <Button type="submit" icon="pi pi-check" label="Save" :disabled="!canSubmit" :loading="loading" />
      </div>
    </form>
  </Dialog>
</template>
