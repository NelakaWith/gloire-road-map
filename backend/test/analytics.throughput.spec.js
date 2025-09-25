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
import { getThroughput } from "../services/analytics.js";

describe("getThroughput service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns joined created and completed counts with completion_rate", async () => {
    // Simulate two buckets returned from the unioned SQL
    const mockRows = [
      {
        label: "2025-08",
        bucket_start: "2025-08-01",
        bucket_end: "2025-08-31",
        created: 10,
        completed: 8,
      },
      {
        label: "2025-09",
        bucket_start: "2025-09-01",
        bucket_end: "2025-09-30",
        created: 5,
        completed: 2,
      },
    ];
    sequelize.query.mockResolvedValueOnce(mockRows);
    const rows = await getThroughput({
      start_date: "2025-08-01",
      end_date: "2025-09-30",
      group_by: "month",
    });
    expect(rows).toHaveLength(2);
    expect(rows[0].label).toBe("2025-08");
    expect(rows[0].created).toBe(10);
    expect(rows[0].completed).toBe(8);
    expect(rows[0].completion_rate).toBeCloseTo(0.8);
    expect(rows[1].completion_rate).toBeCloseTo(0.4);
  });
});
