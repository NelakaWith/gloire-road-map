<template>
  <Card>
    <template #title>Leaderboard</template>
    <template #content>
      <div class="dashboard-subtitle">Top members based on points earned</div>
      <div class="dashboard-grid mt-4">
        <ul>
          <li
            v-for="(entry, index) in leaderboard"
            :key="entry.student.id"
            class="text-lg flex justify-between items-center py-2 px-4 rounded-lg hover:bg-gray-100 cursor-pointer"
            @click="goToGoals(entry.student.id)"
          >
            <div class="flex items-center">
              <div class="flex items-center gap-1 rounded-full w-12 me-2">
                <i
                  class="pi pi-trophy me-2"
                  :class="[
                    entry.rank < 4 ? 'visible' : 'invisible',
                    entry.rank === 1
                      ? 'text-yellow-500' // Gold
                      : entry.rank === 2
                      ? 'text-gray-400' // Silver
                      : entry.rank === 3
                      ? 'text-amber-600' // Bronze
                      : 'text-gray-300',
                  ]"
                ></i>
                <span class="font-semibold text-neutral-500">{{
                  entry.rank
                }}</span>
              </div>
              <span class="font-medium">{{ entry.student.name }} </span>
            </div>
            <span>
              <span class="font-bold">{{ entry.points }}</span>
            </span>
          </li>
        </ul>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../../utils/axios";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();

const leaderboard = ref([]);

const fetchLeaderboard = async () => {
  try {
    const response = await axios.get(`/api/points/leaderboard`);
    leaderboard.value = response.data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Something went wrong :" + error.response?.status,
      life: 3000,
    });
    return;
  }
};

const goToGoals = (studentId) => {
  router.push({ path: "/goals", query: { studentId } });
};

onMounted(async () => {
  await fetchLeaderboard();
});
</script>

<style></style>
