import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";
import "./styles/main.css";

import App from "./app/App.vue";
import { router } from "./app/router";
import { pinia } from "./app/pinia";

createApp(App)
  .use(pinia)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: ".app-dark"
      }
    }
  })
  .mount("#app");
