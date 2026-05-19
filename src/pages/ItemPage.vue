<script setup lang="ts">
import Message from "primevue/message";

defineProps<{
  itemId: string;
}>();
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <div>
        <p class="eyebrow">Item</p>
        <h1>Item details</h1>
        <p class="muted">{{ itemId }}</p>
      </div>
    </section>

    <Message severity="info" :closable="false">
      Item view and edit mode will use the inventory field definitions and optimistic locking.
    </Message>
  </div>
</template>
