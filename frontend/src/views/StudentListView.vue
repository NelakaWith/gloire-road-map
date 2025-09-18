<template>
  <div class="py-0">
    <header
      class="flex justify-between items-center max-w-3xl mx-auto py-8 px-4"
    >
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Members</h2>
    </header>
    <main class="flex flex-col gap-8 max-w-3xl mx-auto px-4">
      <Card class="p-6">
        <template #content>
          <ul class="space-y-2 mb-4">
            <li
              v-for="student in students"
              :key="student.id"
              class="flex justify-between items-center py-2 px-4 rounded-lg hover:bg-gray-100 cursor-pointer"
              @click="goToGoals(student.id)"
            >
              <span class="font-medium">{{ student.name }}</span>
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
          <form @submit.prevent="addStudent" class="flex gap-2">
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
    <ConfirmDialog
      :show="showDeleteDialog"
      @confirm="confirmDeleteStudent"
      @cancel="showDeleteDialog = false"
    >
      Are you sure you want to delete this member?
    </ConfirmDialog>

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
import ConfirmDialog from "../components/ConfirmDialog.vue";
import EditMemberModal from "../components/EditMemberModal.vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Card from "primevue/card";

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
      { name: updatedStudent.name },
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

const showDeleteDialog = ref(false);
let studentIdToDelete = null;
const openDeleteDialog = (id) => {
  studentIdToDelete = id;
  showDeleteDialog.value = true;
};
const confirmDeleteStudent = async () => {
  if (studentIdToDelete) {
    await axios.delete(`/api/students/${studentIdToDelete}`, {
      headers: authHeader(),
    });
    await fetchStudents();
  }
  showDeleteDialog.value = false;
  studentIdToDelete = null;
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
