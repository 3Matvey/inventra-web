<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Message from "primevue/message";
import InventoryTable from "@/entities/inventory/components/InventoryTable.vue";
import { searchInventories } from "@/entities/inventory/api";
import type { InventoryTableRowDto } from "@/entities/inventory/types";
import { useI18n } from "@/shared/i18n/useI18n";

const route = useRoute();
const { t } = useI18n();
const inventories = ref<InventoryTableRowDto[]>([]);
const totalCount = ref(0);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const term = computed(() => (typeof route.query.term === "string" ? route.query.term : ""));
const tagId = computed(() => (typeof route.query.tagId === "string" ? route.query.tagId : null));

async function loadResults() {
  loading.value = true;
  errorMessage.value = null;

  try {
    const result = await searchInventories({
      term: term.value,
      tagId: tagId.value,
      page: 1,
      pageSize: 20
    });

    inventories.value = result.items;
    totalCount.value = result.totalCount;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Search failed.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadResults);
watch(() => route.fullPath, loadResults);
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <div>
        <p class="eyebrow">{{ t("search.eyebrow") }}</p>
        <h1>{{ term || tagId ? t("search.results") : t("search.all") }}</h1>
        <p class="muted">{{ totalCount }} {{ t("search.found") }}</p>
      </div>
    </section>

    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <section class="content-section">
      <InventoryTable
        :inventories="inventories"
        :loading="loading"
        empty-message="No inventories match this search."
      />
    </section>
  </div>
</template>
