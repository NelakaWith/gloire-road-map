<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="text-gray-600 mb-2">Completions (group: {{ groupBy }})</div>
    <div class="w-full h-96">
      <Line :data="plainChartData" :options="plainChartOptions" />
    </div>
    <div v-if="!chartData" class="text-sm text-gray-500">No data</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import "chartjs-adapter-date-fns";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Filler,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Filler
);

const props = defineProps({
  series: { type: Array, default: () => [] },
  groupBy: { type: String, default: "week" },
});

const chartData = computed(() => {
  if (!props.series || props.series.length === 0) return null;

  // Determine whether labels are parseable as dates
  const firstLabel = props.series[0] && props.series[0].label;
  const isDate = firstLabel && !Number.isNaN(Date.parse(firstLabel));

  // If labels are dates, provide {x,y} points to let time scale parse them
  if (isDate) {
    return {
      datasets: [
        {
          label: "Completions",
          data: props.series.map((r) => ({ x: r.label, y: r.completions })),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.2)",
          fill: true,
        },
      ],
    };
  }

  // Fallback to category labels
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

const chartOptions = computed(() => {
  if (!chartData.value) return {};

  // detect if using time scale by checking first dataset point
  const firstDataset = chartData.value.datasets && chartData.value.datasets[0];
  const usingTime =
    firstDataset &&
    firstDataset.data &&
    firstDataset.data[0] &&
    firstDataset.data[0].x;

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label(context) {
            const v =
              context.parsed && context.parsed.y !== undefined
                ? context.parsed.y
                : context.parsed;
            return `Completions: ${v}`;
          },
        },
      },
    },
    scales: usingTime
      ? {
          x: {
            type: "time",
            time: {
              unit: "week",
              tooltipFormat: "PP",
            },
            title: { display: true, text: "Date" },
          },
          y: { title: { display: true, text: "Completions" } },
        }
      : {
          x: { title: { display: true, text: "Period" } },
          y: { title: { display: true, text: "Completions" } },
        },
  };
});

const plainChartData = computed(() => {
  const d = chartData.value;
  return d ? JSON.parse(JSON.stringify(d)) : { labels: [], datasets: [] };
});

const plainChartOptions = computed(() => {
  const o = chartOptions.value;
  return o ? JSON.parse(JSON.stringify(o)) : {};
});
</script>
