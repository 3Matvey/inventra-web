<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Menu from "primevue/menu";
import type { MenuItem } from "primevue/menuitem";
import SignInDialog from "@/features/auth/components/SignInDialog.vue";
import { useCurrentUserStore } from "@/entities/user/stores/currentUser";
import { useI18n } from "@/shared/i18n/useI18n";

const router = useRouter();
const route = useRoute();
const currentUser = useCurrentUserStore();
const { locale, t, toggleLocale } = useI18n();
const searchTerm = ref(typeof route.query.term === "string" ? route.query.term : "");
const isDark = ref(localStorage.getItem("inventra.theme") === "dark");
const signInVisible = ref(false);
const accountMenu = ref<InstanceType<typeof Menu> | null>(null);

const accountMenuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    {
      icon: "pi pi-user",
      label: t("app.profile"),
      command: () => {
        void router.push({ name: "profile" });
      }
    }
  ];

  if (currentUser.isAdmin) {
    items.push({
      icon: "pi pi-shield",
      label: t("app.adminUsers"),
      command: () => {
        void router.push({ name: "admin-users" });
      }
    });
  }

  items.push({
    icon: "pi pi-sign-out",
    label: t("app.signOut"),
    command: () => {
      void currentUser.signOut();
    }
  });

  return items;
});

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
    await currentUser.load();
  } catch (error) {
    console.warn("Failed to load current user", error);
  }
});
</script>

<template>
  <header class="app-header">
    <RouterLink class="brand" :to="{ name: 'home' }">
      <span class="brand-mark">I</span>
      <span>{{ t("app.brand") }}</span>
    </RouterLink>

    <form class="global-search" role="search" @submit.prevent="submitSearch">
      <span class="p-input-icon-left search-field">
        <i class="pi pi-search" />
        <InputText v-model="searchTerm" :placeholder="t('app.search')" />
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
      <Button text rounded :label="locale.toUpperCase()" aria-label="Language" @click="toggleLocale" />
      <Button
        v-if="currentUser.user"
        text
        icon="pi pi-user"
        :label="currentUser.user.userName"
        @click="accountMenu?.toggle($event)"
      />
      <Button
        v-else
        text
        icon="pi pi-sign-in"
        :label="currentUser.checked ? t('app.signIn') : t('app.account')"
        @click="signInVisible = true"
      />
    </div>

    <Menu ref="accountMenu" :model="accountMenuItems" popup />
    <SignInDialog v-model:visible="signInVisible" />
  </header>
</template>
