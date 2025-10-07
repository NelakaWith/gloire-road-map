<template>
  <div class="pb-4">
    <PageHeader title="Members" :showBack="true" />
    <main class="flex flex-col gap-8 max-w-3xl mx-auto px-4">
      <Card class="p-6">
        <template #content>
          <div class="scrollable-panel">
            <ul class="space-y-2 mb-4">
              <li
                v-for="student in students"
                :key="student.id"
                class="flex justify-between items-center py-2 px-4 rounded-lg hover:bg-gray-100 cursor-pointer"
                @click="goToGoals(student.id)"
              >
                <div class="flex items-center">
                  <div
                    class="flex items-center gap-1 mr-4 rounded-full px-4 py-1 bg-yellow-100 text-yellow-800"
                  >
                    <i class="pi pi-trophy"></i>
                    <span class="font-bold">{{ student.points }}</span>
                  </div>
                  <span class="font-medium">{{ student.name }}</span>
                </div>

                <div class="space-x-2">
                  <Button
                    @click.stop="editStudent(student)"
                    size="small"
                    severity="info"
                    label="Edit"
                  />
                  <Button
                    @click.stop="openDeleteDialog(student.id)"
                    size="small"
                    severity="danger"
                    label="Delete"
                  />
                </div>
              </li>
            </ul>
          </div>
          <form @submit.prevent="addStudent" class="flex gap-2 mt-2">
            <InputText
              v-model="newStudent"
              placeholder="Add a member"
              class="flex-1"
            />
            <Button type="submit" label="Add" icon="pi pi-plus" />
          </form>
        </template>
      </Card>
    </main>

    <EditMemberModal
      :show="showEditModal"
      :member="editingStudent"
      :loading="editLoading"
      @save="handleEditSave"
      @cancel="handleEditCancel"
      @update:show="showEditModal = $event"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "../store/auth";
import { authHeader } from "../utils/authHeader";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import EditMemberModal from "../components/EditMemberModal.vue";
import PageHeader from "../components/common/PageHeader.vue";

const auth = useAuthStore();
const router = useRouter();
const students = ref([]);
const newStudent = ref("");
const showEditModal = ref(false);
const editingStudent = ref(null);
const editLoading = ref(false);

const fetchStudents = async () => {
  const res = await axios.get("/api/students", {
    headers: authHeader(),
  });
  students.value = res.data;
};

const addStudent = async () => {
  await axios.post(
    "/api/students",
    { name: newStudent.value },
    { headers: authHeader() }
  );
  newStudent.value = "";
  await fetchStudents();
};

const editStudent = (student) => {
  editingStudent.value = student;
  showEditModal.value = true;
};

const handleEditSave = async (updatedStudent) => {
  editLoading.value = true;
  try {
    await axios.patch(
      `/api/students/${updatedStudent.id}`,
      { ...updatedStudent },
      { headers: authHeader() }
    );
    await fetchStudents();
    showEditModal.value = false;
  } catch (error) {
    console.error("Error updating student:", error);
  } finally {
    editLoading.value = false;
  }
};

const handleEditCancel = () => {
  showEditModal.value = false;
  editingStudent.value = null;
};

const confirm = useConfirm();

const openDeleteDialog = (id) => {
  confirm.require({
    message: "Are you sure you want to delete this member?",
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
      await axios.delete(`/api/students/${id}`, { headers: authHeader() });
      await fetchStudents();
    },
  });
};

const goToGoals = (studentId) => {
  router.push({ path: "/goals", query: { studentId } });
};

onMounted(async () => {
  if (!auth.token) router.push("/login");
  else {
    await fetchStudents();
  }
});
</script>
