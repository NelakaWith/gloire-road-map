import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import StudentBarChart from "../src/components/analytics/TopStudents.vue";

describe("StudentBarChart", () => {
  it("shows No data when students prop is empty", () => {
    const wrapper = mount(StudentBarChart, { props: { students: [] } });
    expect(wrapper.text()).toContain("No data");
  });

  it("renders a table when students are provided", () => {
    const students = [
      { student_id: "s1", student_name: "Alice", completions: 5, avg_days: 3 },
      { student_id: "s2", student_name: "Bob", completions: 2, avg_days: 8 },
    ];
    const wrapper = mount(StudentBarChart, { props: { students } });
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(2);
    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain("Bob");
  });
});
