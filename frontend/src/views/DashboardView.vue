<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-0">
    <header
      class="flex justify-between items-center max-w-3xl mx-auto py-8 px-4"
    >
      <h2 class="text-2xl font-bold text-indigo-700">
        Student Goals Dashboard
      </h2>
      <button
        @click="logout"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
      >
        Logout
      </button>
    </header>
    <main class="flex flex-col md:flex-row gap-8 max-w-3xl mx-auto px-4">
      <section class="flex-1 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4 text-indigo-600">Students</h3>
        <ul class="space-y-2 mb-4">
          <li
            v-for="student in students"
            :key="student.id"
            @click="selectStudent(student)"
            :class="[
              'flex justify-between items-center p-2 rounded cursor-pointer',
              selectedStudent && selectedStudent.id === student.id
                ? 'bg-indigo-100'
                : 'hover:bg-gray-100',
            ]"
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
      <section
        v-if="selectedStudent"
        class="flex-1 bg-white rounded-lg shadow p-6"
      >
        <h3 class="text-lg font-semibold mb-4 text-indigo-600">
          Goals for {{ selectedStudent.name }}
        </h3>
        <ul class="space-y-2 mb-4">
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
        <form @submit.prevent="addGoal" class="flex gap-2">
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";
import { authHeader } from "../utils/authHeader";

const auth = useAuthStore();
const router = useRouter();
const students = ref([]);
const selectedStudent = ref(null);
const goals = ref([]);
const newStudent = ref("");
const newGoal = ref("");

const fetchStudents = async () => {
  const res = await axios.get("/api/students", {
    headers: authHeader(),
  });
  students.value = res.data;
};

const selectStudent = async (student) => {
  selectedStudent.value = student;
  const res = await axios.get(`/api/students/${student.id}/goals`, {
    headers: authHeader(),
  });
  goals.value = res.data;
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

const deleteStudent = async (id) => {
  if (confirm("Delete this student?")) {
    await axios.delete(`/api/students/${id}`, {
      headers: authHeader(),
    });
    selectedStudent.value = null;
    await fetchStudents();
  }
};

const addGoal = async () => {
  await axios.post(
    `/api/students/${selectedStudent.value.id}/goals`,
    { title: newGoal.value },
    { headers: authHeader() }
  );
  newGoal.value = "";
  await selectStudent(selectedStudent.value);
};

const markGoalDone = async (goalId) => {
  await axios.patch(
    `/api/goals/${goalId}`,
    { is_completed: true },
    { headers: authHeader() }
  );
  await selectStudent(selectedStudent.value);
};

const logout = () => {
  auth.logout();
  router.push("/login");
};

onMounted(async () => {
  if (!auth.token) router.push("/login");
  else {
    await fetchStudents();
  }
});
</script>
