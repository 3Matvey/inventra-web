<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from "primevue/datatable";
import Tag from "primevue/tag";
import Toolbar from "primevue/toolbar";
import { formatDateTime } from "@/shared/utils/date";
import type { InventoryFieldDefinitionDto } from "@/entities/inventory/types";
import type { InventoryItemTableRowDto } from "../types";
import { formatItemFieldValue } from "../utils";

const props = defineProps<{
  items: InventoryItemTableRowDto[];
  fields: InventoryFieldDefinitionDto[];
  loading?: boolean;
  totalRecords: number;
  page: number;
  pageSize: number;
}>();

const emit = defineEmits<{
  add: [];
  page: [page: number, pageSize: number];
  sort: [sortBy: string | null, sortDescending: boolean];
}>();

const router = useRouter();
const selectedItems = ref<InventoryItemTableRowDto[]>([]);

const tableFields = computed(() =>
  props.fields
    .filter((field) => field.showInTable)
    .sort((left, right) => left.order - right.order)
);

watch(
  () => props.items,
  () => {
    selectedItems.value = [];
  }
);

function getFieldValue(item: InventoryItemTableRowDto, fieldId: string) {
  const value = item.fieldValues.find((fieldValue) => fieldValue.fieldId === fieldId);
  return value ? formatItemFieldValue(value) : "—";
}

function openItem(item: InventoryItemTableRowDto) {
  void router.push({ name: "item", params: { itemId: item.id } });
}

function handlePage(event: DataTablePageEvent) {
  emit("page", event.page + 1, event.rows);
}

function handleSort(event: DataTableSortEvent) {
  emit("sort", String(event.sortField ?? "") || null, event.sortOrder === -1);
}
</script>

<template>
  <div class="table-with-toolbar">
    <Toolbar>
      <template #start>
        <div class="toolbar-selection">
          <Tag :value="`${selectedItems.length} selected`" severity="secondary" />
        </div>
      </template>
      <template #end>
        <Button icon="pi pi-plus" label="Add item" @click="emit('add')" />
        <Button
          icon="pi pi-trash"
          label="Delete selected"
          severity="danger"
          outlined
          :disabled="selectedItems.length === 0"
        />
      </template>
    </Toolbar>

    <DataTable
      v-model:selection="selectedItems"
      :value="items"
      :loading="loading"
      :total-records="totalRecords"
      :rows="pageSize"
      :first="(page - 1) * pageSize"
      data-key="id"
      lazy
      paginator
      striped-rows
      table-style="min-width: 64rem"
      @page="handlePage"
      @sort="handleSort"
      @row-click="openItem($event.data)"
    >
      <template #empty>No items in this inventory yet.</template>

      <Column selection-mode="multiple" header-style="width: 3rem" />
      <Column field="customId" header="Custom ID" sortable>
        <template #body="{ data }">
          <Button
            class="link-button"
            link
            :label="data.customId"
            @click.stop="openItem(data)"
          />
        </template>
      </Column>
      <Column field="createdByUserName" header="Created by" sortable />
      <Column field="likesCount" header="Likes" sortable />

      <Column
        v-for="field in tableFields"
        :key="field.id"
        :field="field.id"
        :header="field.title"
        sortable
      >
        <template #body="{ data }">
          {{ getFieldValue(data, field.id) }}
        </template>
      </Column>

      <Column field="createdAt" header="Created" sortable>
        <template #body="{ data }">{{ formatDateTime(data.createdAt) }}</template>
      </Column>
    </DataTable>
  </div>
</template>
