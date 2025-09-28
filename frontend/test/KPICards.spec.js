import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import KPICards from "../src/components/analytics/KPICards.vue";

describe("KPICards", () => {
  it("renders KPI keys and formatted values", () => {
    const kpis = {
      total_goals: 10,
      completed_goals: 7,
      pct_complete: 70,
      avg_days_to_complete: 12,
    };

    const wrapper = mount(KPICards, { props: { kpis } });
    const text = wrapper.text();
    // labels
    expect(text).toContain("Total goals");
    expect(text).toContain("Completed goals");
    expect(text).toContain("Percent complete");
    expect(text).toContain("Avg days to complete");
    // values
    expect(text).toContain("10");
    expect(text).toContain("7");
    expect(text).toContain("70%");
    expect(text).toContain("12");
  });
});
