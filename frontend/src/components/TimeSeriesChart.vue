<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="text-gray-600 mb-2">Completions (group: {{ groupBy }})</div>
    <line-chart
      v-if="chartData"
      :chart-data="chartData"
      :chart-options="chartOptions"
    />
    <div v-else class="text-sm text-gray-500">No data</div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

const props = defineProps({
  series: { type: Array, default: () => [] },
  groupBy: { type: String, default: "week" },
});

const chartData = computed(() => {
  if (!props.series || props.series.length === 0) return null;
  return {
    labels: props.series.map((r) => r.label),
    datasets: [
      {
        label: "Completions",
        data: props.series.map((r) => r.completions),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        fill: true,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

// Local registration wrapper
const lineChart = {
  extends: Line,
  props: ["chartData", "chartOptions"],
};

defineExpose({ chartData, chartOptions });
</script>

<script>
export default {
  components: { Line },
};
</script>
