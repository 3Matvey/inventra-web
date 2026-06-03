<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { ApiError } from "@/shared/api/errors";
import { useI18n } from "@/shared/i18n/useI18n";
import type { UserProfileResponse } from "@/entities/user/types";
import {
  createSalesforceCustomer,
  type SalesforceCustomerResponse
} from "../api";

const visible = defineModel<boolean>("visible", { required: true });

const props = defineProps<{
  profileUser: UserProfileResponse;
}>();

const { t } = useI18n();

const accountName = ref("");
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const phone = ref("");
const website = ref("");
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const result = ref<SalesforceCustomerResponse | null>(null);

const canSubmit = computed(() => {
  return Boolean(
    accountName.value.trim() &&
    lastName.value.trim() &&
    email.value.trim() &&
    !loading.value
  );
});

watch(
  visible,
  (nextVisible) => {
    if (!nextVisible) return;
    fillDefaults();
  }
);

function fillDefaults() {
  const nameParts = props.profileUser.userName.trim().split(/\s+/).filter(Boolean);

  accountName.value = props.profileUser.userName;
  firstName.value = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";
  lastName.value = nameParts.at(-1) ?? props.profileUser.userName;
  email.value = props.profileUser.email;
  phone.value = "";
  website.value = "";
  errorMessage.value = null;
  result.value = null;
}

function optionalValue(value: string) {
  return value.trim() || null;
}

async function submit() {
  if (!canSubmit.value) return;

  loading.value = true;
  errorMessage.value = null;
  result.value = null;

  try {
    result.value = await createSalesforceCustomer(props.profileUser.id, {
      accountName: accountName.value.trim(),
      firstName: optionalValue(firstName.value),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      phone: optionalValue(phone.value),
      website: optionalValue(website.value)
    });
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError || error instanceof Error
        ? error.message
        : t("salesforce.failed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="t('salesforce.title')"
    class="salesforce-customer-dialog"
    :style="{ width: 'min(42rem, calc(100vw - 2rem))' }"
  >
    <form class="form-stack" @submit.prevent="submit">
      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <Message v-if="result" severity="success" :closable="false">
        <div class="salesforce-result">
          <strong>{{ t("salesforce.success") }}</strong>
          <span>{{ t("salesforce.accountId") }}: {{ result.accountId }}</span>
          <span>{{ t("salesforce.contactId") }}: {{ result.contactId }}</span>
        </div>
      </Message>

      <label class="field-stack">
        <span>{{ t("salesforce.accountName") }}</span>
        <InputText v-model="accountName" autofocus :disabled="loading" />
      </label>

      <div class="form-grid">
        <label class="field-stack">
          <span>{{ t("salesforce.firstName") }}</span>
          <InputText v-model="firstName" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span>{{ t("salesforce.lastName") }}</span>
          <InputText v-model="lastName" :disabled="loading" />
        </label>
      </div>

      <label class="field-stack">
        <span>{{ t("salesforce.email") }}</span>
        <InputText v-model="email" type="email" :disabled="loading" />
      </label>

      <div class="form-grid">
        <label class="field-stack">
          <span>{{ t("salesforce.phone") }}</span>
          <InputText v-model="phone" type="tel" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span>{{ t("salesforce.website") }}</span>
          <InputText v-model="website" type="url" :disabled="loading" />
        </label>
      </div>

      <div class="dialog-actions">
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          outlined
          :disabled="loading"
          @click="visible = false"
        />
        <Button
          type="submit"
          icon="pi pi-cloud-upload"
          :label="t('salesforce.submit')"
          :loading="loading"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>
