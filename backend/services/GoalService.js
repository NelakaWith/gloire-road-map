/**
 * @fileoverview Goal Service Implementation
 * @description Concrete implementation of IGoalService providing business logic operations
 * for goal management. Handles goal validation, completion tracking, analytics, and
 * integration with points system.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { IGoalService } from "../interfaces/services/IGoalService.js";

/**
 * Concrete Goal Service Implementation
 * @class GoalService
 * @extends IGoalService
 * @description Provides goal business logic operations using repository pattern
 */
export class GoalService extends IGoalService {
  /**
   * Constructor for GoalService
   * @param {IGoalRepository} goalRepository - Goal repository instance
   * @param {IStudentRepository} studentRepository - Student repository instance
   * @param {IPointsRepository} pointsRepository - Points repository instance
   */
  constructor(goalRepository, studentRepository, pointsRepository) {
    super();
    this.goalRepository = goalRepository;
    this.studentRepository = studentRepository;
    this.pointsRepository = pointsRepository;
  }

  /**
   * Create a new goal with validation
   * @async
   * @param {Object} goalData - Goal data to create
   * @returns {Promise<Object>} Created goal with validation results
   * @throws {Error} If goal creation fails or validation errors
   */
  async createGoal(goalData) {
    try {
      // Validate goal data
      const validationResult = await this.validateGoalData(goalData);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      // Verify student exists
      const studentExists = await this.studentRepository.exists(
        goalData.student_id
      );
      if (!studentExists) {
        throw new Error("Student not found");
      }

      // Create the goal
      const goal = await this.goalRepository.create(goalData);

      return {
        goal,
        validation: validationResult,
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to create goal: ${error.message}`);
    }
  }

  /**
   * Get goal by ID with related data
   * @async
   * @param {number} goalId - Goal ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Goal with related data or null if not found
   */
  async getGoalById(goalId, options = {}) {
    try {
      const goal = await this.goalRepository.findById(goalId);

      if (!goal) {
        return null;
      }

      // Add additional computed fields if needed
      if (options.includeProgress) {
        goal.daysRemaining = this._calculateDaysRemaining(goal.target_date);
        goal.isOverdue = this._isGoalOverdue(goal);
        goal.priorityScore = await this.calculateGoalPriorityScore(goal);
      }

      return goal;
    } catch (error) {
      throw new Error(`Failed to get goal by ID: ${error.message}`);
    }
  }

  /**
   * Get goals for a student with filtering and pagination
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Filter and pagination options
   * @returns {Promise<Object>} Goals with pagination metadata
   */
  async getStudentGoals(studentId, options = {}) {
    try {
      // Verify student exists
      const studentExists = await this.studentRepository.exists(studentId);
      if (!studentExists) {
        throw new Error("Student not found");
      }

      const {
        page = 1,
        limit = 10,
        status,
        priority,
        orderBy = "target_date",
        orderDirection = "ASC",
      } = options;

      const offset = (page - 1) * limit;

      // Build filter options for repository
      const findOptions = {
        orderBy,
        orderDirection,
        limit,
        offset,
      };

      if (status) findOptions.status = status;
      if (priority) findOptions.priority = priority;

      const goals = await this.goalRepository.findByStudentId(
        studentId,
        findOptions
      );
      const totalCount = await this.goalRepository.countByStudentId(studentId, {
        status,
        priority,
      });

      // Add computed fields to each goal
      const enhancedGoals = goals.map((goal) => ({
        ...goal,
        daysRemaining: this._calculateDaysRemaining(goal.target_date),
        isOverdue: this._isGoalOverdue(goal),
        completionRate: this._calculateCompletionRate(goal),
      }));

      return {
        goals: enhancedGoals,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get student goals: ${error.message}`);
    }
  }

  /**
   * Update goal with validation
   * @async
   * @param {number} goalId - Goal ID
   * @param {Object} updates - Fields to update
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<Object|null>} Updated goal or null if not found
   */
  async updateGoal(goalId, updates, requestingUserId = null) {
    try {
      // Validate update data
      const validationResult = await this.validateGoalData(updates, true);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      // Check if goal exists
      const existingGoal = await this.goalRepository.findById(goalId);
      if (!existingGoal) {
        return null;
      }

      // Perform update
      const updatedGoal = await this.goalRepository.update(goalId, updates);

      return updatedGoal;
    } catch (error) {
      throw new Error(`Failed to update goal: ${error.message}`);
    }
  }

