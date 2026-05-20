<script setup lang="ts">
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Tag from "primevue/tag";
import { RouterLink, useRouter } from "vue-router";
import { formatDateTime } from "@/shared/utils/date";
import type { InventoryTableRowDto } from "../types";

defineProps<{
  inventories: InventoryTableRowDto[];
  loading?: boolean;
  emptyMessage?: string;
}>();

const router = useRouter();

function openInventory(inventory: InventoryTableRowDto) {
  void router.push({ name: "inventory", params: { inventoryId: inventory.id } });
}
</script>

<template>
  <DataTable
    :value="inventories"
    :loading="loading"
    data-key="id"
    striped-rows
    table-style="min-width: 56rem"
    selection-mode="single"
    @row-click="openInventory($event.data)"
  >
    <template #empty>{{ emptyMessage ?? "No inventories found." }}</template>

    <Column field="title" header="Inventory" sortable>
      <template #body="{ data }">
        <div class="table-primary-cell">
          <RouterLink
            class="link-button"
            :to="{ name: 'inventory', params: { inventoryId: data.id } }"
            @click.stop="openInventory(data)"
          >
            {{ data.title }}
          </RouterLink>
          <span v-if="data.descriptionMarkdown" class="muted ellipsis">
            {{ data.descriptionMarkdown }}
          </span>
        </div>
      </template>
    </Column>

    <Column field="categoryName" header="Category" sortable />
    <Column field="ownerName" header="Owner" sortable />
    <Column field="itemsCount" header="Items" sortable />

    <Column header="Tags">
      <template #body="{ data }">
        <div class="tag-list">
          <Tag v-for="tag in data.tags" :key="tag.id" :value="tag.name" severity="secondary" />
        </div>
      </template>
    </Column>

    <Column field="createdAt" header="Created" sortable>
      <template #body="{ data }">{{ formatDateTime(data.createdAt) }}</template>
    </Column>
  </DataTable>
</template>
