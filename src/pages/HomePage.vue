<script setup lang="ts">
import { onMounted, ref } from "vue";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Button from "primevue/button";
import InventoryTable from "@/entities/inventory/components/InventoryTable.vue";
import {
  getLatestInventories,
  getTagCloud,
  getTopInventories
} from "@/entities/inventory/api";
import type { InventoryTableRowDto, TagCloudItemDto } from "@/entities/inventory/types";

const latest = ref<InventoryTableRowDto[]>([]);
const top = ref<InventoryTableRowDto[]>([]);
const tags = ref<TagCloudItemDto[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
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
});
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <div>
        <p class="eyebrow">Inventory management</p>
        <h1>Inventories</h1>
      </div>
      <Button icon="pi pi-plus" label="Create inventory" />
    </section>

    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <section class="content-section">
      <div class="section-heading">
        <h2>Latest inventories</h2>
      </div>
      <InventoryTable :inventories="latest" :loading="loading" />
    </section>

    <section class="content-section">
      <div class="section-heading">
        <h2>Top inventories</h2>
        <span class="muted">By item count</span>
      </div>
      <InventoryTable
        :inventories="top"
        :loading="loading"
        empty-message="No popular inventories yet."
      />
    </section>

    <section class="content-section">
      <div class="section-heading">
        <h2>Tag cloud</h2>
      </div>
      <div class="tag-cloud">
        <RouterLink
          v-for="tag in tags"
          :key="tag.id"
          :to="{ name: 'search', query: { tagId: tag.id } }"
        >
          <Tag :value="`${tag.name} ${tag.inventoriesCount}`" />
        </RouterLink>
        <span v-if="!loading && tags.length === 0" class="muted">No tags yet.</span>
      </div>
    </section>
  </div>
</template>
