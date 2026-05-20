<script setup lang="ts">
import Button from "primevue/button";
import Message from "primevue/message";
import { buildExternalLoginUrl } from "@/features/auth/model/authLinks";

const returnUrl = "/";
</script>

<template>
  <div class="auth-page">
    <section class="auth-card">
      <p class="eyebrow">Account</p>
      <h1>Sign in to Inventra</h1>
      <Message severity="info" :closable="false">
        Choose a provider. If this is your first visit, Inventra will create your account from the
        external profile.
      </Message>

      <div class="auth-panel">
        <a class="auth-provider-link" :href="buildExternalLoginUrl('Google', returnUrl)">
          <Button icon="pi pi-google" label="Continue with Google" fluid />
        </a>
        <a class="auth-provider-link" :href="buildExternalLoginUrl('GitHub', returnUrl)">
          <Button icon="pi pi-github" label="Continue with GitHub" severity="secondary" outlined fluid />
        </a>
      </div>
    </section>
  </div>
</template>
