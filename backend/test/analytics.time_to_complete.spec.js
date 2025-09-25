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
import { getTimeToComplete } from "../services/analytics.js";

describe("getTimeToComplete service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns stats and histogram for completed goals", async () => {
    // Simulate rows with days: [1,2,3,10,50]
    const mockRows = [
      { days: 1 },
      { days: 2 },
      { days: 3 },
      { days: 10 },
      { days: 50 },
    ];
    sequelize.query.mockResolvedValueOnce(mockRows);
    const res = await getTimeToComplete({
      start_date: "2025-06-01",
      end_date: "2025-09-01",
    });
    expect(res.count).toBe(5);
    expect(res.mean_days).toBeCloseTo((1 + 2 + 3 + 10 + 50) / 5, 2);
    expect(res.median_days).toBeCloseTo(3.0, 2);
    // p90 lies between 10 and 50
    expect(res.p90_days).toBeGreaterThanOrEqual(10);
    expect(res.histogram.find((h) => h.bucket === "0-1").count).toBe(1);
    expect(res.histogram.find((h) => h.bucket === "2-7").count).toBe(2);
    expect(res.histogram.find((h) => h.bucket === "8-30").count).toBe(1);
    expect(res.histogram.find((h) => h.bucket === "31-90").count).toBe(1);
  });
});
