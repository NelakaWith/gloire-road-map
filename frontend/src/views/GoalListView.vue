<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-0">
    <header
      class="flex justify-between items-center max-w-3xl mx-auto py-8 px-4"
    >
      <h2 class="text-2xl font-bold text-indigo-700">Goals</h2>
      <router-link
        to="/students"
        class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded shadow"
        >Go to Back</router-link
      >
    </header>
    <main class="flex flex-col gap-8 max-w-3xl mx-auto px-4">
      <section v-if="selectedStudent" class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4 text-indigo-600">
          Goals for {{ selectedStudent.name }}
        </h3>
        <ul class="space-y-2 mb-4" v-if="goals.length">
          <li
            v-for="goal in goals"
            :key="goal.id"
            class="flex justify-between items-center p-2 rounded"
          >
            <span
              :class="[
                'flex-1',
                goal.is_completed ? 'line-through text-gray-400' : '',
              ]"
              >{{ goal.title }}</span
            >
            <button
              v-if="!goal.is_completed"
              @click="markGoalDone(goal.id)"
              class="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
            >
              Mark Done
            </button>
          </li>
        </ul>
        <div class="mb-4 flex justify-center">
          <button
            @click="showAddGoal = !showAddGoal"
            class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {{ showAddGoal ? "Cancel" : "Add Goal" }}
          </button>
        </div>
        <form
          v-if="showAddGoal"
          @submit.prevent="addGoal"
          class="flex gap-2 mb-2"
        >
          <input
            v-model="newGoal"
            placeholder="Add goal"
            required
            class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </form>
      </section>
      <section
        v-else
        class="bg-white rounded-lg shadow p-6 text-center text-gray-500"
      >
        <p>Select a student from the Students page to view and add goals.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "../store/auth";
import { authHeader } from "../utils/authHeader";
import { useRouter, useRoute } from "vue-router";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const selectedStudent = ref(null);
const goals = ref([]);
const newGoal = ref("");
const showAddGoal = ref(false);

const fetchStudentAndGoals = async () => {
  const studentId = route.query.studentId;
  if (!studentId) {
    selectedStudent.value = null;
    goals.value = [];
    return;
  }
  const resStudent = await axios.get(`/api/students`, {
    headers: authHeader(),
  });
  const student = resStudent.data.find((s) => s.id == studentId);
  selectedStudent.value = student;
  if (student) {
    const resGoals = await axios.get(`/api/students/${studentId}/goals`, {
      headers: authHeader(),
    });
    goals.value = resGoals.data;
  } else {
    goals.value = [];
  }
};

const addGoal = async () => {
  await axios.post(
    `/api/students/${selectedStudent.value.id}/goals`,
    { title: newGoal.value },
    { headers: authHeader() }
  );
  newGoal.value = "";
  showAddGoal.value = false;
  await fetchStudentAndGoals();
};

const markGoalDone = async (goalId) => {
  await axios.patch(
    `/api/goals/${goalId}`,
    { is_completed: true },
    { headers: authHeader() }
  );
  await fetchStudentAndGoals();
};

onMounted(async () => {
  if (!auth.token) router.push("/login");
  else {
    await fetchStudentAndGoals();
  }
});
</script>
