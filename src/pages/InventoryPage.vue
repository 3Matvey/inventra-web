<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Badge from "primevue/badge";
import Message from "primevue/message";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import Tag from "primevue/tag";
import ItemsTable from "@/entities/item/components/ItemsTable.vue";
import { getInventoryDetails } from "@/entities/inventory/api";
import { getInventoryItems, getInventoryStatistics } from "@/entities/item/api";
import { formatDateTime } from "@/shared/utils/date";
import { getFieldTypeLabel, getIdElementTypeLabel } from "@/entities/inventory/utils";
import type { InventoryDetailsDto } from "@/entities/inventory/types";
import type { InventoryItemTableRowDto, InventoryStatisticsDto } from "@/entities/item/types";

const props = defineProps<{
  inventoryId: string;
}>();

const inventory = ref<InventoryDetailsDto | null>(null);
const items = ref<InventoryItemTableRowDto[]>([]);
const statistics = ref<InventoryStatisticsDto | null>(null);
const itemsTotal = ref(0);
const itemsPage = ref(1);
const itemsPageSize = ref(20);
const sortBy = ref<string | null>(null);
const sortDescending = ref(false);
const loading = ref(true);
const itemsLoading = ref(false);
const errorMessage = ref<string | null>(null);

const visibleFieldsCount = computed(
  () => inventory.value?.fields.filter((field) => field.showInTable).length ?? 0
);

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

onMounted(loadInventory);
</script>

<template>
  <div class="page-stack">
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <section v-if="inventory" class="inventory-hero">
      <img
        v-if="inventory.imageUrl"
        class="inventory-image"
        :src="inventory.imageUrl"
        :alt="inventory.title"
      />
      <div class="inventory-summary">
        <div class="inventory-heading-line">
          <p class="eyebrow">{{ inventory.category.name }}</p>
          <Badge
            :value="inventory.isPublicWriteAccess ? 'Public write' : 'Restricted write'"
            :severity="inventory.isPublicWriteAccess ? 'success' : 'secondary'"
          />
        </div>
        <h1>{{ inventory.title }}</h1>
        <p v-if="inventory.descriptionMarkdown" class="inventory-description">
          {{ inventory.descriptionMarkdown }}
        </p>
        <div class="inventory-meta">
          <span><i class="pi pi-user" /> {{ inventory.owner.userName }}</span>
          <span><i class="pi pi-database" /> {{ statistics?.itemsCount ?? itemsTotal }} items</span>
          <span><i class="pi pi-sliders-h" /> {{ inventory.fields.length }} fields</span>
          <span><i class="pi pi-eye" /> {{ visibleFieldsCount }} shown in table</span>
        </div>
        <div class="tag-list">
          <Tag v-for="tag in inventory.tags" :key="tag.id" :value="tag.name" />
        </div>
      </div>
    </section>

    <section v-else-if="loading" class="content-section">
      <Message severity="info" :closable="false">Loading inventory...</Message>
    </section>

    <Tabs v-if="inventory" value="items">
      <TabList>
        <Tab value="items">Items</Tab>
        <Tab value="discussion">Discussion</Tab>
        <Tab value="settings">Settings</Tab>
        <Tab value="id-format">Custom ID</Tab>
        <Tab value="access">Access</Tab>
        <Tab value="fields">Fields</Tab>
        <Tab value="statistics">Statistics</Tab>
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
            @page="handleItemsPage"
            @sort="handleItemsSort"
          />
        </TabPanel>

        <TabPanel value="discussion">
          <Message severity="info" :closable="false">
            Discussion with near-real-time updates will be connected to the inventory hub here.
          </Message>
        </TabPanel>

        <TabPanel value="settings">
          <div class="info-grid">
            <div>
              <span class="muted">Title</span>
              <strong>{{ inventory.title }}</strong>
            </div>
            <div>
              <span class="muted">Category</span>
              <strong>{{ inventory.category.name }}</strong>
            </div>
            <div>
              <span class="muted">Version</span>
              <strong>{{ inventory.version }}</strong>
            </div>
            <div>
              <span class="muted">Image public ID</span>
              <strong>{{ inventory.imagePublicId ?? "—" }}</strong>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="id-format">
          <div class="definition-list">
            <div
              v-for="element in [...inventory.idFormatElements].sort((a, b) => a.order - b.order)"
              :key="element.id"
              class="definition-row"
            >
              <strong>{{ getIdElementTypeLabel(element.type) }}</strong>
              <span>{{ element.value ?? element.format ?? "Default formatting" }}</span>
            </div>
            <Message v-if="inventory.idFormatElements.length === 0" severity="info" :closable="false">
              No custom ID elements configured yet.
            </Message>
          </div>
        </TabPanel>

        <TabPanel value="access">
          <div class="definition-list">
            <div
              v-for="user in [...inventory.accessUsers].sort((a, b) => a.userName.localeCompare(b.userName))"
              :key="user.userId"
              class="definition-row"
            >
              <strong>{{ user.userName }}</strong>
              <span>{{ user.email }} · granted {{ formatDateTime(user.grantedAt) }}</span>
            </div>
            <Message v-if="inventory.accessUsers.length === 0" severity="info" :closable="false">
              No individual access grants. Public write access is
              {{ inventory.isPublicWriteAccess ? "enabled" : "disabled" }}.
            </Message>
          </div>
        </TabPanel>

        <TabPanel value="fields">
          <div class="definition-list">
            <div
              v-for="field in [...inventory.fields].sort((a, b) => a.order - b.order)"
              :key="field.id"
              class="definition-row"
            >
              <strong>{{ field.title }}</strong>
              <span>
                {{ getFieldTypeLabel(field.type) }}
                · {{ field.showInTable ? "shown in item table" : "hidden from item table" }}
              </span>
            </div>
            <Message v-if="inventory.fields.length === 0" severity="info" :closable="false">
              No custom fields configured yet.
            </Message>
          </div>
        </TabPanel>

        <TabPanel value="statistics">
          <div v-if="statistics" class="stats-layout">
            <div class="stat-tile">
              <span class="muted">Total items</span>
              <strong>{{ statistics.itemsCount }}</strong>
            </div>

            <section class="content-section">
              <h2>Numeric fields</h2>
              <div class="definition-list">
                <div
                  v-for="field in statistics.numericFields"
                  :key="field.fieldId"
                  class="definition-row"
                >
                  <strong>{{ field.fieldTitle }}</strong>
                  <span>min {{ field.min ?? "—" }} · avg {{ field.average ?? "—" }} · max {{ field.max ?? "—" }}</span>
                </div>
                <span v-if="statistics.numericFields.length === 0" class="muted">
                  No numeric fields yet.
                </span>
              </div>
            </section>

            <section class="content-section">
              <h2>Frequent string values</h2>
              <div class="definition-list">
                <div
                  v-for="field in statistics.stringFields"
                  :key="field.fieldId"
                  class="definition-row"
                >
                  <strong>{{ field.fieldTitle }}</strong>
                  <span>
                    {{
                      field.mostFrequentValues
                        .map((value) => `${value.value} (${value.count})`)
                        .join(", ") || "—"
                    }}
                  </span>
                </div>
                <span v-if="statistics.stringFields.length === 0" class="muted">
                  No string statistics yet.
                </span>
              </div>
            </section>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
