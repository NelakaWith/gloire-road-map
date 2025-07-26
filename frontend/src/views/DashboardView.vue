<template>
  <div class="dashboard">
    <header>
      <h2>Student Goals Dashboard</h2>
      <button @click="logout">Logout</button>
    </header>
    <div class="main">
      <div class="students">
        <h3>Students</h3>
        <ul>
          <li
            v-for="student in students"
            :key="student.id"
            @click="selectStudent(student)"
            :class="{
              selected: selectedStudent && selectedStudent.id === student.id,
            }"
          >
            {{ student.name }}
            <button @click.stop="editStudent(student)">Edit</button>
            <button @click.stop="deleteStudent(student.id)">Delete</button>
          </li>
        </ul>
        <form @submit.prevent="addStudent">
          <input v-model="newStudent" placeholder="Add student" required />
          <button type="submit">Add</button>
        </form>
      </div>
      <div class="goals" v-if="selectedStudent">
        <h3>Goals for {{ selectedStudent.name }}</h3>
        <ul>
          <li v-for="goal in goals" :key="goal.id">
            <span :class="{ done: goal.is_completed }">{{ goal.title }}</span>
            <button v-if="!goal.is_completed" @click="markGoalDone(goal.id)">
              Mark Done
            </button>
          </li>
        </ul>
        <form @submit.prevent="addGoal">
          <input v-model="newGoal" placeholder="Add goal" required />
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
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
const selectedStudent = ref(null);
const goals = ref([]);
const newStudent = ref("");
const newGoal = ref("");

const fetchStudents = async () => {
  const res = await axios.get("/api/students", {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  students.value = res.data;
};

const selectStudent = async (student) => {
  selectedStudent.value = student;
  const res = await axios.get(`/api/students/${student.id}/goals`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  goals.value = res.data;
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
    selectedStudent.value = null;
    await fetchStudents();
  }
};

const addGoal = async () => {
  await axios.post(
    `/api/students/${selectedStudent.value.id}/goals`,
    { title: newGoal.value },
    { headers: { Authorization: `Bearer ${auth.token}` } }
  );
  newGoal.value = "";
  await selectStudent(selectedStudent.value);
};

const markGoalDone = async (goalId) => {
  await axios.patch(
    `/api/goals/${goalId}`,
    { is_completed: true },
    { headers: { Authorization: `Bearer ${auth.token}` } }
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

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 40px auto;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2em;
}
.main {
  display: flex;
  gap: 2em;
}
.students,
.goals {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1em;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 0.5em;
}
.selected {
  background: #f0f0f0;
}
.done {
  text-decoration: line-through;
  color: #888;
}
button {
  margin-left: 0.5em;
}
</style>
