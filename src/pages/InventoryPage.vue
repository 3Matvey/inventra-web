<script setup lang="ts">
import Message from "primevue/message";

defineProps<{
  inventoryId: string;
}>();
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <div>
        <p class="eyebrow">Inventory</p>
        <h1>Inventory workspace</h1>
        <p class="muted">{{ inventoryId }}</p>
      </div>
    </section>

    <Message severity="info" :closable="false">
      Inventory tabs, items table, discussion, settings, custom ID format, access, fields, and
      statistics will be built here next.
    </Message>
  </div>
</template>
