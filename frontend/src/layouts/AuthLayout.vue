<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
// Auth layout for login, register, forgot password, etc.
</script>

<style scoped>
.auth-layout {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100;
  @apply flex items-center justify-center p-6;
}

.auth-container {
  @apply w-full max-w-md;
}

.auth-content {
  @apply space-y-6;
}
</style>
