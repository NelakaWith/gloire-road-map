import { defineStore } from "pinia";
import axios from "../utils/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  getters: {},
  actions: {
    async login(userName, password) {
      try {
        const res = await axios.post("/api/auth/login", { userName, password });
        this.isAuthenticated = true;
        this.user = res.data.user;
        return { success: true };
      } catch (err) {
        // normalize error message for UI
        const message =
          err.response?.data?.message || err.message || "Login failed";
        // ensure state cleared on failure
        this.isAuthenticated = false;
        this.user = null;
        return { success: false, message };
      }
    },
    async fetchMe() {
      try {
        const res = await axios.get("/api/auth/me");
        this.user = res.data;
        this.isAuthenticated = true;
        return { success: true, user: this.user };
      } catch (err) {
        // token might be invalid/expired
        this.user = null;
        this.isAuthenticated = false;
        const message =
          err.response?.data?.message || err.message || "Failed to fetch user";
        return { success: false, message };
      }
    },
    async logout() {
      try {
        await axios.post("/api/auth/logout", {});
      } catch (err) {
        console.error("Logout request failed:", err);
      } finally {
        // Always clear local state regardless of API call success
        this.user = null;
        this.isAuthenticated = false;
      }
    },
  },
});
