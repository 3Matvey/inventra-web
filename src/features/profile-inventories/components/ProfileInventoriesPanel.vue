<script setup lang="ts">
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import Message from "primevue/message";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import InventoryTable from "@/entities/inventory/components/InventoryTable.vue";
import { getOwnedInventories, getWritableInventories } from "@/entities/inventory/api";
import type { InventoryTableRowDto } from "@/entities/inventory/types";
import { useI18n } from "@/shared/i18n/useI18n";

const props = defineProps<{
  userId: string;
}>();

const { t } = useI18n();
const emit = defineEmits<{
  create: [];
}>();

const owned = ref<InventoryTableRowDto[]>([]);
const writable = ref<InventoryTableRowDto[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

async function loadInventories() {
  loading.value = true;
  errorMessage.value = null;

  try {
    const [ownedResult, writableResult] = await Promise.all([
      getOwnedInventories(props.userId, 1, 50),
      getWritableInventories(props.userId, 1, 50)
    ]);

    owned.value = ownedResult.items;
    writable.value = writableResult.items;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load profile inventories.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadInventories);
</script>

<template>
  <div class="manager-stack">
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <div class="section-heading">
      <div>
        <h2>{{ t("profile.myInventories") }}</h2>
        <span class="muted">{{ t("profile.hint") }}</span>
      </div>
      <Button icon="pi pi-plus" :label="t('home.create')" @click="emit('create')" />
    </div>

    <Tabs value="owned">
      <TabList>
        <Tab value="owned">{{ t("profile.owned") }}</Tab>
        <Tab value="writable">{{ t("profile.writable") }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="owned">
          <InventoryTable
            :inventories="owned"
            :loading="loading"
            empty-message="You do not own any inventories yet."
          />
        </TabPanel>
        <TabPanel value="writable">
          <InventoryTable
            :inventories="writable"
            :loading="loading"
            empty-message="No inventories have been shared with you yet."
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
