import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import TimeSeriesChart from "../src/components/TimeSeriesChart.vue";

describe("TimeSeriesChart", () => {
  it("renders chart with data", async () => {
    const series = [
      { label: "2025-01", completions: 5 },
      { label: "2025-02", completions: 8 },
    ];
    const wrapper = mount(TimeSeriesChart, { props: { series } });
    // Chart.js renders a canvas element
    const canvas = wrapper.find("canvas");
    expect(canvas.exists()).toBe(true);
  });
});
