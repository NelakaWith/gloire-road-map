import { defineStore } from "pinia";
import axios from "axios";
import { authHeader } from "../utils/authHeader";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: null,
  }),
  actions: {
    async login(userName, password) {
      localStorage.removeItem("token");
      const res = await axios.post("/api/auth/login", { userName, password });
      this.token = res.data.token;
      localStorage.setItem("token", this.token);
      await this.fetchMe();
    },
    async fetchMe() {
      if (!this.token) return;
      const res = await axios.get("/api/auth/me", {
        headers: authHeader(),
      });
      this.user = res.data;
    },
    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("token");
    },
  },
});
