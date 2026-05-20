<script setup lang="ts">
import AdminUsersTable from "@/features/admin-users/components/AdminUsersTable.vue";
import { useI18n } from "@/shared/i18n/useI18n";

const { t } = useI18n();
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <div>
        <p class="eyebrow">{{ t("admin.eyebrow") }}</p>
        <h1>{{ t("admin.title") }}</h1>
      </div>
    </section>

    <AdminUsersTable />
  </div>
</template>
