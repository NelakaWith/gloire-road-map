import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";

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
app.use(createPinia());
app.use(router);
// register primevue components globally
registerPrime(app);
app.mount("#app");
