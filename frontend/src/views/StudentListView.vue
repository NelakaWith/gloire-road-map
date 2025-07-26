<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-0">
    <header
      class="flex justify-between items-center max-w-3xl mx-auto py-8 px-4"
    >
      <h2 class="text-2xl font-bold text-indigo-700">Members</h2>
      <button
        @click="showLogoutDialog = true"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ml-4"
      >
        Logout
      </button>
    </header>
    <main class="flex flex-col gap-8 max-w-3xl mx-auto px-4">
      <section class="bg-white rounded-lg shadow p-6">
        <ul class="space-y-2 mb-4">
          <li
            v-for="student in students"
            :key="student.id"
            class="flex justify-between items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
            @click="goToGoals(student.id)"
          >
            <span class="font-medium">{{ student.name }}</span>
            <div class="space-x-2">
              <button
                @click.stop="editStudent(student)"
                class="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                @click.stop="openDeleteDialog(student.id)"
                class="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
        <ConfirmDialog
          :show="showDeleteDialog"
          @confirm="confirmDeleteStudent"
          @cancel="showDeleteDialog = false"
        >
          Are you sure you want to delete this student?
        </ConfirmDialog>
        <form @submit.prevent="addStudent" class="flex gap-2">
          <ConfirmDialog
            :show="showLogoutDialog"
            @confirm="confirmLogout"
            @cancel="showLogoutDialog = false"
          >
            Are you sure you want to logout?
          </ConfirmDialog>

          <input
            v-model="newStudent"
            placeholder="Add student"
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "../store/auth";
import { authHeader } from "../utils/authHeader";
import { useRouter } from "vue-router";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const auth = useAuthStore();
const router = useRouter();
const students = ref([]);
const newStudent = ref("");
const showLogoutDialog = ref(false);

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

const editStudent = async (student) => {
  const name = prompt("Edit student name:", student.name);
  if (name) {
    await axios.patch(
      `/api/students/${student.id}`,
      { name },
      { headers: authHeader() }
    );
    await fetchStudents();
  }
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

const confirmLogout = () => {
  auth.logout();
  router.push("/login");
  showLogoutDialog.value = false;
};

onMounted(async () => {
  if (!auth.token) router.push("/login");
  else {
    await fetchStudents();
  }
});
</script>
