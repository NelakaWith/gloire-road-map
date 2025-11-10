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
import AnalyticsView from "./views/AnalyticsView.vue";
import AttendanceView from "./views/AttendanceView.vue";

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
        component: AnalyticsView,
      },
      {
        path: "attendance",
        name: "Attendance",
        component: AttendanceView,
      },
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

  if (requiresAuth) {
    // For protected routes, always check authentication status
    // This handles both initial load and navigation to protected routes
    try {
      const result = await authStore.fetchMe();
      if (result.success) {
        next();
      } else {
        next("/auth/login");
      }
    } catch (error) {
      next("/auth/login");
    }
  } else if (to.path === "/auth/login") {
    // Check if user is already authenticated when trying to access login
    try {
      const result = await authStore.fetchMe();
      if (result.success) {
        next("/");
      } else {
        next();
      }
    } catch (error) {
      next();
    }
  } else {
    next();
  }
});

export default router;
