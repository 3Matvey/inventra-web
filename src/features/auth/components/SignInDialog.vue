<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Divider from "primevue/divider";
import Message from "primevue/message";
import { buildExternalLoginUrl } from "../model/authLinks";
import PasswordAuthPanel from "./PasswordAuthPanel.vue";
import { useI18n } from "@/shared/i18n/useI18n";

const visible = defineModel<boolean>("visible", { required: true });

const { t } = useI18n();
const returnUrl = window.location.hash || "/";

function closeDialog() {
  visible.value = false;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Sign in"
    :style="{ width: 'min(28rem, calc(100vw - 2rem))' }"
  >
    <div class="auth-panel">
      <Message severity="info" :closable="false">
        {{ t("auth.hint") }}
      </Message>

      <PasswordAuthPanel @authenticated="closeDialog" />

      <Divider align="center">{{ t("auth.or") }}</Divider>

      <a class="auth-provider-link" :href="buildExternalLoginUrl('Google', returnUrl)">
        <Button icon="pi pi-google" :label="t('auth.continueGoogle')" fluid />
      </a>

      <a class="auth-provider-link" :href="buildExternalLoginUrl('GitHub', returnUrl)">
        <Button icon="pi pi-github" :label="t('auth.continueGithub')" severity="secondary" outlined fluid />
      </a>
    </div>
  </Dialog>
</template>
