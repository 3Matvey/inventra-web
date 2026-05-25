<script setup lang="ts">
import Button from "primevue/button";
import Divider from "primevue/divider";
import Message from "primevue/message";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import PasswordAuthPanel from "@/features/auth/components/PasswordAuthPanel.vue";
import SetPasswordPanel from "@/features/auth/components/SetPasswordPanel.vue";
import { buildExternalLoginUrl } from "@/features/auth/model/authLinks";
import { useI18n } from "@/shared/i18n/useI18n";

const returnUrl = "/";
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const emailConfirmed = computed(() => route.query.emailConfirmed === "true");
const isPasswordSetup = computed(() => route.query.setupPassword === "true");
const setupUserId = computed(() => stringQueryValue(route.query.userId));
const setupToken = computed(() => stringQueryValue(route.query.token));

function goHome() {
  void router.push({ name: "home" });
}

function showLogin() {
  void router.replace({ name: "sign-in" });
}

function stringQueryValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-card">
      <p class="eyebrow">{{ t("app.account") }}</p>
      <h1>{{ isPasswordSetup ? t("auth.setPassword.title") : t("auth.title") }}</h1>
      <Message v-if="emailConfirmed" severity="success" :closable="false">
        {{ t("auth.emailConfirmed") }}
      </Message>
      <Message v-if="!isPasswordSetup" severity="info" :closable="false">
        {{ t("auth.hint") }}
      </Message>

      <SetPasswordPanel
        v-if="isPasswordSetup"
        :user-id="setupUserId"
        :token="setupToken"
        @completed="showLogin"
      />

      <div v-else class="auth-panel">
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
