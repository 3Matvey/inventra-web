<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";
import SelectButton from "primevue/selectbutton";
import { computed, ref } from "vue";
import {
  loginWithPassword,
  registerWithPassword,
  resendEmailConfirmation
} from "@/entities/user/api";
import { useCurrentUserStore } from "@/entities/user/stores/currentUser";
import { ApiError } from "@/shared/api/errors";
import { useI18n } from "@/shared/i18n/useI18n";

type AuthMode = "login" | "register";

const emit = defineEmits<{ authenticated: [] }>();

const { t } = useI18n();
const currentUser = useCurrentUserStore();
const mode = ref<AuthMode>("login");
const userName = ref("");
const email = ref("");
const password = ref("");
const rememberMe = ref(true);
const loading = ref(false);
const resending = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const emailNeedsConfirmation = ref(false);

const modeOptions = computed(() => [
  { label: t("auth.password.loginTab"), value: "login" },
  { label: t("auth.password.registerTab"), value: "register" }
]);

async function submit() {
  clearMessages();
  loading.value = true;

  try {
    mode.value === "login" ? await submitLogin() : await submitRegistration();
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    loading.value = false;
  }
}

async function submitLogin() {
  await loginWithPassword({
    email: email.value.trim(),
    password: password.value,
    rememberMe: rememberMe.value
  });
  await currentUser.load();
  emit("authenticated");
}

async function submitRegistration() {
  await registerWithPassword({
    userName: userName.value.trim(),
    email: email.value.trim(),
    password: password.value
  });
  successMessage.value = t("auth.password.registrationSent");
  mode.value = "login";
}

async function resendConfirmation() {
  clearMessages();
  resending.value = true;

  try {
    await resendEmailConfirmation(email.value.trim());
    successMessage.value = t("auth.password.confirmationResent");
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    resending.value = false;
  }
}

function clearMessages() {
  errorMessage.value = "";
  successMessage.value = "";
  emailNeedsConfirmation.value = false;
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.payload?.code === "Identity.EmailNotConfirmed") {
    emailNeedsConfirmation.value = true;
    return t("auth.password.emailNotConfirmed");
  }

  return error instanceof Error ? error.message : t("auth.password.failed");
}
</script>

<template>
  <form class="password-auth-panel" @submit.prevent="submit">
    <SelectButton v-model="mode" :options="modeOptions" option-label="label" option-value="value" />

    <Message v-if="successMessage" severity="success" :closable="false">
      {{ successMessage }}
    </Message>
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <label v-if="mode === 'register'" class="form-field">
      <span>{{ t("common.name") }}</span>
      <InputText v-model="userName" autocomplete="username" required />
    </label>

    <label class="form-field">
      <span>{{ t("common.email") }}</span>
      <InputText v-model="email" type="email" autocomplete="email" required />
    </label>

    <label class="form-field">
      <span>{{ t("auth.password.password") }}</span>
      <Password v-model="password" autocomplete="current-password" :feedback="mode === 'register'" toggle-mask required fluid />
    </label>

    <label v-if="mode === 'login'" class="checkbox-field">
      <Checkbox v-model="rememberMe" input-id="remember-me" binary />
      <span>{{ t("auth.password.rememberMe") }}</span>
    </label>

    <div class="auth-actions">
      <Button
        type="submit"
        :label="mode === 'login' ? t('auth.password.signIn') : t('auth.password.createAccount')"
        :loading="loading"
        fluid
      />
      <Button
        v-if="emailNeedsConfirmation"
        type="button"
        :label="t('auth.password.resendConfirmation')"
        :loading="resending"
        severity="secondary"
        outlined
        fluid
        @click="resendConfirmation"
      />
    </div>
  </form>
</template>
