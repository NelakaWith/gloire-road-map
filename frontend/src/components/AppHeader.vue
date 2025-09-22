<template>
  <header class="app-header">
    <Menubar>
      <template #start>
        <div class="nav-brand">
          <h1 class="brand-title">Gloire Road Map</h1>
        </div>
      </template>
      <template #end>
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
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
      </template>
    </Menubar>
  </header>
</template>

<script setup>
// No internal logic — emits bubble to parent
defineEmits(["toggle-user-menu", "logout"]);
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
.nav-link {
  @apply text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
}
</style>
