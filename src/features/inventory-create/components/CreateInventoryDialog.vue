<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AutoComplete, { type AutoCompleteCompleteEvent } from "primevue/autocomplete";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import { getCategories } from "@/entities/category/api";
import { autocompleteTags } from "@/entities/tag/api";
import type { AutocompleteOptionDto } from "@/entities/tag/types";
import type { CategoryDto } from "@/entities/inventory/types";
import { createInventory, uploadInventoryImage } from "../api";

const visible = defineModel<boolean>("visible", { required: true });

const emit = defineEmits<{
  created: [inventoryId: string];
}>();

const categories = ref<CategoryDto[]>([]);
const categoryId = ref<string | null>(null);
const title = ref("");
const descriptionMarkdown = ref("");
const imageUrl = ref<string | null>(null);
const imagePublicId = ref<string | null>(null);
const tagDraft = ref<string | AutocompleteOptionDto>("");
const tagSuggestions = ref<AutocompleteOptionDto[]>([]);
const tags = ref<string[]>([]);
const loading = ref(false);
const uploadLoading = ref(false);
const errorMessage = ref<string | null>(null);

const canSubmit = computed(() => Boolean(categoryId.value && title.value.trim()));

watch(visible, async (nextVisible) => {
  if (!nextVisible || categories.value.length > 0) return;

  try {
    categories.value = await getCategories();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load categories.";
  }
});

function resetForm() {
  categoryId.value = null;
  title.value = "";
  descriptionMarkdown.value = "";
  imageUrl.value = null;
  imagePublicId.value = null;
  tagDraft.value = "";
  tagSuggestions.value = [];
  tags.value = [];
  errorMessage.value = null;
}

async function searchTags(event: AutoCompleteCompleteEvent) {
  tagSuggestions.value = await autocompleteTags(event.query, 10);
}

function normalizeTag(value: string | AutocompleteOptionDto) {
  return typeof value === "string" ? value.trim() : value.label.trim();
}

function addTag(value = tagDraft.value) {
  const tag = normalizeTag(value);

  if (tag && !tags.value.some((current) => current.toLowerCase() === tag.toLowerCase())) {
    tags.value = [...tags.value, tag];
  }

  tagDraft.value = "";
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((current) => current !== tag);
}

async function handleImageSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploadLoading.value = true;
  errorMessage.value = null;

  try {
    const uploaded = await uploadInventoryImage(file);
    imageUrl.value = uploaded.url;
    imagePublicId.value = uploaded.publicId;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to upload image.";
  } finally {
    uploadLoading.value = false;
    input.value = "";
  }
}

async function submit() {
  if (!categoryId.value) return;

  loading.value = true;
  errorMessage.value = null;

  try {
    const inventoryId = await createInventory({
      categoryId: categoryId.value,
      title: title.value.trim(),
      descriptionMarkdown: descriptionMarkdown.value.trim() || null,
      imageUrl: imageUrl.value,
      imagePublicId: imagePublicId.value,
      tags: tags.value
    });

    emit("created", inventoryId);
    visible.value = false;
    resetForm();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to create inventory.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Create inventory"
    class="inventory-dialog"
    :style="{ width: 'min(44rem, calc(100vw - 2rem))' }"
  >
    <form class="form-stack" @submit.prevent="submit">
      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <label class="field-stack">
        <span>Title</span>
        <InputText v-model="title" autofocus />
      </label>

      <label class="field-stack">
        <span>Category</span>
        <Select
          v-model="categoryId"
          :options="categories"
          option-label="name"
          option-value="id"
          placeholder="Select category"
        />
      </label>

      <label class="field-stack">
        <span>Description</span>
        <Textarea v-model="descriptionMarkdown" rows="5" auto-resize />
      </label>

      <div class="field-stack">
        <span>Image</span>
        <div class="upload-row">
          <input type="file" accept="image/*" :disabled="uploadLoading" @change="handleImageSelected" />
          <img v-if="imageUrl" class="upload-preview" :src="imageUrl" alt="Inventory image preview" />
        </div>
      </div>

      <div class="field-stack">
        <span>Tags</span>
        <div class="tag-input-row">
          <AutoComplete
            v-model="tagDraft"
            :suggestions="tagSuggestions"
            option-label="label"
            placeholder="Start typing a tag"
            @complete="searchTags"
            @option-select="addTag($event.value)"
          />
          <Button type="button" icon="pi pi-plus" label="Add" outlined @click="addTag()" />
        </div>
        <div class="tag-list">
          <Tag
            v-for="tag in tags"
            :key="tag"
            :value="tag"
            icon="pi pi-times"
            class="clickable-tag"
            @click="removeTag(tag)"
          />
        </div>
      </div>

      <div class="dialog-actions">
        <Button type="button" label="Cancel" severity="secondary" outlined @click="visible = false" />
        <Button type="submit" icon="pi pi-check" label="Create" :disabled="!canSubmit" :loading="loading" />
      </div>
    </form>
  </Dialog>
</template>
