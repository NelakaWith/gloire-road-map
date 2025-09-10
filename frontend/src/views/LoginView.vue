<template>
  <div class="login-root">
    <Card>
      <template #title> Admin Login </template>
      <template #content>
        <div class="p-fluid">
          <div class="p-field">
            <label for="username">Username</label>
            <InputText
              id="username"
              v-model="userName"
              autocomplete="username"
            />
          </div>

          <div class="p-field">
            <label for="password">Password</label>
            <Password
              id="password"
              v-model="password"
              toggleMask
              :feedback="false"
            />
          </div>

          <div class="p-field">
            <Button
              label="Login"
              icon="pi pi-sign-in"
              class="p-button-primary"
              @click="onLogin"
            />
          </div>

          <Message v-if="error" severity="error">{{ error }}</Message>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const userName = ref("");
const password = ref("");
const error = ref("");

const router = useRouter();
const auth = useAuthStore();

const onLogin = async () => {
  error.value = "";
  try {
    await auth.login(userName.value, password.value);
    router.push("/");
  } catch (e) {
    error.value = e.response?.data?.message || "Login failed";
  }
};
</script>

<style scoped>
.login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f0f9ff 0%, #eef2ff 100%);
}

.p-field {
  margin-bottom: 1rem;
}
</style>
