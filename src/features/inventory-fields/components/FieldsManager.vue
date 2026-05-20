<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import Button from "primevue/button";
import Message from "primevue/message";
import Tag from "primevue/tag";
import { getInventoryDetails, removeInventoryField, reorderInventoryFields } from "@/entities/inventory/api";
import type { InventoryDetailsDto, InventoryFieldDefinitionDto } from "@/entities/inventory/types";
import { getFieldTypeLabel } from "@/entities/inventory/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { fieldTypeOptions, maxFieldsPerType, countFieldsByType } from "../model/fieldLimits";
import FieldEditorDialog from "./FieldEditorDialog.vue";

const props = defineProps<{
  inventory: InventoryDetailsDto;
}>();

const emit = defineEmits<{
  updated: [inventory: InventoryDetailsDto];
}>();

const { t } = useI18n();
const selectedField = ref<InventoryFieldDefinitionDto | null>(null);
const editorVisible = ref(false);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const draggableFields = ref<InventoryFieldDefinitionDto[]>([]);

const orderedFields = computed(() =>
  [...props.inventory.fields].sort((left, right) => left.order - right.order)
);

watch(
  orderedFields,
  (fields) => {
    draggableFields.value = [...fields];
  },
  { immediate: true }
);

function openCreate() {
  selectedField.value = null;
  editorVisible.value = true;
}

function openEdit(field: InventoryFieldDefinitionDto) {
  selectedField.value = field;
  editorVisible.value = true;
}

async function reloadInventory() {
  emit("updated", await getInventoryDetails(props.inventory.id));
}

async function deleteField(field: InventoryFieldDefinitionDto) {
  loading.value = true;
  errorMessage.value = null;

  try {
    await removeInventoryField(props.inventory.id, field, props.inventory.version);
    await reloadInventory();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to delete field.";
  } finally {
    loading.value = false;
  }
}

async function moveField(field: InventoryFieldDefinitionDto, direction: -1 | 1) {
  const nextOrder = orderedFields.value.map((current) => current.id);
  const index = nextOrder.indexOf(field.id);
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= nextOrder.length) return;

  const currentId = nextOrder[index];
  const targetId = nextOrder[targetIndex];
  if (!currentId || !targetId) return;

  nextOrder[index] = targetId;
  nextOrder[targetIndex] = currentId;
  loading.value = true;
  errorMessage.value = null;

  try {
    await reorderInventoryFields(props.inventory.id, props.inventory.version, nextOrder);
    await reloadInventory();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to reorder fields.";
  } finally {
    loading.value = false;
  }
}

async function saveDraggedOrder() {
  const nextOrder = draggableFields.value.map((field) => field.id);
  const currentOrder = orderedFields.value.map((field) => field.id);
  if (nextOrder.join("|") === currentOrder.join("|")) return;

  loading.value = true;
  errorMessage.value = null;

  try {
    await reorderInventoryFields(props.inventory.id, props.inventory.version, nextOrder);
    await reloadInventory();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to reorder fields.";
    draggableFields.value = [...orderedFields.value];
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="manager-stack">
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <div class="section-heading">
      <div>
        <h2>{{ t("fields.title") }}</h2>
        <span class="muted">{{ t("fields.limit", { count: maxFieldsPerType }) }}</span>
      </div>
      <Button icon="pi pi-plus" :label="t('fields.add')" :disabled="loading" @click="openCreate" />
    </div>

    <div class="field-limit-row">
      <Tag
        v-for="option in fieldTypeOptions"
        :key="option.value"
        :value="`${option.label}: ${countFieldsByType(inventory.fields, option.value)}/${maxFieldsPerType}`"
        severity="secondary"
      />
    </div>

    <VueDraggable
      v-model="draggableFields"
      class="definition-list"
      handle=".drag-handle"
      :animation="180"
      ghost-class="drag-ghost"
      @end="saveDraggedOrder"
    >
      <div v-for="(field, index) in draggableFields" :key="field.id" class="field-editor-row">
        <i class="pi pi-bars drag-handle" aria-hidden="true" />
        <div class="field-editor-main">
          <strong>{{ field.title }}</strong>
          <span class="muted">
            {{ getFieldTypeLabel(field.type) }}
            · {{ field.showInTable ? "shown in item table" : "hidden from item table" }}
          </span>
          <span v-if="field.description">{{ field.description }}</span>
        </div>

        <div class="row-action-group">
          <Button
            text
            rounded
            icon="pi pi-arrow-up"
            aria-label="Move up"
            :disabled="index === 0 || loading"
            @click="moveField(field, -1)"
          />
          <Button
            text
            rounded
            icon="pi pi-arrow-down"
            aria-label="Move down"
            :disabled="index === orderedFields.length - 1 || loading"
            @click="moveField(field, 1)"
          />
          <Button text rounded icon="pi pi-pencil" aria-label="Edit" :disabled="loading" @click="openEdit(field)" />
          <Button
            text
            rounded
            severity="danger"
            icon="pi pi-trash"
            aria-label="Delete"
            :disabled="loading"
            @click="deleteField(field)"
          />
        </div>
      </div>

      <Message v-if="draggableFields.length === 0" severity="info" :closable="false">
        {{ t("fields.empty") }}
      </Message>
    </VueDraggable>

    <FieldEditorDialog
      v-model:visible="editorVisible"
      :inventory="inventory"
      :field="selectedField"
      @saved="reloadInventory"
    />
  </div>
</template>
