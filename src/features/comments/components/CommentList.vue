<script setup lang="ts">
import { renderMarkdown } from "@/shared/utils/markdown";
import { formatDateTime } from "@/shared/utils/date";
import { useI18n } from "@/shared/i18n/useI18n";
import type { InventoryCommentDto } from "../types";

defineProps<{
  comments: InventoryCommentDto[];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="comment-list">
    <article v-for="comment in comments" :key="comment.id" class="comment-card">
      <header>
        <strong>{{ comment.authorUserName }}</strong>
        <span class="muted">{{ formatDateTime(comment.createdAt) }}</span>
      </header>
      <div class="markdown-body" v-html="renderMarkdown(comment.bodyMarkdown)" />
    </article>
    <span v-if="comments.length === 0" class="muted">{{ t("comments.empty") }}</span>
  </div>
</template>
