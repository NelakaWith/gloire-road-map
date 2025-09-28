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
    expect(text).toContain("total_goals");
    expect(text).toContain("10");
    expect(text).toContain("completed_goals");
    expect(text).toContain("7");
    // pct_complete in component is appended with "%"
    expect(text).toContain("70%");
    expect(text).toContain("avg_days_to_complete");
    expect(text).toContain("12");
  });
});