  /**
   * Mark goal as completed with points calculation
   * @async
   * @param {number} goalId - Goal ID
   * @param {number} [completedByUserId] - ID of user marking completion
   * @returns {Promise<Object>} Completion result with points awarded
   */
  async completeGoal(goalId, completedByUserId = null) {
    try {
      const goal = await this.goalRepository.findById(goalId);
      if (!goal) {
        throw new Error("Goal not found");
      }

      if (goal.is_completed) {
        throw new Error("Goal is already completed");
      }

      const completedAt = new Date();
      const onTime = completedAt <= new Date(goal.target_date);

      // Update goal as completed
      const updatedGoal = await this.goalRepository.update(goalId, {
        is_completed: true,
        completed_at: completedAt,
      });

      // Award points for completion
      const pointsAwarded = await this.pointsRepository.awardGoalPoints(
        goal.student_id,
        goalId,
        2, // Base points for completion
        onTime
      );

      return {
        goal: updatedGoal,
        pointsAwarded,
        onTime,
        completedAt,
        totalPointsEarned: pointsAwarded.reduce(
          (sum, transaction) => sum + transaction.points,
          0
        ),
      };
    } catch (error) {
      throw new Error(`Failed to complete goal: ${error.message}`);
    }
  }

  /**
   * Delete goal with validation
   * @async
   * @param {number} goalId - Goal ID
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteGoal(goalId, requestingUserId = null) {
    try {
      const goal = await this.goalRepository.findById(goalId);
      if (!goal) {
        return false;
      }

      // Check if goal can be deleted (business rules)
      if (goal.is_completed) {
        throw new Error("Cannot delete completed goals");
      }

      const deleted = await this.goalRepository.delete(goalId);
      return deleted;
    } catch (error) {
      throw new Error(`Failed to delete goal: ${error.message}`);
    }
  }

  /**
   * Get goal completion analytics for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Goal completion analytics
   */
  async getGoalAnalytics(studentId, dateRange = {}) {
    try {
      const studentExists = await this.studentRepository.exists(studentId);
      if (!studentExists) {
        throw new Error("Student not found");
      }

      const analytics = await this.goalRepository.getForAnalytics(
        studentId,
        dateRange
      );

      // Calculate additional metrics
      const totalGoals = analytics.length;
      const completedGoals = analytics.filter(
        (goal) => goal.is_completed
      ).length;
      const overdueGoals = analytics.filter((goal) =>
        this._isGoalOverdue(goal)
      ).length;
      const onTimeCompletions = analytics.filter(
        (goal) => goal.is_completed && goal.completed_at <= goal.target_date
      ).length;

      const completionRate =
        totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
      const onTimeRate =
        completedGoals > 0 ? (onTimeCompletions / completedGoals) * 100 : 0;

      return {
        studentId,
        dateRange,
        metrics: {
          totalGoals,
          completedGoals,
          activeGoals: totalGoals - completedGoals,
          overdueGoals,
          completionRate: Math.round(completionRate * 100) / 100,
          onTimeRate: Math.round(onTimeRate * 100) / 100,
        },
        goals: analytics,
      };
    } catch (error) {
      throw new Error(`Failed to get goal analytics: ${error.message}`);
    }
  }

