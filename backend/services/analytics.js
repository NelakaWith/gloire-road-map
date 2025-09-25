import { sequelize } from "../models.js";

export async function getOverview({ start_date = null, end_date = null } = {}) {
  // Single-row query returning KPIs
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM goals) AS total_goals,
      (SELECT COUNT(*) FROM goals WHERE is_completed = 1) AS completed_goals,
      (SELECT ROUND(AVG(TIMESTAMPDIFF(SECOND, created_at, completed_at))/86400,2) FROM goals WHERE completed_at IS NOT NULL AND created_at IS NOT NULL) AS avg_days_to_complete
  `;

  const rows = await sequelize.query(sql, {
    type: sequelize.QueryTypes.SELECT,
  });
  return (
    rows[0] || {
      total_goals: 0,
      completed_goals: 0,
      avg_days_to_complete: null,
    }
  );
}

export async function getCompletions({
  start_date = null,
  end_date = null,
  group_by = "week",
} = {}) {
  let labelExpr = "DATE_FORMAT(completed_at, '%Y-%u')"; // week
  if (group_by === "day") labelExpr = "DATE_FORMAT(completed_at, '%Y-%m-%d')";
  if (group_by === "month") labelExpr = "DATE_FORMAT(completed_at, '%Y-%m')";

  const whereParts = ["completed_at IS NOT NULL"];
  const replacements = {};
  if (start_date) {
    whereParts.push("completed_at >= :start");
    replacements.start = start_date;
  }
  if (end_date) {
    whereParts.push("completed_at <= :end");
    replacements.end = end_date;
  }

  const sql = `
    SELECT ${labelExpr} AS label, COUNT(*) AS completions
    FROM goals
    WHERE ${whereParts.join(" AND ")}
    GROUP BY label
    ORDER BY label
  `;

  const rows = await sequelize.query(sql, {
    replacements,
    type: sequelize.QueryTypes.SELECT,
  });
  return rows;
}

export async function getByStudent({
  start_date = null,
  end_date = null,
  limit = 50,
  offset = 0,
} = {}) {
  const whereParts = ["g.completed_at IS NOT NULL"];
  const replacements = { limit: Number(limit), offset: Number(offset) };
  if (start_date) {
    whereParts.push("g.completed_at >= :start");
    replacements.start = start_date;
  }
  if (end_date) {
    whereParts.push("g.completed_at <= :end");
    replacements.end = end_date;
  }

  const sql = `
    SELECT s.id AS student_id, s.name AS student_name, COUNT(*) AS completions,
      ROUND(AVG(TIMESTAMPDIFF(SECOND, g.created_at, g.completed_at))/86400,2) AS avg_days
    FROM goals g
    JOIN students s ON s.id = g.student_id
    WHERE ${whereParts.join(" AND ")}
    GROUP BY s.id, s.name
    ORDER BY completions DESC
    LIMIT :limit OFFSET :offset
  `;

  const rows = await sequelize.query(sql, {
    replacements,
    type: sequelize.QueryTypes.SELECT,
  });
  return rows;
}

export async function getThroughput({
  start_date = null,
  end_date = null,
  group_by = "month",
} = {}) {
  // Decide label expression and bucket boundaries
  let dateFormat = "%Y-%m"; // month
  let startExpr = "DATE_FORMAT(DATE(bucket_start), '%Y-%m-%d')";
  if (group_by === "day") {
    dateFormat = "%Y-%m-%d";
    startExpr = "DATE_FORMAT(DATE(bucket_start), '%Y-%m-%d')";
  } else if (group_by === "week") {
    // year-week (ISO-like)
    dateFormat = "%Y-%u";
    startExpr = "DATE_FORMAT(DATE(bucket_start), '%Y-%m-%d')";
  }

  const wherePartsCreated = [];
  const wherePartsCompleted = ["completed_at IS NOT NULL"];
  const replacements = {};
  if (start_date) {
    wherePartsCreated.push("DATE(created_at) >= :start");
    wherePartsCompleted.push("DATE(completed_at) >= :start");
    replacements.start = start_date;
  }
  if (end_date) {
    wherePartsCreated.push("DATE(created_at) <= :end");
    wherePartsCompleted.push("DATE(completed_at) <= :end");
    replacements.end = end_date;
  }

  // We use two subqueries and then full outer-like join via UNION of labels
  const sqlCreated = `
    SELECT DATE_FORMAT(created_at, '${dateFormat}') AS label,
           MIN(DATE(created_at)) AS bucket_start,
           MAX(DATE(created_at)) AS bucket_end,
           COUNT(*) AS created
    FROM goals
    ${
      wherePartsCreated.length ? `WHERE ${wherePartsCreated.join(" AND ")}` : ""
    }
    GROUP BY label
  `;

  const sqlCompleted = `
    SELECT DATE_FORMAT(completed_at, '${dateFormat}') AS label,
           MIN(DATE(completed_at)) AS bucket_start,
           MAX(DATE(completed_at)) AS bucket_end,
           COUNT(*) AS completed
    FROM goals
    WHERE ${wherePartsCompleted.join(" AND ")}
    GROUP BY label
  `;

  // Join created and completed by label
  const sql = `
    SELECT COALESCE(c.label, d.label) AS label,
           COALESCE(c.bucket_start, d.bucket_start) AS bucket_start,
           COALESCE(c.bucket_end, d.bucket_end) AS bucket_end,
           COALESCE(c.created,0) AS created,
           COALESCE(d.completed,0) AS completed
    FROM (${sqlCreated}) c
    RIGHT JOIN (${sqlCompleted}) d ON c.label = d.label
    UNION
    SELECT COALESCE(c.label, d.label) AS label,
           COALESCE(c.bucket_start, d.bucket_start) AS bucket_start,
           COALESCE(c.bucket_end, d.bucket_end) AS bucket_end,
           COALESCE(c.created,0) AS created,
           COALESCE(d.completed,0) AS completed
    FROM (${sqlCreated}) c
    LEFT JOIN (${sqlCompleted}) d ON c.label = d.label
    ORDER BY label
  `;

  const rows = await sequelize.query(sql, {
    replacements,
    type: sequelize.QueryTypes.SELECT,
  });

  // Build a map from label -> data returned by SQL
  const dataMap = new Map();
  for (const r of rows) {
    const label = r.label;
    dataMap.set(label, {
      created: Number(r.created || 0),
      completed: Number(r.completed || 0),
      bucket_start: r.bucket_start ? r.bucket_start.toString() : null,
      bucket_end: r.bucket_end ? r.bucket_end.toString() : null,
    });
  }

  // Helper: format date to YYYY-MM-DD
  function fmtDate(d) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Helper: format month label YYYY-MM
  function monthLabel(d) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  // Helper: week label matching MySQL DATE_FORMAT(..., '%Y-%u') approx (Sunday-start week)
  function weekLabel(d) {
    // Use UTC to avoid timezone shifts
    const date = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const diff = Math.floor((date - start) / 86400000);
    const jan1Day = start.getUTCDay(); // 0 = Sunday
    const weekNum = Math.floor((diff + jan1Day) / 7) + 1;
    return `${date.getUTCFullYear()}-${String(weekNum).padStart(2, "0")}`;
  }

  // Generate continuous buckets between start_date and end_date
  const buckets = [];
  const s = start_date ? new Date(`${start_date}T00:00:00Z`) : null;
  const e = end_date ? new Date(`${end_date}T00:00:00Z`) : null;
  if (!s || !e) return [];

  if (group_by === "day") {
    let cur = new Date(s);
    while (cur <= e) {
      const label = fmtDate(cur);
      buckets.push({
        label,
        bucket_start: fmtDate(cur),
        bucket_end: fmtDate(cur),
      });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  } else if (group_by === "month") {
    let cur = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), 1));
    while (cur <= e) {
      const label = monthLabel(cur);
      const startOfMonth = new Date(
        Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), 1)
      );
      const nextMonth = new Date(
        Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1)
      );
      const endOfMonth = new Date(nextMonth - 1);
      buckets.push({
        label,
        bucket_start: fmtDate(startOfMonth),
        bucket_end: fmtDate(endOfMonth),
      });
      cur.setUTCMonth(cur.getUTCMonth() + 1);
    }
  } else if (group_by === "week") {
    // weeks starting on Sunday
    const startSunday = new Date(s);
    startSunday.setUTCDate(s.getUTCDate() - s.getUTCDay());
    let cur = new Date(
      Date.UTC(
        startSunday.getUTCFullYear(),
        startSunday.getUTCMonth(),
        startSunday.getUTCDate()
      )
    );
    while (cur <= e) {
      const label = weekLabel(cur);
      const startOfWeek = new Date(cur);
      const endOfWeek = new Date(cur);
      endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
      buckets.push({
        label,
        bucket_start: fmtDate(startOfWeek),
        bucket_end: fmtDate(endOfWeek),
      });
      cur.setUTCDate(cur.getUTCDate() + 7);
    }
  }

  // Produce final series by merging SQL results into buckets and zero-filling
  const series = buckets.map((b) => {
    const d = dataMap.get(b.label) || { created: 0, completed: 0 };
    const created = Number(d.created || 0);
    const completed = Number(d.completed || 0);
    return {
      label: b.label,
      start: b.bucket_start,
      end: b.bucket_end,
      created,
      completed,
      completion_rate:
        created > 0 ? Number((completed / created).toFixed(4)) : null,
    };
  });

  return series;
}
