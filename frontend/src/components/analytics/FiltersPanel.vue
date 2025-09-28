<template>
  <Card>
    <template #content>
      <div class="flex items-center gap-4 w-full">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Start</label>
          <DatePicker v-model="start" :showIcon="true" class="block" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">End</label>
          <DatePicker v-model="end" :showIcon="true" class="block" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Group</label>
          <Dropdown
            v-model="group"
            :options="groupOptions"
            optionLabel="label"
            optionValue="value"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({ initialStart: Date, initialEnd: Date });
const emit = defineEmits(["change", "update:groupBy"]);

// use Date objects directly (PrimeVue DatePicker binds to Date)
const start = ref(props.initialStart || null);
const end = ref(props.initialEnd || null);
const group = ref("week");

const groupOptions = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

// update when props change
watch(
  () => props.initialStart,
  (v) => {
    start.value = v || null;
  }
);
watch(
  () => props.initialEnd,
  (v) => {
    end.value = v || null;
  }
);

// emit when any filter changes
watch([start, end, group], () => {
  // ensure we emit Dates (or null) to match previous contract
  emit("update:groupBy", group.value);
  emit("change", { start: start.value, end: end.value, group: group.value });
});
</script>
