import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

const apiProxyRoutes = [
  "/inventories",
  "/items",
  "/categories",
  "/tags",
  "/users",
  "/admin",
  "/uploads",
  "/signin-google",
  "/signin-github",
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiProxyTarget = env.VITE_API_PROXY_TARGET ?? "http://localhost:8090";
  const appBase = env.VITE_APP_BASE ?? "/";

  console.log("VITE_API_PROXY_TARGET =", apiProxyTarget);

  const apiProxyOptions = {
    target: apiProxyTarget,
    changeOrigin: true,
    secure: false,
  };

  return {
    base: appBase,

    plugins: [vue(), vueDevTools()],

    server: {
      port: 5173,
      proxy: {
        "/auth": apiProxyOptions,

        ...Object.fromEntries(
          apiProxyRoutes.map((route) => [route, apiProxyOptions]),
        ),

        "/hubs": {
          ...apiProxyOptions,
          ws: true,
        },
      },
    },

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
