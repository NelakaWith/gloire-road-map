<template>
  <div class="p-4 bg-white rounded shadow flex items-center gap-4">
    <div>
      <label class="text-sm text-gray-600">Start</label>
      <input
        type="date"
        v-model="startStr"
        class="block"
        @change="emitChange"
      />
    </div>
    <div>
      <label class="text-sm text-gray-600">End</label>
      <input type="date" v-model="endStr" class="block" @change="emitChange" />
    </div>
    <div>
      <label class="text-sm text-gray-600">Group</label>
      <select v-model="group" @change="emitChange">
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
const props = defineProps({ initialStart: Date, initialEnd: Date });
const emit = defineEmits(["change", "update:groupBy"]);
const startStr = ref(
  props.initialStart ? props.initialStart.toISOString().slice(0, 10) : ""
);
const endStr = ref(
  props.initialEnd ? props.initialEnd.toISOString().slice(0, 10) : ""
);
const group = ref("week");

function emitChange() {
  const start = new Date(startStr.value);
  const end = new Date(endStr.value);
  emit("update:groupBy", group.value);
  emit("change", { start, end, group: group.value });
}
</script>
