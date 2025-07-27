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
            class="flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-100"
            @click="openGoalModal(goal, 'view')"
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
              @click.stop="markGoalDone(goal.id, true)"
              class="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
            >
              Mark Done
            </button>
            <button
              v-else
              @click.stop="markGoalDone(goal.id, false)"
              class="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
            >
              Reopen
            </button>
          </li>
        </ul>
        <GoalModal
          v-if="showGoalModal"
          :show="showGoalModal"
          :mode="goalModalMode"
          :goal="selectedGoal"
          @close="closeGoalModal"
          @save="handleSaveGoal"
          @edit="openGoalModal(selectedGoal, 'edit')"
          @delete="showDeleteDialog = true"
        />
        <ConfirmDialog
          :show="showDeleteDialog"
          @confirm="handleDeleteGoal"
          @cancel="showDeleteDialog = false"
        >
          Are you sure you want to delete this goal?
        </ConfirmDialog>
        <div class="mb-4 flex justify-center">
          <button
            @click="openGoalModal(null, 'add')"
            class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Add Goal
          </button>
        </div>
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
import GoalModal from "../components/GoalModal.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const selectedStudent = ref(null);
const goals = ref([]);
const showGoalModal = ref(false);
const goalModalMode = ref("view");
const selectedGoal = ref(null);
const showDeleteDialog = ref(false);

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

const openGoalModal = (goal, mode) => {
  if (goal && goal.id) {
    // fetch full goal details
    axios
      .get(`/api/goals/${goal.id}`, { headers: authHeader() })
      .then((res) => {
        selectedGoal.value = res.data;
        goalModalMode.value = mode;
        showGoalModal.value = true;
      });
  } else {
    selectedGoal.value = null;
    goalModalMode.value = mode;
    showGoalModal.value = true;
  }
};
const closeGoalModal = () => {
  showGoalModal.value = false;
  selectedGoal.value = null;
};

const handleSaveGoal = async (goalData) => {
  if (goalModalMode.value === "add") {
    await axios.post(
      `/api/goals`,
      {
        student_id: selectedStudent.value.id,
        ...goalData,
      },
      { headers: authHeader() }
    );
  } else if (goalModalMode.value === "edit" && selectedGoal.value) {
    await axios.patch(`/api/goals/${selectedGoal.value.id}`, goalData, {
      headers: authHeader(),
    });
  }
  await fetchStudentAndGoals();
  closeGoalModal();
};

const handleDeleteGoal = async () => {
  if (selectedGoal.value) {
    await axios.delete(`/api/goals/${selectedGoal.value.id}`, {
      headers: authHeader(),
    });
    await fetchStudentAndGoals();
    showDeleteDialog.value = false;
    closeGoalModal();
  }
};

const markGoalDone = async (goalId, done = true) => {
  await axios.patch(
    `/api/goals/${goalId}`,
    { is_completed: done },
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
