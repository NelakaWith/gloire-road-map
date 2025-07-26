<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
  >
    <div class="w-full max-w-sm bg-white rounded-lg shadow p-8">
      <h2 class="text-2xl font-bold text-center text-indigo-700 mb-6">
        Admin Login
      </h2>
      <form @submit.prevent="onLogin" class="space-y-4">
        <input
          v-model="userName"
          type="text"
          placeholder="Username"
          required
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded"
        >
          Login
        </button>
        <div v-if="error" class="text-red-600 text-center mt-2">
          {{ error }}
        </div>
      </form>
    </div>
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
    console.log("Login attempt:", {
      userName: userName.value,
      password: password.value,
    });

    await auth.login(userName.value, password.value);
    router.push("/");
  } catch (e) {
    error.value = e.response?.data?.message || "Login failed";
  }
};
</script>

<!-- All styling is now handled by Tailwind utility classes. -->
