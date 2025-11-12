<template>
  <div class="pb-4">
    <PageHeader :title="pageTitle" :showBack="true" />
    <main class="flex flex-col gap-4 mx-auto">
      <Card v-if="selectedStudent" class="p-6">
        <template #content>
          <div class="scrollable-panel">
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
                  <span
                    v-if="goal.target_date"
                    class="text-gray-500 text-sm italic"
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
                    severity="warn"
                    icon="pi pi-undo"
                    size="small"
                  >
                  </Button>
                </div>
              </li>
            </ul>
          </div>

          <GoalModal
            :show="showGoalModal"
            :mode="goalModalMode"
            :goal="selectedGoal"
            @close="closeGoalModal"
            @save="handleSaveGoal"
            @edit="openGoalModal(selectedGoal, 'edit')"
            @delete="openDeleteDialog(selectedGoal)"
            @update:show="showGoalModal = $event"
          />
          <div class="flex justify-center">
            <Button
              type="submit"
              label="Add a Goal"
              icon="pi pi-plus"
              @click="openGoalModal(null, 'add')"
            />
          </div>
        </template>
      </Card>
      <Card v-else class="p-6 text-center text-gray-500">
        <template #content>
          <p>Select a student from the Students page to view and add goals.</p>
        </template>
      </Card>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "../utils/axios";
import { useAuthStore } from "../store/auth";
import { useRouter, useRoute } from "vue-router";
import GoalModal from "../components/GoalModal.vue";
import PageHeader from "../components/common/PageHeader.vue";
import { useConfirm } from "primevue/useconfirm";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const confirm = useConfirm();
const selectedStudent = ref(null);
const goals = ref([]);
const showGoalModal = ref(false);
const goalModalMode = ref("view");
const selectedGoal = ref(null);
const pageTitle = computed(() => {
  if (selectedStudent.value && selectedStudent.value.name) {
    const first = selectedStudent.value.name.split(" ")[0];
    return `${first}'s Goals`;
  }
  return "Goals";
});

const fetchStudentAndGoals = async () => {
  const studentId = route.query.studentId;
  if (!studentId) {
    selectedStudent.value = null;
    goals.value = [];
    return;
  }
  const resStudent = await axios.get(`/api/students`, {
    params: { limit: 100 },
  });
  const studentData = Array.isArray(resStudent.data)
    ? resStudent.data
    : resStudent.data.students || [];
  const student = studentData.find((s) => s.id == studentId);
  selectedStudent.value = student;
  if (student) {
    const resGoals = await axios.get(`/api/students/${studentId}/goals`);
    goals.value = resGoals.data;
  } else {
    goals.value = [];
  }
};

const openGoalModal = (goal, mode) => {
  if (goal && goal.id) {
    // fetch full goal details
    axios.get(`/api/goals/${goal.id}`).then((res) => {
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
    await axios.post(`/api/goals`, {
      student_id: selectedStudent.value.id,
      ...goalData,
    });
  } else if (goalModalMode.value === "edit" && selectedGoal.value) {
    await axios.patch(`/api/goals/${selectedGoal.value.id}`, goalData);
  }
  await fetchStudentAndGoals();
  closeGoalModal();
};

const markGoalDone = async (goalId, done = true) => {
  await axios.patch(`/api/goals/${goalId}`, { is_completed: done });
  await fetchStudentAndGoals();
};

const openDeleteDialog = (goal) => {
  selectedGoal.value = goal;
  confirm.require({
    message: "Are you sure you want to delete this goal?",
    header: "Confirm",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: async () => {
      if (selectedGoal.value && selectedGoal.value.id) {
        await axios.delete(`/api/goals/${selectedGoal.value.id}`);
        await fetchStudentAndGoals();
        closeGoalModal();
      }
    },
  });
};

onMounted(async () => {
  if (!auth.isAuthenticated) router.push("/login");
  else {
    await fetchStudentAndGoals();
  }
});
</script>
