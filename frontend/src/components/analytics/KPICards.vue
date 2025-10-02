<template>
  <div class="grid grid-cols-4 gap-4">
    <Card v-for="item in items" :key="item.id">
      <template #content>
        <div class="flex items-center gap-2">
          <i v-if="item.icon" :class="item.icon"></i>
          <div class="text-sm text-gray-500">{{ item.label }}</div>
        </div>
        <div class="text-2xl font-bold">{{ format(item.id, item.value) }}</div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue";
const props = defineProps({ kpis: { type: Object, required: true } });
const items = computed(() => [
  {
    id: "total_goals",
    label: "Total goals",
    value: props.kpis.total_goals || 0,
    icon: "pi pi-list",
  },
  {
    id: "completed_goals",
    label: "Completed goals",
    value: props.kpis.completed_goals || 0,
    icon: "pi pi-check",
  },
  {
    id: "pct_complete",
    label: "Percent complete",
    value: props.kpis.pct_complete || 0,
    icon: "pi pi-percentage",
  },
  {
    id: "avg_days_to_complete",
    label: "Avg days to complete",
    value: props.kpis.avg_days_to_complete || 0,
    icon: "pi pi-clock",
  },
]);

function format(id, v) {
  if (id === "pct_complete") return `${v}%`;
  return v;
}
</script>
