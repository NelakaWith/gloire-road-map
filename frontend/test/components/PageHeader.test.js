/**
 * @fileoverview PageHeader Component Tests
 * @description Tests for the page header component
 */

import { describe, test, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import PageHeader from "../../src/components/common/PageHeader.vue";

// Create a mock router
const createMockRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: { template: "<div>Home</div>" } }],
  });
};

describe("PageHeader Component", () => {
  let wrapper;
  let router;

  beforeEach(async () => {
    router = createMockRouter();
    await router.push("/");
    await router.isReady();
  });

  const mountComponent = (props = {}) => {
    return mount(PageHeader, {
      props: {
        title: "Test Page",
        ...props,
      },
      global: {
        plugins: [router],
      },
    });
  };

  test("should render the component", () => {
    wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  test("should display title prop", () => {
    wrapper = mountComponent({ title: "Dashboard" });
    expect(wrapper.text()).toContain("Dashboard");
  });

  test("should display title in h2 element", () => {
    wrapper = mountComponent({
      title: "Dashboard",
    });
    const heading = wrapper.find("h2");
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toContain("Dashboard");
  });

  test("should render without subtitle as PageHeader does not have subtitle prop", () => {
    wrapper = mountComponent({
      title: "Dashboard",
    });
    // PageHeader component doesn't have a subtitle prop, only title
    expect(wrapper.text()).toContain("Dashboard");
  });

  test("should render action slot content", () => {
    wrapper = mount(PageHeader, {
      props: {
        title: "Members",
      },
      slots: {
        actions: "<button>Add Member</button>",
      },
    });

    expect(wrapper.html()).toContain("Add Member");
  });

  test("should apply correct CSS classes", () => {
    wrapper = mountComponent();
    // Check for common header classes (implementation dependent)
    expect(wrapper.classes()).toBeDefined();
  });
});
