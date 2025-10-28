<template>
  <header :class="containerClass">
    <div class="flex items-center">
      <button
        v-if="showBack"
        @click="goBack"
        class="flex items-center text-gray-600 hover:text-gray-900 bg-transparent border-0 p-0 mr-2"
        aria-label="Go back"
      >
        <i class="pi pi-chevron-left"></i>
      </button>
      <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
    </div>

    <div>
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: false },
  containerClass: {
    type: String,
    default: "flex justify-between items-center mx-auto py-4",
  },
});

/**
 * Navigate back using browser history
 */
const goBack = () => {
  router.back();
};
</script>
