<script setup lang="ts">
import { onMounted, ref } from "vue";
import Message from "primevue/message";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import ItemsTable from "@/entities/item/components/ItemsTable.vue";
import { getInventoryDetails } from "@/entities/inventory/api";
import {
  deleteInventoryItem,
  getInventoryItems,
  getInventoryStatistics,
  getItemDetails
} from "@/entities/item/api";
import type { InventoryDetailsDto } from "@/entities/inventory/types";
import type {
  InventoryItemDetailsDto,
  InventoryItemTableRowDto,
  InventoryStatisticsDto
} from "@/entities/item/types";
import DiscussionTab from "@/features/comments/components/DiscussionTab.vue";
import InventoryHero from "@/features/inventory-details/components/InventoryHero.vue";
import InventoryStatisticsPanel from "@/features/inventory-details/components/InventoryStatisticsPanel.vue";
import AccessManager from "@/features/inventory-access/components/AccessManager.vue";
import FieldsManager from "@/features/inventory-fields/components/FieldsManager.vue";
import IdFormatManager from "@/features/inventory-id-format/components/IdFormatManager.vue";
import InventorySettingsForm from "@/features/inventory-settings/components/InventorySettingsForm.vue";
import ItemCreateDialog from "@/features/item-editor/components/ItemCreateDialog.vue";
import ItemEditorDialog from "@/features/item-editor/components/ItemEditorDialog.vue";
import { useI18n } from "@/shared/i18n/useI18n";

const props = defineProps<{
  inventoryId: string;
}>();

const { t } = useI18n();
const inventory = ref<InventoryDetailsDto | null>(null);
const statistics = ref<InventoryStatisticsDto | null>(null);
const items = ref<InventoryItemTableRowDto[]>([]);
const itemsTotal = ref(0);
const itemsPage = ref(1);
const itemsPageSize = ref(20);
const sortBy = ref<string | null>(null);
const sortDescending = ref(false);
const loading = ref(true);
const itemsLoading = ref(false);
const errorMessage = ref<string | null>(null);
const itemCreateVisible = ref(false);
const itemEditVisible = ref(false);
const editingItem = ref<InventoryItemDetailsDto | null>(null);

async function loadInventory() {
  loading.value = true;
  errorMessage.value = null;

  try {
    const [details, stats] = await Promise.all([
      getInventoryDetails(props.inventoryId),
      getInventoryStatistics(props.inventoryId)
    ]);

    inventory.value = details;
    statistics.value = stats;
    await loadItems();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load inventory.";
  } finally {
    loading.value = false;
  }
}

async function loadItems() {
  itemsLoading.value = true;

  try {
    const result = await getInventoryItems(props.inventoryId, {
      page: itemsPage.value,
      pageSize: itemsPageSize.value,
      sortBy: sortBy.value,
      sortDescending: sortDescending.value
    });

    items.value = result.items;
    itemsTotal.value = result.totalCount;
    itemsPage.value = result.page;
    itemsPageSize.value = result.pageSize;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load inventory items.";
  } finally {
    itemsLoading.value = false;
  }
}

function handleItemsPage(page: number, pageSize: number) {
  itemsPage.value = page;
  itemsPageSize.value = pageSize;
  void loadItems();
}

function handleItemsSort(nextSortBy: string | null, nextSortDescending: boolean) {
  sortBy.value = nextSortBy;
  sortDescending.value = nextSortDescending;
  itemsPage.value = 1;
  void loadItems();
}

async function handleItemCreated() {
  const [stats] = await Promise.all([
    getInventoryStatistics(props.inventoryId).then((result) => {
      statistics.value = result;
    }),
    loadItems()
  ]);

  return stats;
}

async function handleItemEditRequested(item: InventoryItemTableRowDto) {
  itemsLoading.value = true;
  errorMessage.value = null;

  try {
    editingItem.value = await getItemDetails(item.id);
    itemEditVisible.value = true;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load item for editing.";
  } finally {
    itemsLoading.value = false;
  }
}

async function handleItemsDeleteRequested(selectedItems: InventoryItemTableRowDto[]) {
  itemsLoading.value = true;
  errorMessage.value = null;

  try {
    await Promise.all(selectedItems.map((item) => deleteInventoryItem(item.id, item.version)));
    await handleItemCreated();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to delete selected items.";
  } finally {
    itemsLoading.value = false;
  }
}

function handleInventoryUpdated(nextInventory: InventoryDetailsDto) {
  inventory.value = nextInventory;
}

onMounted(loadInventory);
</script>

<template>
  <div class="page-stack">
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <InventoryHero
      v-if="inventory"
      :inventory="inventory"
      :items-count="statistics?.itemsCount ?? itemsTotal"
    />

    <section v-else-if="loading" class="content-section">
      <Message severity="info" :closable="false">Loading inventory...</Message>
    </section>

    <Tabs v-if="inventory" value="items">
      <TabList>
        <Tab value="items">{{ t("inventory.tabs.items") }}</Tab>
        <Tab value="discussion">{{ t("inventory.tabs.discussion") }}</Tab>
        <Tab value="settings">{{ t("inventory.tabs.settings") }}</Tab>
        <Tab value="id-format">{{ t("inventory.tabs.idFormat") }}</Tab>
        <Tab value="access">{{ t("inventory.tabs.access") }}</Tab>
        <Tab value="fields">{{ t("inventory.tabs.fields") }}</Tab>
        <Tab value="statistics">{{ t("inventory.tabs.statistics") }}</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="items">
          <ItemsTable
            :items="items"
            :fields="inventory.fields"
            :loading="itemsLoading"
            :total-records="itemsTotal"
            :page="itemsPage"
            :page-size="itemsPageSize"
            @add="itemCreateVisible = true"
            @edit="handleItemEditRequested"
            @delete="handleItemsDeleteRequested"
            @page="handleItemsPage"
            @sort="handleItemsSort"
          />
        </TabPanel>

        <TabPanel value="discussion">
          <DiscussionTab :inventory-id="inventory.id" />
        </TabPanel>

        <TabPanel value="settings">
          <InventorySettingsForm :inventory="inventory" @updated="handleInventoryUpdated" />
        </TabPanel>

        <TabPanel value="id-format">
          <IdFormatManager :inventory="inventory" @updated="handleInventoryUpdated" />
        </TabPanel>

        <TabPanel value="access">
          <AccessManager :inventory="inventory" @updated="handleInventoryUpdated" />
        </TabPanel>

        <TabPanel value="fields">
          <FieldsManager :inventory="inventory" @updated="handleInventoryUpdated" />
        </TabPanel>

        <TabPanel value="statistics">
          <InventoryStatisticsPanel v-if="statistics" :statistics="statistics" />
        </TabPanel>
      </TabPanels>
    </Tabs>

    <ItemCreateDialog
      v-if="inventory"
      v-model:visible="itemCreateVisible"
      :inventory-id="inventory.id"
      :fields="inventory.fields"
      @created="handleItemCreated"
    />

    <ItemEditorDialog
      v-if="inventory && editingItem"
      v-model:visible="itemEditVisible"
      mode="edit"
      :inventory-id="inventory.id"
      :fields="inventory.fields"
      :item="editingItem"
      @saved="handleItemCreated"
    />
  </div>
</template>
