<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { ApiError } from "@/shared/api/errors";
import { getCurrentUser } from "@/entities/user/api";
import type { UserProfileResponse } from "@/entities/user/types";

const router = useRouter();
const route = useRoute();
const searchTerm = ref(typeof route.query.term === "string" ? route.query.term : "");
const user = ref<UserProfileResponse | null>(null);
const authChecked = ref(false);
const isDark = ref(localStorage.getItem("inventra.theme") === "dark");

function applyTheme() {
  document.documentElement.classList.toggle("app-dark", isDark.value);
  localStorage.setItem("inventra.theme", isDark.value ? "dark" : "light");
}

function toggleTheme() {
  isDark.value = !isDark.value;
  applyTheme();
}

function submitSearch() {
  void router.push({ name: "search", query: { term: searchTerm.value.trim() } });
}

onMounted(async () => {
  applyTheme();

  try {
    user.value = await getCurrentUser();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      console.warn("Failed to load current user", error);
    }
  } finally {
    authChecked.value = true;
  }
});
</script>

<template>
  <header class="app-header">
    <RouterLink class="brand" :to="{ name: 'home' }">
      <span class="brand-mark">I</span>
      <span>Inventra</span>
    </RouterLink>

    <form class="global-search" role="search" @submit.prevent="submitSearch">
      <span class="p-input-icon-left search-field">
        <i class="pi pi-search" />
        <InputText v-model="searchTerm" placeholder="Search inventories" />
      </span>
      <Button type="submit" icon="pi pi-arrow-right" aria-label="Search" />
    </form>

    <div class="header-actions">
      <Button
        text
        rounded
        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
        :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="toggleTheme"
      />
      <Button text rounded label="EN" aria-label="Language" />
      <Button
        v-if="user"
        text
        icon="pi pi-user"
        :label="user.userName"
      />
      <Button v-else text icon="pi pi-sign-in" :label="authChecked ? 'Sign in' : 'Account'" />
    </div>
  </header>
</template>
