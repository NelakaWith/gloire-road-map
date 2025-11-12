/**
 * @fileoverview Vitest setup configuration for frontend tests
 * @description Sets up global mocks and utilities for Vue component testing
 */

import { vi } from "vitest";
import { config } from "@vue/test-utils";

// Mock PrimeVue toast service
const mockToast = {
  add: vi.fn(),
  removeGroup: vi.fn(),
  removeAllGroups: vi.fn(),
};

// Mock PrimeVue confirm service
const mockConfirm = {
  require: vi.fn(),
  close: vi.fn(),
};

// Provide mocks globally
config.global.mocks = {
  $toast: mockToast,
  $confirm: mockConfirm,
};

// Mock global properties
config.global.provide = {
  toast: mockToast,
  confirm: mockConfirm,
};

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
