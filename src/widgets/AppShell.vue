<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";
import Button from "primevue/button";
import SupportTicketDialog from "@/features/support-ticket/components/SupportTicketDialog.vue";
import { useCurrentUserStore } from "@/entities/user/stores/currentUser";
import { useSupportTicketStore } from "@/features/support-ticket/model/supportTicketStore";
import { useI18n } from "@/shared/i18n/useI18n";
import AppHeader from "./AppHeader.vue";

const route = useRoute();
const currentUser = useCurrentUserStore();
const supportTicket = useSupportTicketStore();
const { t } = useI18n();

watch(
  () => route.fullPath,
  () => {
    supportTicket.clearContext();
  }
);
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <RouterView />
    </main>
    <Button
      class="support-ticket-button"
      rounded
      :icon="currentUser.isAuthenticated ? 'pi pi-question-circle' : 'pi pi-sign-in'"
      :label="t('support.help')"
      :aria-label="t('support.help')"
      @click="supportTicket.open"
    />
    <SupportTicketDialog />
  </div>
</template>
