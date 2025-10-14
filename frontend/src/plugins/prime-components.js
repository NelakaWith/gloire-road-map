import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import DatePicker from "primevue/datepicker";
import Dropdown from "primevue/select";
import Password from "primevue/password";
import Button from "primevue/button";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tooltip from "primevue/tooltip";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import { Form } from "@primevue/forms";
import Menubar from "primevue/menubar";
import ConfirmDialog from "primevue/confirmdialog";

import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";

export default function registerPrime(app) {
  // Components
  app.component("Card", Card);
  app.component("InputText", InputText);
  app.component("Password", Password);
  app.component("Textarea", Textarea);
  app.component("DatePicker", DatePicker);
  app.component("Dropdown", Dropdown);
  app.component("Button", Button);
  app.component("Message", Message);
  app.component("Dialog", Dialog);
  app.component("Toast", Toast);
  app.component("DataTable", DataTable);
  app.component("Column", Column);
  app.component("Tag", Tag);
  app.component("ProgressSpinner", ProgressSpinner);
  app.component("Form", Form);
  app.component("Menubar", Menubar);
  app.component("ConfirmDialog", ConfirmDialog);

  // Directives and services
  app.directive("tooltip", Tooltip);
  app.use(ToastService);
  app.use(ConfirmationService);
}
