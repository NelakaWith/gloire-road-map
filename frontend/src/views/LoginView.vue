<template>
  <div class="w-full max-w-sm mx-auto">
    <!-- Demo Banner -->
    <div
      v-if="isDemo"
      class="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="pi pi-info-circle text-blue-500"></i>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">Demo Environment</p>
          <p class="text-sm mt-1">Click below to view demo credentials</p>
          <button
            @click="showCredentials = !showCredentials"
            class="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline focus:outline-none"
            type="button"
          >
            {{ showCredentials ? "Hide" : "Show" }} Demo Credentials
          </button>
          <div
            v-if="showCredentials"
            class="mt-2 text-sm bg-blue-100 p-2 rounded"
          >
            <p><strong>Username:</strong> demo</p>
            <p><strong>Password:</strong> demo123</p>
          </div>
        </div>
      </div>
    </div>

    <Card class="w-full">
      <template #title>
        <span class="text-3xl font-bold my-2">Login</span>
      </template>
      <template #content>
        <Form
          v-slot="$form"
          :initialValues="initialValues"
          :resolver="resolver"
          @submit="onLogin"
        >
          <div class="flex flex-col gap-2">
            <Message v-if="error" severity="error" class="my-2">{{
              error
            }}</Message>
            <div class="flex flex-col gap-1">
              <label for="username">Username</label>
              <InputText
                name="username"
                type="text"
                autocomplete="username"
                fluid
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="password">Password</label>
              <Password
                name="password"
                type="password"
                toggleMask
                autocomplete="current-password"
                :feedback="false"
                fluid
              />
            </div>

            <div class="flex flex-col gap-1 my-2">
              <Button
                severity="primary"
                label="Login"
                icon="pi pi-sign-in"
                type="submit"
              />
            </div>
          </div>
        </Form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const error = ref("");
const showCredentials = ref(false);
const router = useRouter();
const auth = useAuthStore();

const isDemo = computed(() => {
  // Only show demo banner when explicitly enabled via environment variable
  // This prevents accidental credential exposure on unintended domains
  return import.meta.env.VITE_SHOW_DEMO_BANNER === "true";
});

const initialValues = {
  username: "",
  password: "",
};

const resolver = (values) => {
  const errors = {};
  if (!values.username || !values.username.trim()) {
    errors.username = { message: "Username is required" };
  }
  if (!values.password || !values.password.trim()) {
    errors.password = { message: "Password is required" };
  }
  return { values, errors };
};

const onLogin = async (event) => {
  if (!event.valid) return;
  const { username, password } = event.values.values || {};

  error.value = "";
  const res = await auth.login(username, password);
  if (!res || res.success === false) {
    error.value = res?.message || "Login failed";
    return;
  }
  router.push("/");
};
</script>
