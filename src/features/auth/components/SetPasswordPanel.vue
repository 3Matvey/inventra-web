<script setup lang="ts">
import Button from "primevue/button";
import Message from "primevue/message";
import Password from "primevue/password";
import { computed, ref } from "vue";
import { setPassword } from "@/entities/user/api";
import { useI18n } from "@/shared/i18n/useI18n";

const props = defineProps<{
  userId?: string;
  token?: string;
}>();

const emit = defineEmits<{ completed: [] }>();

const { t } = useI18n();
const password = ref("");
const confirmation = ref("");
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const hasSetupLink = computed(() => Boolean(props.userId && props.token));
const passwordsMatch = computed(() => password.value === confirmation.value);

async function submit() {
  errorMessage.value = "";
  successMessage.value = "";

  if (!hasSetupLink.value) {
    errorMessage.value = t("auth.setPassword.invalidLink");
    return;
  }

  if (!passwordsMatch.value) {
    errorMessage.value = t("auth.setPassword.mismatch");
    return;
  }

  await savePassword();
}

async function savePassword() {
  loading.value = true;

  try {
    await setPassword({
      userId: props.userId!,
      token: props.token!,
      password: password.value
    });
    successMessage.value = t("auth.setPassword.success");
    emit("completed");
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("auth.setPassword.failed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="password-auth-panel" @submit.prevent="submit">
    <Message severity="info" :closable="false">
      {{ t("auth.setPassword.hint") }}
    </Message>

    <Message v-if="successMessage" severity="success" :closable="false">
      {{ successMessage }}
    </Message>
    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <label class="form-field">
      <span>{{ t("auth.password.password") }}</span>
      <Password v-model="password" autocomplete="new-password" toggle-mask required fluid />
    </label>

    <label class="form-field">
      <span>{{ t("auth.setPassword.confirmPassword") }}</span>
      <Password v-model="confirmation" autocomplete="new-password" :feedback="false" toggle-mask required fluid />
    </label>

    <Button
      type="submit"
      :label="t('auth.setPassword.submit')"
      :loading="loading"
      :disabled="!hasSetupLink"
      fluid
    />
  </form>
</template>
