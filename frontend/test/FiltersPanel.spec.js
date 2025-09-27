import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import FiltersPanel from "../src/components/FiltersPanel.vue";

describe("FiltersPanel", () => {
  it("emits change and update:groupBy when inputs change", async () => {
    const wrapper = mount(FiltersPanel);
    const start = wrapper.find('input[type="date"]');
    const select = wrapper.find("select");

    // simulate changing group
    await select.setValue("month");
    // expect update:groupBy emitted
    expect(wrapper.emitted()["update:groupBy"]).toBeTruthy();
    // simulate changing start date
    await start.setValue("2025-01-01");
    expect(wrapper.emitted().change).toBeTruthy();
    const last = wrapper.emitted().change.slice(-1)[0][0];
    expect(last).toHaveProperty("start");
    expect(last).toHaveProperty("end");
    expect(last).toHaveProperty("group");
  });
});
