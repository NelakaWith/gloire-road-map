<template>
  <div class="main-layout">
    <!-- Header/Navigation -->
    <Menubar>
      <template #start>
        <div class="nav-brand">
          <h1 class="brand-title">Gloire Road Map</h1>
        </div>
      </template>
      <template #end>
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/profile" class="nav-link">Profile</router-link>

        <Button
          icon="pi pi-user"
          text
          rounded
          @click="toggleUserMenu"
          aria-label="User menu"
        />
        <Button
          icon="pi pi-sign-out"
          text
          rounded
          @click="logout"
          aria-label="Logout"
        />
      </template>
    </Menubar>

    <!-- Main Content Area -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer (optional) -->
    <footer class="main-footer">
      <p class="footer-text">
        &copy; 2025 Gloire Road Map. All rights reserved.
      </p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const router = useRouter();
const authStore = useAuthStore();

const toggleUserMenu = () => {
  // TODO: Implement user menu dropdown
  console.log("Toggle user menu");
};

const logout = async () => {
  await authStore.logout();
  router.push("/login");
};
</script>

<style scoped>
.main-layout {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col;
}

.nav-brand {
  @apply flex items-center;
}

.brand-title {
  @apply text-xl font-bold text-gray-900;
}

.nav-links {
  @apply hidden md:flex space-x-8 mr-4;
}

.nav-link {
  @apply text-gray-600 hover:text-gray-900;
  @apply px-3 py-2 rounded-md text-sm font-medium;
  @apply transition-colors duration-200;
}

.nav-link.router-link-active {
  @apply text-blue-600 bg-blue-50;
}

.nav-user {
  @apply flex items-center space-x-2;
}

.main-content {
  @apply flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8;
}

.main-footer {
  @apply bg-white border-t border-gray-200 py-4;
}

.footer-text {
  @apply text-center text-sm text-gray-500;
}
</style>
