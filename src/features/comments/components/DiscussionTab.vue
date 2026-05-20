<script setup lang="ts">
import { onMounted, ref } from "vue";
import Message from "primevue/message";
import Tag from "primevue/tag";
import { addInventoryComment, getInventoryComments } from "../api";
import type { InventoryCommentDto } from "../types";
import { useInventoryDiscussionHub } from "../model/useInventoryDiscussionHub";
import { useI18n } from "@/shared/i18n/useI18n";
import CommentComposer from "./CommentComposer.vue";
import CommentList from "./CommentList.vue";

const props = defineProps<{
  inventoryId: string;
  canPost: boolean;
}>();

const { t } = useI18n();
const comments = ref<InventoryCommentDto[]>([]);
const loading = ref(true);
const posting = ref(false);
const errorMessage = ref<string | null>(null);

function appendComment(comment: InventoryCommentDto) {
  if (comments.value.some((current) => current.id === comment.id)) return;
  comments.value = [...comments.value, comment].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
}

const hub = useInventoryDiscussionHub(props.inventoryId, appendComment);

async function loadComments() {
  loading.value = true;
  errorMessage.value = null;

  try {
    const result = await getInventoryComments(props.inventoryId, 1, 50);
    comments.value = result.items;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load comments.";
  } finally {
    loading.value = false;
  }
}

async function submitComment(bodyMarkdown: string) {
  posting.value = true;
  errorMessage.value = null;

  try {
    appendComment(await addInventoryComment(props.inventoryId, bodyMarkdown));
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to post comment.";
  } finally {
    posting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadComments(), hub.start()]);
});
</script>

<template>
  <div class="manager-stack">
    <Message v-if="errorMessage || hub.errorMessage.value" severity="error" :closable="false">
      {{ errorMessage ?? hub.errorMessage.value }}
    </Message>

    <div class="section-heading">
      <div>
        <h2>{{ t("comments.title") }}</h2>
        <span class="muted">{{ t("comments.hint") }}</span>
      </div>
      <Tag :value="hub.connected.value ? 'live' : 'offline'" :severity="hub.connected.value ? 'success' : 'warn'" />
    </div>

    <CommentComposer v-if="canPost" @submit="submitComment" />
    <Message v-else severity="warn" :closable="false">
      Sign in to leave comments.
    </Message>
    <Message v-if="posting" severity="info" :closable="false">Posting comment...</Message>
    <Message v-if="loading" severity="info" :closable="false">Loading comments...</Message>
    <CommentList :comments="comments" />
  </div>
</template>
