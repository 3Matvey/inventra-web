<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Button from "primevue/button";
import InventoryTable from "@/entities/inventory/components/InventoryTable.vue";
import CreateInventoryDialog from "@/features/inventory-create/components/CreateInventoryDialog.vue";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  getLatestInventories,
  getTagCloud,
  getTopInventories
} from "@/entities/inventory/api";
import type { InventoryTableRowDto, TagCloudItemDto } from "@/entities/inventory/types";

const router = useRouter();
const { t } = useI18n();
const latest = ref<InventoryTableRowDto[]>([]);
const top = ref<InventoryTableRowDto[]>([]);
const tags = ref<TagCloudItemDto[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);
const createDialogVisible = ref(false);

async function loadHome() {
  loading.value = true;
  errorMessage.value = null;

  try {
    const [latestResult, topResult, tagCloudResult] = await Promise.all([
      getLatestInventories(1, 10),
      getTopInventories(5),
      getTagCloud(30)
    ]);

    latest.value = latestResult.items;
    top.value = topResult;
    tags.value = tagCloudResult;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load inventories.";
  } finally {
    loading.value = false;
  }
}

function handleInventoryCreated(inventoryId: string) {
  void router.push({ name: "inventory", params: { inventoryId } });
}

onMounted(loadHome);
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <div>
        <p class="eyebrow">{{ t("home.eyebrow") }}</p>
        <h1>{{ t("home.title") }}</h1>
      </div>
      <Button icon="pi pi-plus" :label="t('home.create')" @click="createDialogVisible = true" />
    </section>

    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <section class="content-section">
      <div class="section-heading">
        <h2>{{ t("home.latest") }}</h2>
      </div>
      <InventoryTable :inventories="latest" :loading="loading" />
    </section>

    <section class="content-section">
      <div class="section-heading">
        <h2>{{ t("home.top") }}</h2>
        <span class="muted">{{ t("home.topHint") }}</span>
      </div>
      <InventoryTable
        :inventories="top"
        :loading="loading"
        empty-message="No popular inventories yet."
      />
    </section>

    <section class="content-section">
      <div class="section-heading">
        <h2>{{ t("home.tags") }}</h2>
      </div>
      <div class="tag-cloud">
        <RouterLink
          v-for="tag in tags"
          :key="tag.id"
          :to="{ name: 'search', query: { tagId: tag.id } }"
        >
          <Tag :value="`${tag.name} ${tag.inventoriesCount}`" />
        </RouterLink>
        <span v-if="!loading && tags.length === 0" class="muted">{{ t("home.noTags") }}</span>
      </div>
    </section>

    <CreateInventoryDialog
      v-model:visible="createDialogVisible"
      @created="handleInventoryCreated"
    />
  </div>
</template>
