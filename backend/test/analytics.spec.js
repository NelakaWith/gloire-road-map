import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the sequelize import used by the service
vi.mock("../models.js", () => {
  return {
    sequelize: {
      query: vi.fn(),
      QueryTypes: { SELECT: "SELECT" },
    },
  };
});

import { sequelize } from "../models.js";
import { getOverview, getCompletions } from "../services/analytics.js";
import { getByStudent } from "../services/analytics.js";

describe("analytics service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getOverview returns row data when query returns a row", async () => {
    sequelize.query.mockResolvedValueOnce([
      { total_goals: 10, completed_goals: 4, avg_days_to_complete: 3.5 },
    ]);
    const res = await getOverview();
    expect(res.total_goals).toBe(10);
    expect(res.completed_goals).toBe(4);
    expect(res.avg_days_to_complete).toBe(3.5);
  });

  it("getCompletions returns rows grouped", async () => {
    const mockRows = [
      { label: "2025-37", completions: 2 },
      { label: "2025-38", completions: 3 },
    ];
    sequelize.query.mockResolvedValueOnce(mockRows);
    const rows = await getCompletions({ group_by: "week" });
    expect(rows).toEqual(mockRows);
  });

  it("getByStudent returns aggregated student rows with defaults", async () => {
    const mockRows = [
      { student_id: 1, student_name: "A", completions: 3, avg_days: 2.5 },
      { student_id: 2, student_name: "B", completions: 1, avg_days: 4.0 },
    ];
    sequelize.query.mockResolvedValueOnce(mockRows);
    const rows = await getByStudent({});
    expect(rows).toEqual(mockRows);
  });
});
