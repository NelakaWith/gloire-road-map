<template>
  <header :class="containerClass">
    <div class="flex items-center">
      <router-link
        v-if="showBack"
        :to="backTo"
        class="flex items-center text-gray-600 hover:text-gray-900"
      >
        <i class="pi pi-chevron-left mr-2"></i>
      </router-link>
      <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
    </div>

    <div>
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: false },
  backTo: {
    type: String,
    default: "/dashboard",
  },
  containerClass: {
    type: String,
    default: "flex justify-between items-center mx-auto py-4",
  },
});
</script>

<style scoped lang="scss">
.pi {
  @apply text-gray-600;
}
</style>
