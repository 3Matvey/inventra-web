<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable, { type DataTablePageEvent } from "primevue/datatable";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Toolbar from "primevue/toolbar";
import type { UserProfileResponse } from "@/entities/user/types";
import {
  addAdminRole,
  blockUser,
  deleteUser,
  getAdminUsers,
  removeAdminRole,
  unblockUser
} from "../api";

const users = ref<UserProfileResponse[]>([]);
const selectedUsers = ref<UserProfileResponse[]>([]);
const page = ref(1);
const pageSize = ref(50);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const selectedCount = computed(() => selectedUsers.value.length);
const singleSelection = computed(() => selectedUsers.value.length === 1 ? selectedUsers.value[0] : null);

async function loadUsers() {
  loading.value = true;
  errorMessage.value = null;

  try {
    users.value = await getAdminUsers(page.value, pageSize.value);
    selectedUsers.value = [];
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load users.";
  } finally {
    loading.value = false;
  }
}

async function runAction(action: (user: UserProfileResponse) => Promise<void>) {
  loading.value = true;
  errorMessage.value = null;

  try {
    await Promise.all(selectedUsers.value.map(action));
    await loadUsers();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to update users.";
    loading.value = false;
  }
}

function handlePage(event: DataTablePageEvent) {
  page.value = event.page + 1;
  pageSize.value = event.rows;
  void loadUsers();
}

onMounted(loadUsers);
</script>

<template>
  <div class="manager-stack">
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <Toolbar>
      <template #start>
        <Tag :value="`${selectedCount} selected`" severity="secondary" />
      </template>

      <template #end>
        <Button
          icon="pi pi-ban"
          label="Block"
          outlined
          :disabled="selectedCount === 0"
          @click="runAction((user) => blockUser(user.id))"
        />
        <Button
          icon="pi pi-check-circle"
          label="Unblock"
          outlined
          :disabled="selectedCount === 0"
          @click="runAction((user) => unblockUser(user.id))"
        />
        <Button
          icon="pi pi-shield"
          label="Make admin"
          outlined
          :disabled="selectedCount === 0"
          @click="runAction((user) => addAdminRole(user.id))"
        />
        <Button
          icon="pi pi-shield"
          label="Remove admin"
          outlined
          :disabled="selectedCount !== 1 || !singleSelection?.isAdmin"
          @click="runAction((user) => removeAdminRole(user.id))"
        />
        <Button
          icon="pi pi-trash"
          label="Delete"
          severity="danger"
          outlined
          :disabled="selectedCount === 0"
          @click="runAction((user) => deleteUser(user.id))"
        />
      </template>
    </Toolbar>

    <DataTable
      v-model:selection="selectedUsers"
      :value="users"
      :loading="loading"
      :rows="pageSize"
      data-key="id"
      paginator
      striped-rows
      table-style="min-width: 54rem"
      @page="handlePage"
    >
      <template #empty>No users found.</template>
      <Column selection-mode="multiple" header-style="width: 3rem" />
      <Column field="userName" header="User name" sortable />
      <Column field="email" header="Email" sortable />
      <Column field="isBlocked" header="Blocked" sortable>
        <template #body="{ data }">
          <Tag :value="data.isBlocked ? 'blocked' : 'active'" :severity="data.isBlocked ? 'danger' : 'success'" />
        </template>
      </Column>
      <Column field="isAdmin" header="Role" sortable>
        <template #body="{ data }">
          <Tag :value="data.isAdmin ? 'admin' : 'user'" :severity="data.isAdmin ? 'info' : 'secondary'" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
