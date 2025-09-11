<template>
  <Card class="w-full max-w-sm mx-auto">
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
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const error = ref("");
const router = useRouter();
const auth = useAuthStore();
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
