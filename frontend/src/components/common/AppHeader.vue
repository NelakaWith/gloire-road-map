<template>
  <header class="app-header">
    <Menubar>
      <template #start>
        <div class="nav-brand">
          <h1 class="brand-title">🧭 RoadMap</h1>
        </div>
      </template>
      <template #end>
        <div class="flex items-center">
          <div class="nav-menu">
            <Button
              v-for="item in menuItems"
              :key="item.label"
              :label="item.label"
              :icon="item.icon"
              text
              @click="item.command"
              class="nav-menu-item"
            />
          </div>
          <Button
            icon="pi pi-user"
            text
            rounded
            @click="$emit('toggle-user-menu')"
            aria-label="User menu"
          />
          <Button
            icon="pi pi-sign-out"
            text
            rounded
            @click="$emit('logout')"
            aria-label="Logout"
          />
        </div>
      </template>
    </Menubar>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

defineEmits(["toggle-user-menu", "logout"]);

// Menu items configuration
const menuItems = ref([
  {
    label: "Dashboard",
    icon: "pi pi-objects-column",
    command: () => router.push("/dashboard"),
  },
  {
    label: "Members",
    icon: "pi pi-users",
    command: () => router.push("/members"),
  },
  {
    label: "Attendance",
    icon: "pi pi-calendar-clock",
    command: () => router.push("/attendance"),
  },
  {
    label: "Analytics",
    icon: "pi pi-chart-line",
    command: () => router.push("/analytics"),
  },
]);
</script>

<style scoped lang="scss">
.app-header {
  @apply sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200;
}
.nav-brand {
  @apply flex items-center;
}
.brand-title {
  @apply text-xl font-bold text-gray-900;
}
.nav-menu {
  @apply flex items-center gap-2 mr-4;
}
.nav-menu-item {
  @apply text-gray-600 hover:text-gray-900 transition-colors duration-200;
}
.nav-link {
  @apply text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
}
</style>
