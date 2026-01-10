/**
 * @fileoverview Axios configuration and interceptors
 * @description Global axios configuration with error handling for rate limiting and other HTTP errors
 */

import axios from "axios";
import { useToast } from "primevue/usetoast";

/**
 * Setup axios interceptors for global error handling
 * @description Configures response interceptor to handle common HTTP errors like rate limiting (429)
 */
export function setupAxiosInterceptors() {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const toast = useToast();

      if (error.response?.status === 429) {
        // Too Many Requests - Rate Limited
        const retryAfter = error.response.data?.retryAfter || "a few minutes";
        const message =
          error.response.data?.error ||
          `Too many requests. Please try again after ${retryAfter}.`;

        toast.add({
          severity: "warn",
          summary: "Rate Limit Exceeded",
          detail: message,
          life: 5000,
        });
      }

      // Pass the error along so individual handlers can still catch it
      return Promise.reject(error);
    }
  );
}
