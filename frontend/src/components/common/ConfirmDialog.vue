<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="absolute inset-0 bg-black opacity-30"></div>
    <div
      class="bg-white rounded-lg shadow-lg p-6 z-10 min-w-[280px] max-w-xs flex flex-col items-center"
    >
      <div class="mb-4 text-gray-800 text-center">
        <slot>Are you sure?</slot>
      </div>
      <div class="flex gap-4 justify-center">
        <button
          @click="$emit('confirm')"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Yes
        </button>
        <button
          @click="$emit('cancel')"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          No
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ show: Boolean });
defineEmits(["confirm", "cancel"]);
</script>
