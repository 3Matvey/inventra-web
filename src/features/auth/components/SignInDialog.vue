<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import { buildExternalLoginUrl } from "../model/authLinks";

const visible = defineModel<boolean>("visible", { required: true });

const returnUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
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
        Sign in with a social account to create inventories, add items, leave comments, and like
        items.
      </Message>

      <a class="auth-provider-link" :href="buildExternalLoginUrl('Google', returnUrl)">
        <Button icon="pi pi-google" label="Continue with Google" fluid />
      </a>

      <a class="auth-provider-link" :href="buildExternalLoginUrl('GitHub', returnUrl)">
        <Button icon="pi pi-github" label="Continue with GitHub" severity="secondary" outlined fluid />
      </a>
    </div>
  </Dialog>
</template>
