<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Welcome back!</h1>
      <p class="dashboard-subtitle">“Win the morning, win the day.”</p>
    </div>
    <LeaderBoard />
  </div>
</template>

<script setup>
import LeaderBoard from "../components/dashboard/LeaderBoard.vue";
</script>

<style scoped>
.dashboard {
  @apply space-y-4 pb-4;
}

.dashboard-header {
  @apply text-center md:text-left;
}

.dashboard-title {
  @apply text-2xl font-bold text-gray-900 mb-2 mt-4;
}

.dashboard-subtitle {
  @apply text-neutral-500;
}

.dashboard-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.dashboard-card {
  @apply h-full;
}

.card-text {
  @apply text-gray-600 mb-4;
}
</style>
