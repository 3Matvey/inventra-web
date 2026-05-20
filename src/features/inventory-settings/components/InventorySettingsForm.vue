<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import AutoComplete, { type AutoCompleteCompleteEvent } from "primevue/autocomplete";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import { getCategories } from "@/entities/category/api";
import { getInventoryDetails, updateInventoryTags } from "@/entities/inventory/api";
import type { CategoryDto, InventoryDetailsDto } from "@/entities/inventory/types";
import { autocompleteTags } from "@/entities/tag/api";
import type { AutocompleteOptionDto } from "@/entities/tag/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { uploadInventoryImage } from "../api";
import { useInventorySettingsAutosave } from "../model/useInventorySettingsAutosave";

const props = defineProps<{
  inventory: InventoryDetailsDto;
}>();

const emit = defineEmits<{
  updated: [inventory: InventoryDetailsDto];
}>();

const { t } = useI18n();
const categories = ref<CategoryDto[]>([]);
const uploadLoading = ref(false);
const tagLoading = ref(false);
const tagDraft = ref<string | AutocompleteOptionDto>("");
const tagSuggestions = ref<AutocompleteOptionDto[]>([]);
const tagNames = ref(props.inventory.tags.map((tag) => tag.name));
const currentInventory = computed(() => props.inventory);

const draft = reactive({
  title: props.inventory.title,
  categoryId: props.inventory.category.id,
  descriptionMarkdown: props.inventory.descriptionMarkdown ?? "",
  imageUrl: props.inventory.imageUrl,
  imagePublicId: props.inventory.imagePublicId
});

const autosave = useInventorySettingsAutosave(
  currentInventory,
  draft,
  (nextInventory) => emit("updated", nextInventory)
);

watch(
  () => props.inventory,
  (inventory) => {
    draft.title = inventory.title;
    draft.categoryId = inventory.category.id;
    draft.descriptionMarkdown = inventory.descriptionMarkdown ?? "";
    draft.imageUrl = inventory.imageUrl;
    draft.imagePublicId = inventory.imagePublicId;
    tagNames.value = inventory.tags.map((tag) => tag.name);
  }
);

async function loadCategories() {
  if (categories.value.length > 0) return;
  categories.value = await getCategories();
}

async function handleImageSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploadLoading.value = true;

  try {
    const uploaded = await uploadInventoryImage(file);
    draft.imageUrl = uploaded.url;
    draft.imagePublicId = uploaded.publicId;
  } finally {
    uploadLoading.value = false;
    input.value = "";
  }
}

async function searchTags(event: AutoCompleteCompleteEvent) {
  tagSuggestions.value = await autocompleteTags(event.query, 10);
}

function normalizeTag(value: string | AutocompleteOptionDto) {
  return typeof value === "string" ? value.trim() : value.label.trim();
}

async function refreshInventory() {
  emit("updated", await getInventoryDetails(props.inventory.id));
}

async function saveTags(nextTags: string[]) {
  tagLoading.value = true;

  try {
    await updateInventoryTags(props.inventory.id, props.inventory.version, nextTags);
    await refreshInventory();
  } finally {
    tagLoading.value = false;
  }
}

async function addTag(value = tagDraft.value) {
  const tag = normalizeTag(value);
  tagDraft.value = "";

  if (!tag || tagNames.value.some((current) => current.toLowerCase() === tag.toLowerCase())) return;
  await saveTags([...tagNames.value, tag]);
}

async function removeTag(tag: string) {
  await saveTags(tagNames.value.filter((current) => current !== tag));
}

void loadCategories();
</script>

<template>
  <div class="manager-stack">
    <Message v-if="autosave.errorMessage.value" severity="error" :closable="false">
      {{ autosave.errorMessage.value }}
    </Message>

    <div class="settings-save-row">
      <Tag
        :value="autosave.status.value"
        :severity="autosave.status.value === 'error' ? 'danger' : 'secondary'"
      />
      <Button
        icon="pi pi-save"
        :label="t('settings.saveNow')"
        :loading="autosave.status.value === 'saving'"
        :disabled="!autosave.canSave.value"
        @click="autosave.save"
      />
    </div>

    <div class="form-grid">
      <label class="field-stack">
        <span>Title</span>
        <InputText v-model="draft.title" />
      </label>

      <label class="field-stack">
        <span>Category</span>
        <Select v-model="draft.categoryId" :options="categories" option-label="name" option-value="id" />
      </label>
    </div>

    <label class="field-stack">
      <span>Description</span>
      <Textarea v-model="draft.descriptionMarkdown" rows="6" auto-resize />
    </label>

    <div class="field-stack">
      <span>Image</span>
      <div class="upload-row">
        <input type="file" accept="image/*" :disabled="uploadLoading" @change="handleImageSelected" />
        <img v-if="draft.imageUrl" class="upload-preview" :src="draft.imageUrl" alt="Inventory image preview" />
      </div>
    </div>

    <div class="field-stack">
      <span>Tags</span>
      <div class="tag-input-row">
        <AutoComplete
          v-model="tagDraft"
          :suggestions="tagSuggestions"
          option-label="label"
          :placeholder="t('settings.tagPlaceholder')"
          :disabled="tagLoading"
          @complete="searchTags"
          @option-select="addTag($event.value)"
        />
        <Button
          type="button"
          icon="pi pi-plus"
          :label="t('settings.addTag')"
          :loading="tagLoading"
          outlined
          @click="addTag()"
        />
      </div>
      <div class="tag-list">
        <Tag
          v-for="tag in tagNames"
          :key="tag"
          :value="tag"
          icon="pi pi-times"
          class="clickable-tag"
          @click="removeTag(tag)"
        />
      </div>
    </div>
  </div>
</template>
