<script setup lang="ts">
import AdminUsersTable from "@/features/admin-users/components/AdminUsersTable.vue";
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <div>
        <p class="eyebrow">Admin</p>
        <h1>User management</h1>
      </div>
    </section>

    <AdminUsersTable />
  </div>
</template>
