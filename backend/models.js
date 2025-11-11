/**
 * @fileoverview Database models and Sequelize configuration
 * @description Defines all database models, their relationships, and database connection setup
 * @author @NelakaWith
 * @version 1.0.0
 */

import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

/**
 * Sequelize database connection instance
 * @type {Sequelize}
 * @description MySQL database connection configured with environment variables
 */
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      socketPath: undefined,
    },
  }
);

/**
 * User model for authentication and authorization
 * @typedef {Object} User
 * @property {number} id - Unique user identifier (auto-increment)
 * @property {string} user_name - Unique username for login
 * @property {string} email - Unique email address
 * @property {string} password_hash - Hashed password for security
 * @property {Date} created_at - Account creation timestamp
 */
export const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_name: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

/**
 * Student model for managing student information and tracking
 * @typedef {Object} Student
 * @property {number} id - Unique student identifier (auto-increment)
 * @property {string} name - Full name of the student (required)
 * @property {string|null} contact_number - Student's contact phone number
 * @property {string|null} address - Student's physical address
 * @property {Date|null} date_of_birth - Student's date of birth
 * @property {number} points - Achievement points earned by student (default: 0)
 * @property {Date} created_at - Student registration timestamp
 */
export const Student = sequelize.define(
  "Student",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    contact_number: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    date_of_birth: { type: DataTypes.DATE, allowNull: true },
    points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  {
    tableName: "students",
    timestamps: false,
  }
);
/**
 * PointsLog model for tracking point changes and audit history
 * @typedef {Object} PointsLog
 * @property {number} id - Unique log entry identifier (auto-increment)
 * @property {number} student_id - Reference to the student (foreign key)
 * @property {number} points - Points awarded or deducted
 * @property {string|null} reason - Reason for the point change
 * @property {number|null} related_goal_id - Associated goal ID if point change is goal-related
 * @property {Date} created_at - Timestamp when points were recorded
 */
export const PointsLog = sequelize.define(
  "PointsLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: true },
    related_goal_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  {
    tableName: "points_log",
    timestamps: false,
  }
);

Student.hasMany(PointsLog, { foreignKey: "student_id" });
PointsLog.belongsTo(Student, { foreignKey: "student_id" });

/**
 * Goal model for managing student objectives and milestones
 * @typedef {Object} Goal
 * @property {number} id - Unique goal identifier (auto-increment)
 * @property {number} student_id - Reference to the student who owns this goal (foreign key)
 * @property {string} title - Goal title or name (required)
 * @property {string|null} description - Detailed description of the goal
 * @property {Date|null} target_date - Target completion date
 * @property {Date} setup_date - When the goal was created
 * @property {Date} updated_at - Last modification timestamp
 * @property {boolean} is_completed - Completion status (default: false)
 * @property {Date|null} completed_at - Actual completion timestamp
 * @property {Date} created_at - Goal creation timestamp
 */
export const Goal = sequelize.define(
  "Goal",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    target_date: { type: DataTypes.DATE, allowNull: true },
    setup_date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    is_completed: { type: DataTypes.BOOLEAN, defaultValue: false },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  {
    tableName: "goals",
    timestamps: false,
  }
);

/**
 * Attendance model for tracking daily student attendance
 * @typedef {Object} Attendance
 * @property {number} id - Unique attendance record identifier (auto-increment)
 * @property {number} student_id - Reference to the student (foreign key)
 * @property {Date} date - Attendance date (DATEONLY format)
 * @property {string} status - Attendance status: 'present'|'absent'|'late'|'excused' (default: 'absent')
 * @property {string|null} notes - Optional notes about the attendance
 * @property {Date} created_at - Record creation timestamp
 * @property {Date} updated_at - Last modification timestamp
 */
export const Attendance = sequelize.define(
  "Attendance",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("present", "absent", "late", "excused"),
      allowNull: false,
      defaultValue: "present",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  {
    tableName: "attendance",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["student_id", "date"],
      },
    ],
  }
);

Student.hasMany(Goal, { foreignKey: "student_id" });
Goal.belongsTo(Student, { foreignKey: "student_id" });

Student.hasMany(Attendance, { foreignKey: "student_id", as: "attendance" });
Attendance.belongsTo(Student, { foreignKey: "student_id", as: "student" });
