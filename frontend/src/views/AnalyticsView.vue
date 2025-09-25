<template>
  <div class="p-4">
    <PageHeader title="Analytics" />

    <FiltersPanel
      :initial-start="initialStart"
      :initial-end="initialEnd"
      v-model:groupBy="groupBy"
      @change="onFiltersChange"
    />

    <KPICards :kpis="kpis" />

    <div class="grid gap-4 mt-4">
      <div class="col-12 md:col-8">
        <TimeSeriesChart :series="completionsSeries" :group-by="groupBy" />
      </div>
      <div class="col-12 md:col-4">
        <StudentBarChart :students="byStudent" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { authHeader } from "../utils/authHeader";
import PageHeader from "../components/PageHeader.vue";
import KPICards from "../components/KPICards.vue";
import TimeSeriesChart from "../components/TimeSeriesChart.vue";
import StudentBarChart from "../components/StudentBarChart.vue";
import FiltersPanel from "../components/FiltersPanel.vue";

const kpis = ref({
  total_goals: 0,
  completed_goals: 0,
  pct_complete: 0,
  avg_days_to_complete: 0,
});
const completionsSeries = ref([]);
const byStudent = ref([]);
const groupBy = ref("week");

const initialEnd = new Date();
const initialStart = new Date();
initialStart.setDate(initialEnd.getDate() - 90);

async function loadOverview(start, end) {
  const res = await axios.get("/api/analytics/overview", {
    params: { start_date: start.toISOString(), end_date: end.toISOString() },
    headers: authHeader(),
  });
  kpis.value = res.data || kpis.value;
}

async function loadCompletions(start, end, group) {
  const res = await axios.get("/api/analytics/completions", {
    params: {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      group_by: group,
    },
    headers: authHeader(),
  });
  completionsSeries.value = res.data || [];
}

async function loadByStudent(start, end) {
  const res = await axios.get("/api/analytics/by-student", {
    params: {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      limit: 10,
    },
    headers: authHeader(),
  });
  byStudent.value = res.data || [];
}

async function refreshAll(
  start = initialStart,
  end = initialEnd,
  group = groupBy.value
) {
  await Promise.all([
    loadOverview(start, end),
    loadCompletions(start, end, group),
    loadByStudent(start, end),
  ]);
}

function onFiltersChange({ start, end, group }) {
  groupBy.value = group || groupBy.value;
  refreshAll(start, end, groupBy.value);
}

onMounted(() => refreshAll());
</script>

<style scoped>
/* minimal spacing; UI styled by prime/tailwind in the project */
</style>
