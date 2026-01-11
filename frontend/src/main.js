import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";

import "primeicons/primeicons.css";
import "./assets/styles/main.scss";
import App from "./App.vue";
import router from "./router";
import registerPrime from "./plugins/prime-components";

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: "",
      cssLayer: false,
    },
  },
});
const pinia = createPinia();
app.use(pinia);
app.use(router);
// register primevue components globally
registerPrime(app);

// Validate saved token on app startup (call /me) so UI stays in sync after refresh
import { useAuthStore } from "./store/auth";
const authStore = useAuthStore(pinia);
if (authStore.token) {
  // fire and forget; router.beforeEach also validates when navigating
  authStore.fetchMe().catch(() => {});
}

app.mount("#app");
