import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import TimeSeriesChart from "../src/components/analytics/TimeSeriesChart.vue";

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

  it('shows "No data" when series is empty or not provided', () => {
    const wrapperEmpty = mount(TimeSeriesChart, { props: { series: [] } });
    expect(wrapperEmpty.text()).toContain("No data");

    const wrapperNoProp = mount(TimeSeriesChart);
    expect(wrapperNoProp.text()).toContain("No data");
  });

  it("passes category labels and numeric dataset to the Line component for non-date labels", () => {
    const series = [
      { label: "Period A", completions: 2 },
      { label: "Period B", completions: 7 },
    ];
    const wrapper = mount(TimeSeriesChart, { props: { series } });
    const dataProp = wrapper.vm.plainChartData;
    expect(dataProp).toBeTruthy();
    // category labels should be present
    expect(dataProp.labels).toEqual(["Period A", "Period B"]);
    // dataset values should be numeric array
    expect(dataProp.datasets[0].data).toEqual([2, 7]);
  });

  it("passes time-series {x,y} points to the Line component when labels parse as dates", () => {
    const series = [
      { label: "2025-01-01", completions: 3 },
      { label: "2025-01-08", completions: 6 },
    ];
    const wrapper = mount(TimeSeriesChart, { props: { series } });
    const dataProp = wrapper.vm.plainChartData;
    expect(dataProp).toBeTruthy();
    const points = dataProp.datasets[0].data;
    expect(Array.isArray(points)).toBe(true);
    expect(points.length).toBe(2);
    // each point should be an object with x and y
    expect(points[0]).toHaveProperty("x");
    expect(points[0]).toHaveProperty("y");
    // x should be a string that parses as a date
    expect(isNaN(Date.parse(points[0].x))).toBe(false);
  });
});
