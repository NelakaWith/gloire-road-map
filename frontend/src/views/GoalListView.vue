<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-0">
    <header
      class="flex justify-start items-center max-w-3xl mx-auto py-8 px-4 mb-2"
    >
      <router-link
        to="/students"
        class="flex items-center text-gray-600 hover:text-gray-900"
      >
        <i class="pi pi-chevron-left mr-2"></i>
      </router-link>
      <h2 class="text-2xl font-bold text-gray-900">Goals</h2>
    </header>
    <main class="flex flex-col gap-8 max-w-3xl mx-auto px-4">
      <section v-if="selectedStudent" class="bg-white rounded-lg shadow p-6">
        <ul class="space-y-2 mb-4" v-if="goals.length">
          <li
            v-for="goal in goals"
            :key="goal.id"
            class="flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-100"
            @click="openGoalModal(goal, 'view')"
          >
            <div class="flex-1">
              <div
                :class="[
                  'font-semibold text-xl',
                  goal.is_completed ? 'line-through text-gray-400' : '',
                ]"
              >
                {{ goal.title }}
              </div>
              <span v-if="goal.target_date" class="text-gray-500 text-sm italic"
                >ETA: {{ goal.target_date }}</span
              >
            </div>
            <div class="flex gap-2 items-center">
              <button
                class="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded"
                @click.stop="openGoalModal(goal, 'edit')"
              >
                Edit
              </button>
              <button
                class="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center"
                title="Delete"
                @click.stop="openDeleteDialog(goal)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                  />
                </svg>
              </button>
              <button
                v-if="!goal.is_completed"
                @click.stop="markGoalDone(goal.id, true)"
                class="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
              >
                Mark as Done
              </button>
              <button
                v-else
                @click.stop="markGoalDone(goal.id, false)"
                class="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
              >
                Reopen
              </button>
            </div>
          </li>
        </ul>
        <GoalModal
          :show="showGoalModal"
          :mode="goalModalMode"
          :goal="selectedGoal"
          @close="closeGoalModal"
          @save="handleSaveGoal"
          @edit="openGoalModal(selectedGoal, 'edit')"
          @delete="showDeleteDialog = true"
          @update:show="showGoalModal = $event"
        />
        <ConfirmDialog
          :show="showDeleteDialog"
          @confirm="handleDeleteGoal"
          @cancel="showDeleteDialog = false"
        >
          Are you sure you want to delete this goal?
        </ConfirmDialog>
        <div class="mb-4 flex justify-center">
          <Button
            type="submit"
            label="Add a Goal"
            icon="pi pi-plus"
            @click="openGoalModal(null, 'add')"
          />
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

const openDeleteDialog = (goal) => {
  selectedGoal.value = goal;
  showDeleteDialog.value = true;
};

onMounted(async () => {
  if (!auth.token) router.push("/login");
  else {
    await fetchStudentAndGoals();
  }
});
</script>
