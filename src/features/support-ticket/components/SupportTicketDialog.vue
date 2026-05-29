<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import { useCurrentUserStore } from "@/entities/user/stores/currentUser";
import { ApiError } from "@/shared/api/errors";
import { useI18n } from "@/shared/i18n/useI18n";
import { createSupportTicket, type SupportTicketPriority } from "../api";
import { useSupportTicketStore } from "../model/supportTicketStore";

const ticketStore = useSupportTicketStore();
const currentUser = useCurrentUserStore();
const { t } = useI18n();

const summary = ref("");
const priority = ref<SupportTicketPriority>("Average");
const emailDraft = ref("");
const adminEmails = ref<string[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const priorities = computed(() => [
  { label: t("support.priority.high"), value: "High" },
  { label: t("support.priority.average"), value: "Average" },
  { label: t("support.priority.low"), value: "Low" }
]);

const canSubmit = computed(() => {
  return Boolean(
    currentUser.isAuthenticated &&
    summary.value.trim() &&
    adminEmails.value.length > 0 &&
    !loading.value
  );
});

watch(
  () => ticketStore.visible,
  (nextVisible) => {
    if (!nextVisible) return;
    errorMessage.value = null;
    successMessage.value = null;
  }
);

function normalizeEmail(email: string) {
  return email.trim();
}

function addEmail() {
  const email = normalizeEmail(emailDraft.value);
  if (!email) return;

  const exists = adminEmails.value.some((current) => current.toLowerCase() === email.toLowerCase());
  if (!exists) {
    adminEmails.value = [...adminEmails.value, email];
  }

  emailDraft.value = "";
}

function handleEmailKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" && event.key !== ",") return;

  event.preventDefault();
  addEmail();
}

function removeEmail(email: string) {
  adminEmails.value = adminEmails.value.filter((current) => current !== email);
}

function resetFields() {
  summary.value = "";
  priority.value = "Average";
  emailDraft.value = "";
  adminEmails.value = [];
}

async function submit() {
  addEmail();

  if (!currentUser.isAuthenticated) {
    errorMessage.value = t("support.authRequired");
    return;
  }

  if (!canSubmit.value) return;

  loading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    await createSupportTicket({
      summary: summary.value.trim(),
      priority: priority.value,
      link: window.location.href,
      adminEmails: adminEmails.value,
      inventoryId: ticketStore.context.inventoryId
    });

    resetFields();
    successMessage.value = t("support.success");
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError || error instanceof Error
        ? error.message
        : t("support.failed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="ticketStore.visible"
    modal
    :header="t('support.title')"
    class="support-ticket-dialog"
    :style="{ width: 'min(38rem, calc(100vw - 2rem))' }"
    @hide="ticketStore.close"
  >
    <form class="form-stack" @submit.prevent="submit">
      <Message v-if="!currentUser.isAuthenticated" severity="warn" :closable="false">
        {{ t("support.authRequired") }}
      </Message>

      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <Message v-if="successMessage" severity="success" :closable="false">
        {{ successMessage }}
      </Message>

      <div v-if="ticketStore.context.inventoryTitle" class="support-context">
        <i class="pi pi-box" />
        <span>{{ ticketStore.context.inventoryTitle }}</span>
      </div>

      <label class="field-stack">
        <span>{{ t("support.summary") }}</span>
        <Textarea
          v-model="summary"
          rows="4"
          auto-resize
          :placeholder="t('support.summaryPlaceholder')"
          :disabled="loading"
        />
      </label>

      <label class="field-stack">
        <span>{{ t("support.priority") }}</span>
        <Select
          v-model="priority"
          :options="priorities"
          option-label="label"
          option-value="value"
          :disabled="loading"
        />
      </label>

      <div class="field-stack">
        <span>{{ t("support.adminEmails") }}</span>
        <div class="support-email-row">
          <InputText
            v-model="emailDraft"
            type="email"
            :placeholder="t('support.adminEmailPlaceholder')"
            :disabled="loading"
            @keydown="handleEmailKeydown"
            @blur="addEmail"
          />
          <Button
            type="button"
            icon="pi pi-plus"
            :label="t('support.addEmail')"
            outlined
            :disabled="loading || !emailDraft.trim()"
            @click="addEmail"
          />
        </div>
        <div v-if="adminEmails.length" class="tag-list">
          <Tag
            v-for="email in adminEmails"
            :key="email"
            :value="email"
            icon="pi pi-times"
            class="clickable-tag"
            @click="removeEmail(email)"
          />
        </div>
      </div>

      <div class="support-link-preview">
        <i class="pi pi-link" />
        <span>{{ t("support.currentPage") }}</span>
      </div>

      <div class="dialog-actions">
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          outlined
          :disabled="loading"
          @click="ticketStore.visible = false"
        />
        <Button
          type="submit"
          icon="pi pi-send"
          :label="t('support.submit')"
          :loading="loading"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>
