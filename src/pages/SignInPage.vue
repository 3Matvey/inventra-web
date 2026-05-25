<script setup lang="ts">
import Button from "primevue/button";
import Divider from "primevue/divider";
import Message from "primevue/message";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import PasswordAuthPanel from "@/features/auth/components/PasswordAuthPanel.vue";
import { buildExternalLoginUrl } from "@/features/auth/model/authLinks";
import { useI18n } from "@/shared/i18n/useI18n";

const returnUrl = "/";
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const emailConfirmed = computed(() => route.query.emailConfirmed === "true");

function goHome() {
  void router.push({ name: "home" });
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-card">
      <p class="eyebrow">{{ t("app.account") }}</p>
      <h1>{{ t("auth.title") }}</h1>
      <Message v-if="emailConfirmed" severity="success" :closable="false">
        {{ t("auth.emailConfirmed") }}
      </Message>
      <Message severity="info" :closable="false">
        {{ t("auth.hint") }}
      </Message>

      <div class="auth-panel">
        <PasswordAuthPanel @authenticated="goHome" />

        <Divider align="center">{{ t("auth.or") }}</Divider>

        <a class="auth-provider-link" :href="buildExternalLoginUrl('Google', returnUrl)">
          <Button icon="pi pi-google" :label="t('auth.continueGoogle')" fluid />
        </a>
        <a class="auth-provider-link" :href="buildExternalLoginUrl('GitHub', returnUrl)">
          <Button icon="pi pi-github" :label="t('auth.continueGithub')" severity="secondary" outlined fluid />
        </a>
      </div>
    </section>
  </div>
</template>
