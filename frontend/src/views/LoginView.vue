<template>
  <div class="login-container">
    <h2>Admin Login</h2>
    <form @submit.prevent="onLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();
const auth = useAuthStore();

const onLogin = async () => {
  error.value = "";
  try {
    await auth.login(email.value, password.value);
    router.push("/dashboard");
  } catch (e) {
    error.value = e.response?.data?.message || "Login failed";
  }
};
</script>

<style scoped>
.login-container {
  max-width: 350px;
  margin: 80px auto;
  padding: 2em;
  border: 1px solid #ccc;
  border-radius: 8px;
}
input {
  display: block;
  width: 100%;
  margin-bottom: 1em;
  padding: 0.5em;
}
button {
  width: 100%;
  padding: 0.7em;
}
.error {
  color: red;
  margin-top: 1em;
}
</style>
