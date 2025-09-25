<template>
  <div class="grid grid-cols-4 gap-4">
    <div
      class="p-4 bg-white rounded shadow"
      v-for="(val, key) in items"
      :key="key"
    >
      <div class="text-sm text-gray-500">{{ key }}</div>
      <div class="text-2xl font-bold">{{ format(val) }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue";
const props = defineProps({ kpis: { type: Object, required: true } });
const items = computed(() => ({
  total_goals: props.kpis.total_goals || 0,
  completed_goals: props.kpis.completed_goals || 0,
  pct_complete: (props.kpis.pct_complete || 0) + "%",
  avg_days_to_complete: props.kpis.avg_days_to_complete || 0,
}));
function format(v) {
  return v;
}
</script>
