/**
 * @fileoverview Auth Store Tests
 * @description Comprehensive tests for authentication store (Pinia)
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../../src/store/auth";
import axios from "../../src/utils/axios";

// Mock axios
vi.mock("../../src/utils/axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("Auth Store", () => {
  let authStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    test("should have correct initial state", () => {
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe("login", () => {
    test("should login successfully with valid credentials", async () => {
      const mockUser = { id: 1, userName: "testuser", role: "admin" };
      axios.post.mockResolvedValue({
        data: { user: mockUser },
      });

      const result = await authStore.login("testuser", "password");

      expect(result.success).toBe(true);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(mockUser);
      expect(axios.post).toHaveBeenCalledWith("/api/auth/login", {
        userName: "testuser",
        password: "password",
      });
    });

    test("should handle login failure with error message", async () => {
      const errorMessage = "Invalid credentials";
      axios.post.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      const result = await authStore.login("testuser", "wrongpassword");

      expect(result.success).toBe(false);
      expect(result.message).toBe(errorMessage);
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
    });

    test("should handle login failure without response data", async () => {
      axios.post.mockRejectedValue(new Error("Network error"));

      const result = await authStore.login("testuser", "password");

      expect(result.success).toBe(false);
      expect(result.message).toContain("Network error");
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
    });

    test("should clear state on failed login", async () => {
      // Set initial authenticated state
      authStore.isAuthenticated = true;
      authStore.user = { id: 1, userName: "olduser" };

      axios.post.mockRejectedValue({
        response: { data: { message: "Invalid credentials" } },
      });

      await authStore.login("testuser", "wrongpassword");

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
    });
  });

  describe("fetchMe", () => {
    test("should fetch user data successfully", async () => {
      const mockUser = { id: 1, userName: "testuser", role: "admin" };
      axios.get.mockResolvedValue({ data: mockUser });

      const result = await authStore.fetchMe();

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(mockUser);
      expect(axios.get).toHaveBeenCalledWith("/api/auth/me");
    });

    test("should handle fetchMe failure", async () => {
      axios.get.mockRejectedValue({
        response: { data: { message: "Unauthorized" } },
      });

      const result = await authStore.fetchMe();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Unauthorized");
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
    });

    test("should clear state on fetchMe failure", async () => {
      // Set initial authenticated state
      authStore.isAuthenticated = true;
      authStore.user = { id: 1, userName: "testuser" };

      axios.get.mockRejectedValue({
        response: { data: { message: "Token expired" } },
      });

      await authStore.fetchMe();

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
    });
  });

  describe("logout", () => {
    test("should logout successfully", async () => {
      // Set authenticated state
      authStore.isAuthenticated = true;
      authStore.user = { id: 1, userName: "testuser" };
      axios.post.mockResolvedValue({});

      await authStore.logout();

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(axios.post).toHaveBeenCalledWith("/api/auth/logout", {});
    });

    test("should clear state even if logout request fails", async () => {
      authStore.isAuthenticated = true;
      authStore.user = { id: 1, userName: "testuser" };
      axios.post.mockRejectedValue(new Error("Network error"));

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await authStore.logout();

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    test("should always clear state in finally block", async () => {
      authStore.isAuthenticated = true;
      authStore.user = { id: 1, userName: "testuser" };

      // Mock a rejected promise
      axios.post.mockRejectedValue(new Error("API error"));
      vi.spyOn(console, "error").mockImplementation(() => {});

      await authStore.logout();

      // State should still be cleared
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
    });
  });
});
