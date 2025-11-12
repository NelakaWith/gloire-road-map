/**
 * @fileoverview ConfirmDialog Component Tests
 * @description Tests for the confirmation dialog component
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ConfirmDialog from "../../src/components/common/ConfirmDialog.vue";

// Mock PrimeVue ConfirmDialog
const mockConfirmDialog = {
  template: '<div class="confirm-dialog"><slot /></div>',
};

describe("ConfirmDialog Component", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should render the component when show is true", () => {
    wrapper = mount(ConfirmDialog, {
      props: {
        show: true,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  test("should not render when show prop is false", () => {
    wrapper = mount(ConfirmDialog, {
      props: {
        show: false,
      },
    });
    // Component uses v-if="show", so the dialog is not rendered
    expect(wrapper.find(".fixed").exists()).toBe(false);
  });

  test("should render when show prop is true", () => {
    wrapper = mount(ConfirmDialog, {
      props: {
        show: true,
      },
    });
    expect(wrapper.find(".fixed").exists()).toBe(true);
  });

  test("should emit confirm event when Yes button is clicked", async () => {
    wrapper = mount(ConfirmDialog, {
      props: {
        show: true,
      },
    });

    const yesButton = wrapper.findAll("button")[0];
    await yesButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("confirm");
  });

  test("should emit cancel event when No button is clicked", async () => {
    wrapper = mount(ConfirmDialog, {
      props: {
        show: true,
      },
    });

    const noButton = wrapper.findAll("button")[1];
    await noButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("cancel");
  });
});
