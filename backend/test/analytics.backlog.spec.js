import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../models.js", () => {
  return {
    sequelize: {
      query: vi.fn(),
      QueryTypes: { SELECT: "SELECT" },
    },
  };
});

import { sequelize } from "../models.js";
import { getBacklog } from "../services/analytics.js";

describe("getBacklog service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns backlog summary with normalized buckets and top students", async () => {
    const totalRows = [{ total_open: 5 }];
    const overdueRows = [{ overdue: 2 }];
    const avgRows = [{ avg_days_open: 12.34 }];
    const ageRows = [
      { bucket: "0-7", count: 1 },
      { bucket: "31-90", count: 3 },
    ];
    const topRows = [{ student_id: 2, student_name: "Bob", open_count: 3 }];

    // Mock Promise.all order
    sequelize.query
      .mockResolvedValueOnce(totalRows)
      .mockResolvedValueOnce(overdueRows)
      .mockResolvedValueOnce(avgRows)
      .mockResolvedValueOnce(ageRows)
      .mockResolvedValueOnce(topRows);

    const res = await getBacklog({ as_of: "2025-09-25", top_n: 10 });
    expect(res.total_open).toBe(5);
    expect(res.overdue).toBe(2);
    expect(res.avg_days_open).toBeCloseTo(12.34);
    expect(res.open_by_age).toEqual([
      { bucket: "0-7", count: 1 },
      { bucket: "8-30", count: 0 },
      { bucket: "31-90", count: 3 },
      { bucket: "90+", count: 0 },
    ]);
    expect(res.top_students).toEqual([
      { student_id: 2, student_name: "Bob", open_count: 3 },
    ]);
  });
});
