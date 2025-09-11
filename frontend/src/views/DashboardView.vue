<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-subtitle">Welcome back!</p>
    </div>

    <div class="dashboard-grid">
      <Card class="dashboard-card">
        <template #title>Students</template>
        <template #content>
          <p class="card-text">
            Manage your students and track their progress.
          </p>
          <Button
            label="View Students"
            icon="pi pi-users"
            @click="$router.push('/students')"
          />
        </template>
      </Card>

      <Card class="dashboard-card">
        <template #title>Goals</template>
        <template #content>
          <p class="card-text">Set and monitor learning goals.</p>
          <Button
            label="View Goals"
            icon="pi pi-flag"
            @click="$router.push('/goals')"
          />
        </template>
      </Card>

      <Card class="dashboard-card">
        <template #title>Progress</template>
        <template #content>
          <p class="card-text">Track overall progress and achievements.</p>
          <Button label="View Progress" icon="pi pi-chart-line" />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
// Dashboard component for the main layout
</script>

<style scoped>
.dashboard {
  @apply space-y-8;
}

.dashboard-header {
  @apply text-center md:text-left;
}

.dashboard-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
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
