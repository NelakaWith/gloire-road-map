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
import { getOverdue } from "../services/analytics.js";

describe("getOverdue service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns open overdue and on-time completion stats", async () => {
    const openRows = [{ open_overdue: 4 }];
    const completedRows = [{ completed_count: 10, completed_on_time: 7 }];
    sequelize.query
      .mockResolvedValueOnce(openRows)
      .mockResolvedValueOnce(completedRows);

    const res = await getOverdue({
      start_date: "2025-08-01",
      end_date: "2025-09-30",
      as_of: "2025-09-25",
    });
    expect(res.open_overdue).toBe(4);
    expect(res.completed_count).toBe(10);
    expect(res.completed_on_time).toBe(7);
    expect(res.on_time_rate).toBeCloseTo(0.7);
  });
});
