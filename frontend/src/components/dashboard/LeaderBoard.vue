<template>
  <Card>
    <template #title>Leaderboard</template>
    <template #content>
      <div class="dashboard-subtitle">Top members based on points earned</div>
      <div class="dashboard-grid mt-4">
        <ul>
          <li
            v-for="(entry, index) in leaderboard"
            :key="entry.id"
            class="flex justify-between items-center py-2 px-4 rounded-lg hover:bg-gray-100 cursor-pointer"
            @click="goToGoals(entry.student_id)"
          >
            <span>
              <span class="font-bold me-4">{{ index + 1 }}</span>
              <span class="font-medium">{{ entry.student_name }} </span>
            </span>
            <span>
              <span class="font-bold">{{ entry.total_points }}</span>
            </span>
          </li>
        </ul>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { authHeader } from "../../utils/authHeader";
import { useRouter } from "vue-router";
import { useToast } from "primevue";

const router = useRouter();
const toast = useToast();

const leaderboard = ref([]);

const fetchLeaderboard = async () => {
  try {
    const response = await axios.get(`/api/points/leaderboard`, {
      headers: authHeader(),
    });
    leaderboard.value = response.data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load leaderboard",
      life: 3000,
    });
    return;
  }
  leaderboard.value = response.data;
};

const goToGoals = (studentId) => {
  router.push({ path: "/goals", query: { studentId } });
};

onMounted(async () => {
  await fetchLeaderboard();
});
</script>

<style></style>
