<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import Textarea from "primevue/textarea";

const emit = defineEmits<{
  submit: [bodyMarkdown: string];
}>();

const body = ref("");

function submit() {
  const value = body.value.trim();
  if (!value) return;

  emit("submit", value);
  body.value = "";
}
</script>

<template>
  <form class="comment-composer" @submit.prevent="submit">
    <Textarea v-model="body" rows="4" auto-resize placeholder="Write a comment with Markdown" />
    <div class="dialog-actions">
      <Button type="submit" icon="pi pi-send" label="Post comment" :disabled="!body.trim()" />
    </div>
  </form>
</template>
