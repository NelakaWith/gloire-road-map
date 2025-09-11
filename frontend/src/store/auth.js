import { defineStore } from "pinia";
import axios from "axios";
import { authHeader } from "../utils/authHeader";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(userName, password) {
      localStorage.removeItem("token");
      try {
        const res = await axios.post("/api/auth/login", { userName, password });
        this.token = res.data.token;
        localStorage.setItem("token", this.token);
        await this.fetchMe();
        return { success: true };
      } catch (err) {
        // normalize error message for UI
        const message =
          err.response?.data?.message || err.message || "Login failed";
        // ensure token cleared on failure
        this.token = "";
        localStorage.removeItem("token");
        return { success: false, message };
      }
    },
    async fetchMe() {
      if (!this.token) return;
      try {
        const res = await axios.get("/api/auth/me", {
          headers: authHeader(),
        });
        this.user = res.data;
        return { success: true, user: this.user };
      } catch (err) {
        // token might be invalid/expired
        this.user = null;
        this.token = "";
        localStorage.removeItem("token");
        const message =
          err.response?.data?.message || err.message || "Failed to fetch user";
        return { success: false, message };
      }
    },
    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("token");
    },
  },
});
