import { createRouter, createWebHistory } from "vue-router";

import LoginView from "./views/LoginView.vue";
import StudentListView from "./views/StudentListView.vue";
import GoalListView from "./views/GoalListView.vue";

const routes = [
  { path: "/", redirect: "/students" },
  { path: "/login", component: LoginView },
  { path: "/students", component: StudentListView },
  { path: "/goals", component: GoalListView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
