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
            class="flex justify-between items-center py-2 px-4 rounded-lg cursor-pointer hover:bg-gray-100"
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
              <Button
                @click.stop="openGoalModal(goal, 'edit')"
                title="Edit"
                icon="pi pi-pencil"
                severity="warning"
                size="small"
              >
              </Button>
              <Button
                title="Delete"
                @click.stop="openDeleteDialog(goal)"
                icon="pi pi-trash"
                severity="danger"
                size="small"
              ></Button>
              <Button
                v-if="!goal.is_completed"
                @click.stop="markGoalDone(goal.id, true)"
                severity="info"
                icon="pi pi-check"
                size="small"
              >
              </Button>
              <Button
                v-else
                @click.stop="markGoalDone(goal.id, false)"
                severity="secondary"
                icon="pi pi-undo"
                size="small"
              >
              </Button>
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
