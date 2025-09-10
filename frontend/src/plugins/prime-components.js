import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import Calendar from "primevue/calendar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import { Form } from "@primevue/forms";

export default function registerPrime(app) {
  // Components
  app.component("Card", Card);
  app.component("InputText", InputText);
  app.component("Password", Password);
  app.component("Button", Button);
  app.component("Message", Message);
  app.component("Dialog", Dialog);
  app.component("Toast", Toast);
  app.component("Calendar", Calendar);
  app.component("DataTable", DataTable);
  app.component("Column", Column);
  app.component("Form", Form);

  // Directives and services
  app.directive("tooltip", Tooltip);
  app.use(ToastService);
}

// You can expand this list as you add more PrimeVue components to the app.
