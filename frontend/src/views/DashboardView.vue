<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-subtitle">Welcome back!</p>
    </div>

    <div class="dashboard-grid">
      <Card class="dashboard-card">
        <template #title>Members</template>
        <template #content>
          <p class="card-text">Manage members and track their progress.</p>
          <Button
            label="View Members"
            icon="pi pi-users"
            @click="$router.push('/members')"
          />
        </template>
      </Card>

      <Card class="dashboard-card">
        <template #title>Analytics</template>
        <template #content>
          <p class="card-text">Track overall progress and achievements.</p>
          <Button
            label="View Analytics"
            icon="pi pi-chart-line"
            @click="$router.push('/analytics')"
          />
        </template>
      </Card>

      <Card class="dashboard-card">
        <template #title>Attendance</template>
        <template #content>
          <p class="card-text">Track overall attendance and participation.</p>
          <Button
            label="View Attendance"
            icon="pi pi-calendar"
            @click="$router.push('/attendance')"
          />
        </template>
      </Card>
    </div>
    <LeaderBoard />
  </div>
</template>

<script setup>
import LeaderBoard from "../components/dashboard/LeaderBoard.vue";
</script>

<style scoped>
.dashboard {
  @apply space-y-8 pb-4;
}

.dashboard-header {
  @apply text-center md:text-left;
}

.dashboard-title {
  @apply text-2xl font-bold text-gray-900 mb-2 mt-4;
}

.dashboard-subtitle {
  @apply text-lg text-gray-600;
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
