import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { ApiError } from "@/shared/api/errors";
import { getCurrentUser, logout } from "../api";
import type { UserProfileResponse } from "../types";

export const useCurrentUserStore = defineStore("currentUser", () => {
  const user = ref<UserProfileResponse | null>(null);
  const checked = ref(false);
  const loading = ref(false);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.isAdmin ?? false);

  async function load() {
    loading.value = true;

    try {
      user.value = await getCurrentUser();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        user.value = null;
      } else {
        throw error;
      }
    } finally {
      checked.value = true;
      loading.value = false;
    }
  }

  async function signOut() {
    await logout();
    user.value = null;
  }

  return {
    user,
    checked,
    loading,
    isAuthenticated,
    isAdmin,
    load,
    signOut
  };
});
