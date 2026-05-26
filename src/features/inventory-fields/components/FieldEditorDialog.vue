<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import type {
  InventoryDetailsDto,
  InventoryFieldDefinitionDto,
  InventoryFieldType
} from "@/entities/inventory/types";
import { addInventoryField, updateInventoryField } from "@/entities/inventory/api";
import { defaultFieldType, fieldTypeOptions } from "../model/fieldLimits";

const visible = defineModel<boolean>("visible", { required: true });

const props = defineProps<{
  inventory: InventoryDetailsDto;
  field: InventoryFieldDefinitionDto | null;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const type = ref<InventoryFieldType>(defaultFieldType);
const title = ref("");
const description = ref("");
const showInTable = ref(true);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const isEditing = computed(() => props.field !== null);
const canSubmit = computed(() => Boolean(title.value.trim()));

watch(
  () => [visible.value, props.field] as const,
  () => {
    if (!visible.value) return;

    type.value = props.field?.type ?? defaultFieldType;
    title.value = props.field?.title ?? "";
    description.value = props.field?.description ?? "";
    showInTable.value = props.field?.showInTable ?? true;
    errorMessage.value = null;
  },
  { immediate: true }
);

async function submit() {
  loading.value = true;
  errorMessage.value = null;

  try {
    if (props.field) {
      await updateInventoryField(props.inventory.id, props.field.id, {
        expectedVersion: props.inventory.version,
        title: title.value.trim(),
        description: description.value.trim() || null,
        showInTable: showInTable.value
      });
    } else {
      await addInventoryField(props.inventory.id, {
        expectedVersion: props.inventory.version,
        type: type.value,
        title: title.value.trim(),
        description: description.value.trim() || null,
        showInTable: showInTable.value
      });
    }

    emit("saved");
    visible.value = false;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to save field.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEditing ? 'Edit field' : 'Add field'"
    :style="{ width: 'min(36rem, calc(100vw - 2rem))' }"
  >
    <form class="form-stack" @submit.prevent="submit">
      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <label class="field-stack">
        <span>Type</span>
        <Select
          v-model="type"
          :options="fieldTypeOptions"
          option-label="label"
          option-value="value"
          :disabled="isEditing"
        />
      </label>

      <label class="field-stack">
        <span>Title</span>
        <InputText v-model="title" autofocus />
      </label>

      <label class="field-stack">
        <span>Description</span>
        <Textarea v-model="description" rows="3" auto-resize />
      </label>

      <label class="checkbox-row">
        <Checkbox v-model="showInTable" binary />
        <span>Show in item table</span>
      </label>

      <div class="dialog-actions">
        <Button type="button" label="Cancel" severity="secondary" outlined @click="visible = false" />
        <Button type="submit" icon="pi pi-check" label="Save" :disabled="!canSubmit" :loading="loading" />
      </div>
    </form>
  </Dialog>
</template>
