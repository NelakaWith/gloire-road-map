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
