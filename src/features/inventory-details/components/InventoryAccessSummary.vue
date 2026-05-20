<script setup lang="ts">
import Message from "primevue/message";
import { formatDateTime } from "@/shared/utils/date";
import type { InventoryDetailsDto } from "@/entities/inventory/types";

defineProps<{
  inventory: InventoryDetailsDto;
}>();
</script>

<template>
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
</template>
