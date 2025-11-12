/**
 * @fileoverview Axios configuration tests
 * @description Tests for axios instance configuration and defaults
 */

import { describe, test, expect, beforeEach } from "vitest";
import axios from "../../src/utils/axios";

describe("Axios Configuration", () => {
  test("should have withCredentials enabled", () => {
    expect(axios.defaults.withCredentials).toBe(true);
  });

  test("should have baseURL configured", () => {
    // Should either be from env var or empty string
    expect(typeof axios.defaults.baseURL).toBe("string");
  });

  test("should be an axios instance", () => {
    expect(axios).toBeDefined();
    expect(typeof axios.get).toBe("function");
    expect(typeof axios.post).toBe("function");
    expect(typeof axios.put).toBe("function");
    expect(typeof axios.delete).toBe("function");
  });

  test("should have interceptors configured", () => {
    expect(axios.interceptors).toBeDefined();
    expect(axios.interceptors.request).toBeDefined();
    expect(axios.interceptors.response).toBeDefined();
  });
});
