import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./store/auth";

// Layouts
import AuthLayout from "./layouts/AuthLayout.vue";
import MainLayout from "./layouts/MainLayout.vue";

// Views
import LoginView from "./views/LoginView.vue";
import DashboardView from "./views/DashboardView.vue";
import StudentListView from "./views/MemberListView.vue";
import GoalListView from "./views/GoalListView.vue";

const routes = [
  // Auth routes with AuthLayout
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "Login",
        component: LoginView,
      },
      // Add more auth routes here (register, forgot-password, etc.)
    ],
  },

  // Main app routes with MainLayout
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/dashboard",
      },
      {
        path: "dashboard",
        name: "Dashboard",
        component: DashboardView,
      },
      {
        path: "members",
        name: "Members",
        component: StudentListView,
      },
      {
        path: "goals",
        name: "Goals",
        component: GoalListView,
      },
      {
        path: "analytics",
        name: "Analytics",
        component: () => import("./views/AnalyticsView.vue"),
      },
      // Add more main routes here (dashboard, profile, etc.)
    ],
  },

  // Redirect old login route
  { path: "/login", redirect: "/auth/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // If we have a token but no user loaded, try to validate it via /me
  if (authStore.token && !authStore.user) {
    await authStore.fetchMe();
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    next("/auth/login");
  } else if (to.path === "/auth/login" && authStore.isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
