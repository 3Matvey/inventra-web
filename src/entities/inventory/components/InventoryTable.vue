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
  selectable?: boolean;
}>();

const router = useRouter();
const selectedInventories = defineModel<InventoryTableRowDto[]>("selection", { default: [] });

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
    v-model:selection="selectedInventories"
    @row-click="openInventory($event.data)"
  >
    <template #empty>{{ emptyMessage ?? "No inventories found." }}</template>

    <Column v-if="selectable" selection-mode="multiple" header-style="width: 3rem" />

    <Column field="title" header="Inventory" sortable>
      <template #body="{ data }">
        <div class="inventory-cell">
          <img
            v-if="data.imageUrl"
            class="inventory-cell-image"
            :src="data.imageUrl"
            :alt="data.title"
            loading="lazy"
          />
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
