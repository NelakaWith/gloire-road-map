<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-0">
    <header
      class="flex justify-between items-center max-w-3xl mx-auto py-8 px-4"
    >
      <h2 class="text-2xl font-bold text-indigo-700">Members</h2>
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
                @click.stop="deleteStudent(student.id)"
                class="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
        <form @submit.prevent="addStudent" class="flex gap-2">
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
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();
const students = ref([]);
const newStudent = ref("");

const fetchStudents = async () => {
  const res = await axios.get("/api/students", {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  students.value = res.data;
};

const addStudent = async () => {
  await axios.post(
    "/api/students",
    { name: newStudent.value },
    { headers: { Authorization: `Bearer ${auth.token}` } }
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
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );
    await fetchStudents();
  }
};

const deleteStudent = async (id) => {
  if (confirm("Delete this student?")) {
    await axios.delete(`/api/students/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    await fetchStudents();
  }
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
