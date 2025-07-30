<template>
  <div class="fixed inset-0 flex items-center justify-center z-50">
    <div class="absolute inset-0 bg-black opacity-30"></div>
    <div
      class="bg-white rounded-lg shadow-lg p-6 z-10 min-w-[320px] max-w-md w-full"
    >
      <h3 class="text-lg font-bold mb-2 text-indigo-700" v-if="mode === 'view'">
        Goal Details
      </h3>
      <h3
        class="text-lg font-bold mb-2 text-indigo-700"
        v-else-if="mode === 'edit'"
      >
        Edit Goal
      </h3>
      <h3 class="text-lg font-bold mb-2 text-indigo-700" v-else>Add Goal</h3>
      <form v-if="mode !== 'view'" @submit.prevent="onSubmit">
        <div class="mb-2">
          <label class="block text-sm font-medium">Title</label>
          <input
            v-model="form.title"
            required
            class="w-full border rounded px-2 py-1"
          />
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium">Description</label>
          <textarea
            v-model="form.description"
            class="w-full border rounded px-2 py-1"
          />
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium">Target Date</label>
          <input
            v-model="form.target_date"
            type="date"
            class="w-full border rounded px-2 py-1"
          />
        </div>
        <div class="flex gap-2 mt-4">
          <button
            type="submit"
            class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
      <div v-else>
        <div class="mb-2">
          <span class="font-semibold">Title:</span> {{ form.title }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">Description:</span>
          {{ form.description ? form.description : "-" }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">Target Date:</span>
          {{ form.target_date ? form.target_date.split("T")[0] : "-" }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">Setup Date:</span>
          {{ form.setup_date ? form.setup_date.split("T")[0] : "-" }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">Last Updated:</span>
          {{ form.updated_at ? form.updated_at.split("T")[0] : "-" }}
        </div>
        <div class="flex gap-2 mt-4">
          <button
            @click="$emit('edit')"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
          <button
            @click="$emit('delete')"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
          <button
            @click="$emit('close')"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, toRefs } from "vue";
const props = defineProps({
  show: Boolean,
  mode: String, // 'view', 'edit', 'add'
  goal: Object,
});
const emit = defineEmits(["close", "save", "edit", "delete"]);
const form = reactive({
  title: "",
  description: "",
  target_date: "",
  setup_date: "",
  updated_at: "",
});
watch(
  () => props.goal,
  (g) => {
    if (g) {
      form.title = g.title || "";
      form.description = g.description || "";
      form.target_date = g.target_date ? g.target_date.split("T")[0] : "";
      form.setup_date = g.setup_date || "";
      form.updated_at = g.updated_at || "";
    } else {
      form.title = "";
      form.description = "";
      form.target_date = "";
      form.setup_date = "";
      form.updated_at = "";
    }
  },
  { immediate: true }
);
const onSubmit = () => {
  emit("save", { ...form });
};
</script>
