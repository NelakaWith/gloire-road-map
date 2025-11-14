<template>
  <div class="w-full max-w-sm mx-auto">
    <!-- Demo Banner -->
    <div
      v-if="isDemo"
      class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="pi pi-info-circle text-yellow-500"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">Demo Environment</p>
          <p class="text-sm mt-1">
            Username: <strong>demo</strong><br />
            Password: <strong>demo123</strong>
          </p>
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
const router = useRouter();
const auth = useAuthStore();

const isDemo = computed(() => {
  return window.location.hostname.includes("demo");
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
