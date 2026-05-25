<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import Button from "primevue/button";
import Message from "primevue/message";
import Tag from "primevue/tag";
import {
  getInventoryDetails,
  previewInventoryCustomId,
  removeInventoryIdFormatElement,
  reorderInventoryIdFormatElements
} from "@/entities/inventory/api";
import type { InventoryDetailsDto, InventoryIdFormatElementDto } from "@/entities/inventory/types";
import { getIdElementTypeLabel } from "@/entities/inventory/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  getFormatHint,
  recommendedMaxIdElements,
  sortIdElements
} from "../model/idFormatOptions";
import IdFormatElementDialog from "./IdFormatElementDialog.vue";

const props = defineProps<{
  inventory: InventoryDetailsDto;
}>();

const emit = defineEmits<{
  updated: [inventory: InventoryDetailsDto];
}>();

const { t } = useI18n();
const selectedElement = ref<InventoryIdFormatElementDto | null>(null);
const editorVisible = ref(false);
const preview = ref("");
const loading = ref(false);
const previewLoading = ref(false);
const errorMessage = ref<string | null>(null);
const draggableElements = ref<InventoryIdFormatElementDto[]>([]);
const discardedElements = ref<InventoryIdFormatElementDto[]>([]);

const orderedElements = computed(() => sortIdElements(props.inventory.idFormatElements));
const canAddElement = computed(() => orderedElements.value.length < recommendedMaxIdElements);

watch(
  orderedElements,
  (elements) => {
    draggableElements.value = [...elements];
  },
  { immediate: true }
);

function openCreate() {
  selectedElement.value = null;
  editorVisible.value = true;
}

function openEdit(element: InventoryIdFormatElementDto) {
  selectedElement.value = element;
  editorVisible.value = true;
}

async function loadPreview() {
  previewLoading.value = true;

  try {
    preview.value = await previewInventoryCustomId(props.inventory.id);
  } catch (error) {
    preview.value = "";
    errorMessage.value = error instanceof Error ? error.message : "Failed to load ID preview.";
  } finally {
    previewLoading.value = false;
  }
}

async function reloadInventory() {
  const nextInventory = await getInventoryDetails(props.inventory.id);
  emit("updated", nextInventory);
  await loadPreview();
}

async function deleteElement(element: InventoryIdFormatElementDto) {
  loading.value = true;
  errorMessage.value = null;

  try {
    await removeInventoryIdFormatElement(props.inventory.id, element, props.inventory.version);
    await reloadInventory();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to delete ID element.";
  } finally {
    loading.value = false;
  }
}

async function deleteDroppedElement() {
  const [element] = discardedElements.value;
  if (!element) return;

  discardedElements.value = [];
  await deleteElement(element);

  if (errorMessage.value) {
    draggableElements.value = [...orderedElements.value];
  }
}

async function moveElement(element: InventoryIdFormatElementDto, direction: -1 | 1) {
  const nextOrder = orderedElements.value.map((current) => current.id);
  const index = nextOrder.indexOf(element.id);
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
    await reorderInventoryIdFormatElements(props.inventory.id, props.inventory.version, nextOrder);
    await reloadInventory();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to reorder ID elements.";
  } finally {
    loading.value = false;
  }
}

async function saveDraggedOrder() {
  if (discardedElements.value.length > 0) return;

  const nextOrder = draggableElements.value.map((element) => element.id);
  const currentOrder = orderedElements.value.map((element) => element.id);
  if (nextOrder.length !== currentOrder.length) return;
  if (nextOrder.join("|") === currentOrder.join("|")) return;

  loading.value = true;
  errorMessage.value = null;

  try {
    await reorderInventoryIdFormatElements(props.inventory.id, props.inventory.version, nextOrder);
    await reloadInventory();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to reorder ID elements.";
    draggableElements.value = [...orderedElements.value];
  } finally {
    loading.value = false;
  }
}

onMounted(loadPreview);
watch(() => props.inventory.id, loadPreview);
</script>

<template>
  <div class="manager-stack">
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <div class="section-heading">
      <div>
        <h2>{{ t("idFormat.title") }}</h2>
        <span class="muted">{{ t("idFormat.limit", { count: recommendedMaxIdElements }) }}</span>
      </div>
      <Button icon="pi pi-plus" :label="t('idFormat.add')" :disabled="!canAddElement || loading" @click="openCreate" />
    </div>

    <div class="id-preview">
      <span class="muted">{{ t("idFormat.preview") }}</span>
      <strong>{{ previewLoading ? "Loading..." : preview || "No format configured" }}</strong>
    </div>

    <VueDraggable
      v-model="draggableElements"
      class="definition-list"
      handle=".drag-handle"
      :group="{ name: 'id-format-elements' }"
      :animation="180"
      ghost-class="drag-ghost"
      @end="saveDraggedOrder"
    >
      <div v-for="(element, index) in draggableElements" :key="element.id" class="field-editor-row">
        <i class="pi pi-bars drag-handle" aria-hidden="true" />
        <div class="field-editor-main">
          <strong>{{ getIdElementTypeLabel(element.type) }}</strong>
          <span class="muted">{{ getFormatHint(element.type) }}</span>
          <div class="tag-list">
            <Tag v-if="element.value" :value="`value: ${element.value}`" severity="secondary" />
            <Tag v-if="element.format" :value="`format: ${element.format}`" severity="secondary" />
          </div>
        </div>

        <div class="row-action-group">
          <Button
            text
            rounded
            icon="pi pi-arrow-up"
            aria-label="Move up"
            :disabled="index === 0 || loading"
            @click="moveElement(element, -1)"
          />
          <Button
            text
            rounded
            icon="pi pi-arrow-down"
            aria-label="Move down"
            :disabled="index === draggableElements.length - 1 || loading"
            @click="moveElement(element, 1)"
          />
          <Button text rounded icon="pi pi-pencil" aria-label="Edit" :disabled="loading" @click="openEdit(element)" />
          <Button
            text
            rounded
            severity="danger"
            icon="pi pi-trash"
            aria-label="Delete"
            :disabled="loading"
            @click="deleteElement(element)"
          />
        </div>
      </div>

      <Message v-if="draggableElements.length === 0" severity="warn" :closable="false">
        {{ t("idFormat.empty") }}
      </Message>
    </VueDraggable>

    <VueDraggable
      v-model="discardedElements"
      class="drag-delete-zone"
      :group="{ name: 'id-format-elements' }"
      :sort="false"
      :animation="180"
      @add="deleteDroppedElement"
    >
      <div class="drag-delete-zone-content">
        <i class="pi pi-trash" aria-hidden="true" />
        <div>
          <strong>Drop here to remove</strong>
          <span class="muted">Drag a Custom ID element outside the format list to delete it.</span>
        </div>
      </div>
    </VueDraggable>

    <IdFormatElementDialog
      v-model:visible="editorVisible"
      :inventory="inventory"
      :element="selectedElement"
      @saved="reloadInventory"
    />
  </div>
</template>