  /**
   * Get overdue goals for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of overdue goals
   */
  async getOverdueGoals(studentId, options = {}) {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      const findOptions = {
        endDate: today,
        completed: false,
        ...options,
      };

      const overdueGoals = await this.goalRepository.findByStudentId(
        studentId,
        findOptions
      );

      return overdueGoals
        .filter(
          (goal) => new Date(goal.target_date) < today && !goal.is_completed
        )
        .map((goal) => ({
          ...goal,
          daysOverdue: this._calculateDaysOverdue(goal.target_date),
        }));
    } catch (error) {
      throw new Error(`Failed to get overdue goals: ${error.message}`);
    }
  }

  /**
   * Get upcoming goals (due soon) for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {number} [daysAhead=7] - Number of days to look ahead
   * @returns {Promise<Array<Object>>} Array of upcoming goals
   */
  async getUpcomingGoals(studentId, daysAhead = 7) {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysAhead);

      const findOptions = {
        startDate: today,
        endDate: futureDate,
        completed: false,
      };

      const upcomingGoals = await this.goalRepository.findByStudentId(
        studentId,
        findOptions
      );

      return upcomingGoals.map((goal) => ({
        ...goal,
        daysRemaining: this._calculateDaysRemaining(goal.target_date),
        urgencyLevel: this._calculateUrgencyLevel(goal.target_date),
      }));
    } catch (error) {
      throw new Error(`Failed to get upcoming goals: ${error.message}`);
    }
  }

  /**
   * Validate goal data before creation or update
   * @async
   * @param {Object} goalData - Goal data to validate
   * @param {boolean} [isUpdate=false] - Whether this is an update operation
   * @returns {Promise<Object>} Validation result with errors if any
   */
  async validateGoalData(goalData, isUpdate = false) {
    const errors = [];

    try {
      // Required fields for creation
      if (!isUpdate) {
        if (!goalData.student_id) {
          errors.push("Student ID is required");
        }
        if (!goalData.title || goalData.title.trim().length === 0) {
          errors.push("Goal title is required");
        }
        if (!goalData.target_date) {
          errors.push("Target date is required");
        }
      }

      // Validate title length
      if (goalData.title && goalData.title.length > 200) {
        errors.push("Goal title must be 200 characters or less");
      }

      // Validate description length
      if (goalData.description && goalData.description.length > 1000) {
        errors.push("Goal description must be 1000 characters or less");
      }

      // Validate target date
      if (goalData.target_date) {
        const targetDate = new Date(goalData.target_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(targetDate.getTime())) {
          errors.push("Invalid target date format");
        } else if (!isUpdate && targetDate < today) {
          // Only enforce future dates for new goals
          errors.push("Target date cannot be in the past");
        }
      }

      // Validate priority
      if (
        goalData.priority &&
        !["low", "medium", "high"].includes(goalData.priority)
      ) {
        errors.push("Priority must be low, medium, or high");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ["Validation process failed"],
      };
    }
  }

  /**
   * Calculate goal priority score based on various factors
   * @async
   * @param {Object} goal - Goal object
   * @returns {Promise<number>} Priority score
   */
  async calculateGoalPriorityScore(goal) {
    try {
      let score = 0;

      // Base score from priority level
      const priorityScores = { low: 1, medium: 3, high: 5 };
      score += priorityScores[goal.priority] || 2;

      // Time pressure factor
      const daysRemaining = this._calculateDaysRemaining(goal.target_date);
      if (daysRemaining <= 1) score += 5;
      else if (daysRemaining <= 3) score += 3;
      else if (daysRemaining <= 7) score += 1;

      // Overdue penalty
      if (daysRemaining < 0) score += 10;

      return Math.min(score, 20); // Cap at 20
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get goal progress summary for multiple students
   * @async
   * @param {Array<number>} [studentIds] - Student IDs
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Array<Object>>} Goal progress summary per student
   */
  async getGoalProgressSummary(studentIds = [], dateRange = {}) {
    try {
      const summaries = [];

      if (studentIds.length === 0) {
        // Get all students if no specific IDs provided
        const allStudents = await this.studentRepository.findAll({
          limit: 1000,
        });
        studentIds = allStudents.map((student) => student.id);
      }

      for (const studentId of studentIds) {
        const analytics = await this.getGoalAnalytics(studentId, dateRange);
        const student = await this.studentRepository.findById(studentId);

        summaries.push({
          student: {
            id: student.id,
            name: student.name,
          },
          ...analytics.metrics,
        });
      }

      return summaries;
    } catch (error) {
      throw new Error(`Failed to get goal progress summary: ${error.message}`);
    }
  }

  /**
   * Archive completed goals older than specified date
   * @async
   * @param {Date} cutoffDate - Date before which completed goals should be archived
   * @returns {Promise<Object>} Archive operation result
   */
  async archiveOldGoals(cutoffDate) {
    try {
      // This would typically move goals to an archive table
      // For now, we'll just mark them as archived
      const completedGoals = await this.goalRepository.findCompleted({
        endDate: cutoffDate,
      });

      let archivedCount = 0;
      for (const goal of completedGoals) {
        await this.goalRepository.update(goal.id, { archived: true });
        archivedCount++;
      }

      return {
        success: true,
        archivedCount,
        cutoffDate,
      };
    } catch (error) {
      throw new Error(`Failed to archive old goals: ${error.message}`);
    }
  }

  /**
   * Suggest goals based on student progress and patterns
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Suggestion options
   * @returns {Promise<Array<Object>>} Array of suggested goals
   */
  async suggestGoals(studentId, options = {}) {
    try {
      const suggestions = [];

      // Get student's goal history for pattern analysis
      const recentGoals = await this.goalRepository.findByStudentId(studentId, {
        limit: 20,
        orderBy: "created_at",
        orderDirection: "DESC",
      });

      // Analyze completion patterns and suggest improvements
      const completedGoals = recentGoals.filter((goal) => goal.is_completed);
      const avgCompletionTime =
        completedGoals.length > 0
          ? completedGoals.reduce((sum, goal) => {
              const days = Math.ceil(
                (new Date(goal.completed_at) - new Date(goal.created_at)) /
                  (1000 * 60 * 60 * 24)
              );
              return sum + days;
            }, 0) / completedGoals.length
          : 7;

      // Generate suggestions based on patterns
      suggestions.push({
        type: "improvement",
        title: "Weekly Reading Goal",
        description: "Set a goal to read for 30 minutes daily",
        priority: "medium",
        suggestedDuration: Math.ceil(avgCompletionTime),
      });

      return suggestions;
    } catch (error) {
      throw new Error(`Failed to suggest goals: ${error.message}`);
    }
  }

  // Private helper methods
  _calculateDaysRemaining(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  _isGoalOverdue(goal) {
    return !goal.is_completed && new Date(goal.target_date) < new Date();
  }

  _calculateDaysOverdue(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = today - target;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  _calculateCompletionRate(goal) {
    if (goal.is_completed) return 100;

    const created = new Date(goal.created_at);
    const target = new Date(goal.target_date);
    const now = new Date();

    const totalTime = target - created;
    const elapsedTime = now - created;

    return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
  }

  _calculateUrgencyLevel(targetDate) {
    const daysRemaining = this._calculateDaysRemaining(targetDate);

    if (daysRemaining < 0) return "overdue";
    if (daysRemaining <= 1) return "critical";
    if (daysRemaining <= 3) return "high";
    if (daysRemaining <= 7) return "medium";
    return "low";
  }
}
