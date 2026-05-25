import { createRouter, createWebHashHistory } from "vue-router";

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/pages/HomePage.vue")
    },
    {
      path: "/search",
      name: "search",
      component: () => import("@/pages/SearchPage.vue")
    },
    {
      path: "/sign-in",
      name: "sign-in",
      alias: "/login",
      component: () => import("@/pages/SignInPage.vue")
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("@/pages/AdminUsersPage.vue")
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/pages/ProfilePage.vue")
    },
    {
      path: "/inventories/:inventoryId",
      name: "inventory",
      component: () => import("@/pages/InventoryPage.vue"),
      props: true
    },
    {
      path: "/items/:itemId",
      name: "item",
      component: () => import("@/pages/ItemPage.vue"),
      props: true
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/pages/NotFoundPage.vue")
    }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});
