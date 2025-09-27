import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import PageHeader from "../src/components/PageHeader.vue";
import { h } from "vue";

describe("PageHeader", () => {
  it("renders the provided title", () => {
    const wrapper = mount(PageHeader, { props: { title: "My Page" } });
    expect(wrapper.text()).toContain("My Page");
  });

  it("shows back link when showBack is true", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "x", showBack: true, backTo: "/back" },
      global: {
        components: {
          "router-link": {
            props: ["to"],
            render() {
              return h(
                "a",
                { href: this.to },
                this.$slots.default && this.$slots.default()
              );
            },
          },
        },
      },
    });
    const link = wrapper.find("a");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/back");
  });
});
