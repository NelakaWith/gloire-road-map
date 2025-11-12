/**
 * @fileoverview AppHeader Component Tests
 * @description Tests for the application header component
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import AppHeader from "../../src/components/common/AppHeader.vue";

// Create a mock router
const createMockRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div>Home</div>" } },
      { path: "/dashboard", component: { template: "<div>Dashboard</div>" } },
      { path: "/members", component: { template: "<div>Members</div>" } },
      { path: "/goals", component: { template: "<div>Goals</div>" } },
      { path: "/attendance", component: { template: "<div>Attendance</div>" } },
      { path: "/analytics", component: { template: "<div>Analytics</div>" } },
    ],
  });
};

// Mock PrimeVue components
const mockPrimeComponents = {
  Menubar: {
    template:
      '<div class="menubar"><slot name="start" /><slot name="end" /></div>',
  },
  Button: {
    template:
      "<button :class=\"text ? 'text-button' : ''\"><i :class=\"icon\"></i>{{ label }}</button>",
    props: ["label", "icon", "text", "rounded"],
  },
};

describe("AppHeader Component", () => {
  let router;
  let wrapper;

  beforeEach(async () => {
    router = createMockRouter();
    await router.push("/");
    await router.isReady();
  });

  const mountComponent = (options = {}) => {
    return mount(AppHeader, {
      global: {
        plugins: [router],
        components: mockPrimeComponents,
        stubs: {
          Menubar: mockPrimeComponents.Menubar,
          Button: mockPrimeComponents.Button,
        },
      },
      ...options,
    });
  };

  test("should render the header component", () => {
    wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".app-header").exists()).toBe(true);
  });

  test("should display brand title", () => {
    wrapper = mountComponent();
    expect(wrapper.text()).toContain("Gloire Road Map");
  });

  test("should render all menu items", () => {
    wrapper = mountComponent();
    // Check for nav menu items (4 items: Dashboard, Members, Attendance, Analytics)
    const menuButtons = wrapper.findAll(".nav-menu-item");
    expect(menuButtons.length).toBe(4);
  });
  test("should emit logout event when logout button is clicked", async () => {
    wrapper = mountComponent();

    // Find the logout button (has pi-sign-out icon)
    const buttons = wrapper.findAll("button");
    const logoutButton = buttons.find((btn) =>
      btn.html().includes("pi-sign-out")
    );

    expect(logoutButton).toBeDefined();
    await logoutButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("logout");
    expect(wrapper.emitted("logout")).toHaveLength(1);
  });

  test("should emit toggle-user-menu event when user button is clicked", async () => {
    wrapper = mountComponent();

    // Find all buttons with aria-label="User menu"
    const allButtons = wrapper.findAll("button");
    const userButton = allButtons.find(
      (btn) => btn.attributes("aria-label") === "User menu"
    );

    expect(userButton).toBeDefined();
    await userButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("toggle-user-menu");
    expect(wrapper.emitted("toggle-user-menu")).toHaveLength(1);
  });

  test("should navigate to dashboard when dashboard menu item is clicked", async () => {
    wrapper = mountComponent();

    const pushSpy = vi.spyOn(router, "push");

    // Find and click dashboard button
    const buttons = wrapper.findAll("button");
    const dashboardButton = buttons.find((btn) =>
      btn.text().includes("Dashboard")
    );

    if (dashboardButton) {
      await dashboardButton.trigger("click");
      expect(pushSpy).toHaveBeenCalledWith("/dashboard");
    }
  });

  test("should have proper aria labels for accessibility", () => {
    wrapper = mountComponent();

    const allButtons = wrapper.findAll("button");
    const userButton = allButtons.find(
      (btn) => btn.attributes("aria-label") === "User menu"
    );
    const logoutButton = allButtons.find(
      (btn) => btn.attributes("aria-label") === "Logout"
    );

    expect(userButton).toBeDefined();
    expect(userButton.attributes("aria-label")).toBe("User menu");

    expect(logoutButton).toBeDefined();
    expect(logoutButton.attributes("aria-label")).toBe("Logout");
  });
});
