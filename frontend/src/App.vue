<template>
  <router-view />
  <ConfirmDialog />
  <Toast />
</template>

<script setup>
import { onMounted } from "vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import { useToast } from "primevue/usetoast";
import { setupAxiosInterceptors } from "./utils/axiosConfig";

const toast = useToast();

// Setup axios interceptors with toast instance from component context
onMounted(() => {
  setupAxiosInterceptors(toast);
});
</script>
