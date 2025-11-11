/**
 * @fileoverview Points Service Implementation
 * @description Concrete implementation of IPointsService providing business logic operations
 * for points management. Handles points earning, redemption, validation, analytics, and
 * comprehensive gamification features.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { IPointsService } from "../interfaces/services/IPointsService.js";

/**
 * Concrete Points Service Implementation
 * @class PointsService
 * @extends IPointsService
 * @description Provides points business logic operations using repository pattern
 */
export class PointsService extends IPointsService {
  /**
   * Constructor for PointsService
   * @param {IPointsRepository} pointsRepository - Points repository instance
   * @param {IStudentRepository} studentRepository - Student repository instance
   * @param {IGoalRepository} goalRepository - Goal repository instance
   */
  constructor(pointsRepository, studentRepository, goalRepository) {
    super();
    this.pointsRepository = pointsRepository;
    this.studentRepository = studentRepository;
    this.goalRepository = goalRepository;
  }

  /**
   * Award points to a student with validation
   * @async
   * @param {Object} pointsData - Points award data
   * @returns {Promise<Object>} Points award result with transaction details
   */
  async awardPoints(pointsData) {
    try {
      // Validate points data
      const validationResult = await this.validateTransactionData(pointsData);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      // Verify student exists
      const studentExists = await this.studentRepository.exists(
        pointsData.student_id
      );
      if (!studentExists) {
        throw new Error("Student not found");
      }

      // Validate award amount (business rules)
      if (pointsData.points <= 0) {
        throw new Error("Points amount must be positive");
      }

      const maxDailyAward = 50; // Business rule: max 50 points per day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayEarnings = await this.pointsRepository.findPointsLogByStudent(
        pointsData.student_id,
        {
          startDate: today,
          endDate: tomorrow,
        }
      );

      const todayTotal = todayEarnings
        .filter((transaction) => transaction.points > 0)
        .reduce((sum, transaction) => sum + transaction.points, 0);

      if (todayTotal + pointsData.points > maxDailyAward) {
        throw new Error(
          `Daily earning limit exceeded. Remaining: ${
            maxDailyAward - todayTotal
          } points`
        );
      }

      // Create points transaction
      const transaction = await this.pointsRepository.createPointsLog({
        student_id: pointsData.student_id,
        points: pointsData.points,
        reason: pointsData.reason || null,
        related_goal_id: pointsData.related_goal_id || null,
      });

      // Get updated balance
      const balance = await this.pointsRepository.getStudentBalance(
        pointsData.student_id
      );

      return {
        transaction,
        balance,
        validation: validationResult,
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to award points: ${error.message}`);
    }
  }

  /**
   * Redeem points for a student with validation
   * @async
   * @param {Object} redemptionData - Points redemption data
   * @returns {Promise<Object|null>} Redemption result or null if insufficient balance
   */
  async redeemPoints(redemptionData) {
    try {
      // Validate redemption data
      const validationResult = await this.validateTransactionData({
        ...redemptionData,
        type: "redeemed",
      });
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      // Check if student has sufficient balance
      const hasSufficient = await this.hasSufficientBalance(
        redemptionData.student_id,
        redemptionData.points
      );

      if (!hasSufficient) {
        return null; // Insufficient balance
      }

      // Validate redemption amount (business rules)
      if (redemptionData.points <= 0) {
        throw new Error("Redemption amount must be positive");
      }

      const minRedemption = 5; // Business rule: minimum 5 points per redemption
      if (redemptionData.points < minRedemption) {
        throw new Error(`Minimum redemption amount is ${minRedemption} points`);
      }

      // Create redemption transaction
      const transaction = await this.pointsRepository.createPointsLog({
        student_id: redemptionData.student_id,
        points: -redemptionData.points,
        reason: redemptionData.description || "Points redeemed",
        related_goal_id: null,
      });

      // Get updated balance
      const balance = await this.pointsRepository.getStudentBalance(
        redemptionData.student_id
      );

      return {
        transaction,
        balance,
        redemptionValue: this._calculateRedemptionValue(redemptionData.points),
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to redeem points: ${error.message}`);
    }
  }

  /**
   * Get points transaction by ID
   * @async
   * @param {number} transactionId - Points transaction ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Points transaction or null if not found
   */
  async getTransactionById(transactionId, options = {}) {
    try {
      const transaction = await this.pointsRepository.findById(
        transactionId,
        options
      );

      if (transaction && options.includeBalance) {
        const balance = await this.pointsRepository.getStudentBalance(
          transaction.student_id
        );
        transaction.currentBalance = balance.current_balance;
      }

      return transaction;
    } catch (error) {
      throw new Error(`Failed to get transaction by ID: ${error.message}`);
    }
  }

  /**
   * Get points balance and history for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object>} Points balance and transaction history
   */
  async getStudentPointsBalance(studentId, options = {}) {
    try {
      // Verify student exists
      const studentExists = await this.studentRepository.exists(studentId);
      if (!studentExists) {
        throw new Error("Student not found");
      }

      const { includeHistory = true, limit = 20 } = options;

      const balance = await this.pointsRepository.getStudentBalance(studentId);

      let recentTransactions = [];
      if (includeHistory) {
        recentTransactions = await this.pointsRepository.findPointsLogByStudent(
          studentId,
          {
            limit,
            orderBy: "created_at",
            orderDirection: "DESC",
          }
        );
      }

      // Calculate additional metrics
      const projectedEarnings = await this._calculateProjectedEarnings(
        studentId
      );
      const earningRate = await this._calculateEarningRate(studentId);

      return {
        studentId,
        balance,
        recentTransactions,
        metrics: {
          projectedEarnings,
          earningRate,
          rank: await this._getStudentPointsRank(studentId),
          percentile: await this._getStudentPointsPercentile(studentId),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get student points balance: ${error.message}`);
    }
  }

  /**
   * Get points transactions for a student with filtering
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Filter and pagination options
   * @returns {Promise<Object>} Points transactions with pagination metadata
   */
  async getStudentTransactions(studentId, options = {}) {
    try {
      const studentExists = await this.studentRepository.exists(studentId);
      if (!studentExists) {
        throw new Error("Student not found");
      }

      const {
        page = 1,
        limit = 20,
        type,
        startDate,
        endDate,
        orderBy = "transaction_date",
        orderDirection = "DESC",
      } = options;

      const offset = (page - 1) * limit;

      const findOptions = {
        startDate,
        endDate,
        orderBy: "created_at",
        orderDirection,
        limit,
        offset,
      };

      const transactions = await this.pointsRepository.findPointsLogByStudent(
        studentId,
        findOptions
      );

      // Filter by type if provided (client-side filtering)
      const filteredTransactions = type
        ? transactions.filter((t) => {
            if (type === "earned" || type === "bonus") return t.points > 0;
            if (type === "redeemed" || type === "penalty") return t.points < 0;
            return true;
          })
        : transactions;

      const totalCount = await this.pointsRepository.count({
        studentId,
      });

      // Enhance transactions with computed fields
      const enhancedTransactions = filteredTransactions.map((transaction) => ({
        ...transaction,
        category: this._categorizeTransaction(transaction),
        impact: this._calculateTransactionImpact(transaction),
        runningBalance: null, // Would be calculated if needed
      }));

      return {
        transactions: enhancedTransactions,
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
      throw new Error(`Failed to get student transactions: ${error.message}`);
    }
  }

  /**
   * Update points transaction with validation
   * @async
   * @param {number} transactionId - Transaction ID
   * @param {Object} updates - Fields to update
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<Object|null>} Updated transaction or null if not found
   */
  async updateTransaction(transactionId, updates, requestingUserId = null) {
    try {
      // Validate update data
      const validationResult = await this.validateTransactionData(
        updates,
        true
      );
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      // Check if transaction exists
      const existingTransaction = await this.pointsRepository.findById(
        transactionId
      );
      if (!existingTransaction) {
        return null;
      }

      // Business rules for updates
      const transactionAge =
        Date.now() - new Date(existingTransaction.created_at);
      const maxEditWindow = 24 * 60 * 60 * 1000; // 24 hours

      if (transactionAge > maxEditWindow) {
        throw new Error("Cannot edit transactions older than 24 hours");
      }

      if (existingTransaction.points < 0) {
        throw new Error("Cannot edit redemption/penalty transactions");
      }

      // Perform update
      const updatedTransaction = await this.pointsRepository.update(
        transactionId,
        updates
      );

      return updatedTransaction;
    } catch (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  /**
   * Delete points transaction with validation
   * @async
   * @param {number} transactionId - Transaction ID
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteTransaction(transactionId, requestingUserId = null) {
    try {
      const transaction = await this.pointsRepository.findById(transactionId);
      if (!transaction) {
        return false;
      }

      // Business rules for deletion
      const transactionAge = Date.now() - new Date(transaction.created_at);
      const maxDeleteWindow = 1 * 60 * 60 * 1000; // 1 hour

      if (transactionAge > maxDeleteWindow) {
        throw new Error("Cannot delete transactions older than 1 hour");
      }

      if (transaction.points < 0) {
        throw new Error("Cannot delete redemption/penalty transactions");
      }

      const deleted = await this.pointsRepository.delete(transactionId);
      return deleted;
    } catch (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }

  /**
   * Get points leaderboard with ranking
   * @async
   * @param {Object} [options] - Leaderboard options
   * @returns {Promise<Array<Object>>} Students ranked by points
   */
  async getPointsLeaderboard(options = {}) {
    try {
      const { limit = 10, dateRange = {}, metric = "total_balance" } = options;

      const leaderboard = await this.pointsRepository.getLeaderboard({
        limit,
        ...dateRange,
      });

      // Enhance leaderboard entries with additional data
      const enhancedLeaderboard = await Promise.all(
        leaderboard.map(async (entry, index) => {
          const student = await this.studentRepository.findById(
            entry.student_id
          );
          const recentActivity = await this.pointsRepository.getRecentActivity({
            studentId: entry.student_id,
            limit: 5,
          });

          return {
            rank: index + 1,
            student: {
              id: student.id,
              name: student.name,
            },
            points: entry.total_balance,
            earnedPoints: entry.earned_points,
            bonusPoints: entry.bonus_points,
            transactions: entry.total_transactions,
            recentActivity: recentActivity.length,
            trend: await this._calculatePointsTrend(entry.student_id),
            badges: this._calculateBadges(entry),
          };
        })
      );

      return enhancedLeaderboard;
    } catch (error) {
      throw new Error(`Failed to get points leaderboard: ${error.message}`);
    }
  }

  /**
   * Get points statistics and analytics
   * @async
   * @param {Object} [options] - Analytics options
   * @returns {Promise<Object>} Points analytics and statistics
   */
  async getPointsAnalytics(options = {}) {
    try {
      const { studentIds = [], dateRange = {} } = options;

      const aggregatedStats = await this.pointsRepository.getAggregatedStats(
        dateRange
      );
      const trends = await this.getPointsTrends({ dateRange });

      let filteredStats = aggregatedStats;
      if (studentIds.length > 0) {
        // Filter for specific students if provided
        const studentBalances = await Promise.all(
          studentIds.map((id) =>
            this.pointsRepository.getStudentBalance(id, dateRange)
          )
        );
        filteredStats = {
          ...aggregatedStats,
          studentSpecific: studentBalances,
        };
      }

      return {
        dateRange,
        overview: filteredStats,
        trends,
        insights: {
          topEarners: await this._getTopEarners(dateRange),
          mostActive: await this._getMostActiveStudents(dateRange),
          redemptionPatterns: await this._getRedemptionPatterns(dateRange),
          engagementMetrics: await this._calculateEngagementMetrics(dateRange),
        },
        recommendations: await this._generatePointsRecommendations(
          filteredStats
        ),
      };
    } catch (error) {
      throw new Error(`Failed to get points analytics: ${error.message}`);
    }
  }

  /**
   * Award points for goal completion automatically
   * @async
   * @param {number} goalId - Goal ID that was completed
   * @param {number} studentId - Student ID
   * @param {boolean} [onTime=false] - Whether goal was completed on time
   * @returns {Promise<Array<Object>>} Array of points transactions created
   */
  async awardGoalCompletionPoints(goalId, studentId, onTime = false) {
    try {
      // Verify goal exists and belongs to student
      const goal = await this.goalRepository.findById(goalId);
      if (!goal) {
        throw new Error("Goal not found");
      }

      if (goal.student_id !== studentId) {
        throw new Error("Goal does not belong to this student");
      }

      if (goal.is_completed) {
        throw new Error("Goal is already completed");
      }

      // Calculate points based on goal completion
      const pointsBreakdown = await this.calculateGoalPoints(goal, onTime);
      const transactions = [];

      // Award base completion points
      const baseTransaction = await this.pointsRepository.createPointsLog({
        student_id: studentId,
        related_goal_id: goalId,
        points: pointsBreakdown.basePoints,
        reason: "Goal completion points",
      });
      transactions.push(baseTransaction);

      // Award bonus points if completed on time
      if (onTime && pointsBreakdown.bonusPoints > 0) {
        const bonusTransaction = await this.pointsRepository.createPointsLog({
          student_id: studentId,
          related_goal_id: goalId,
          points: pointsBreakdown.bonusPoints,
          reason: "On-time completion bonus",
        });
        transactions.push(bonusTransaction);
      }

      return transactions;
    } catch (error) {
      throw new Error(
        `Failed to award goal completion points: ${error.message}`
      );
    }
  }

  /**
   * Calculate potential points for a goal
   * @async
   * @param {Object} goal - Goal object
   * @param {boolean} [onTime=false] - Whether completion would be on time
   * @returns {Promise<Object>} Points breakdown (base points, bonus, total)
   */
  async calculateGoalPoints(goal, onTime = false) {
    try {
      let basePoints = 2; // Default base points
      let bonusPoints = 0;

      // Adjust base points based on goal priority
      if (goal.priority === "high") {
        basePoints = 5;
      } else if (goal.priority === "medium") {
        basePoints = 3;
      }

      // Calculate difficulty bonus
      const difficultyMultiplier = this._calculateDifficultyMultiplier(goal);
      basePoints = Math.floor(basePoints * difficultyMultiplier);

      // On-time bonus
      if (onTime) {
        bonusPoints = Math.max(1, Math.floor(basePoints * 0.5));
      }

      const totalPoints = basePoints + bonusPoints;

      return {
        basePoints,
        bonusPoints,
        totalPoints,
        breakdown: {
          priority: goal.priority,
          difficultyMultiplier,
          onTimeBonus: onTime,
        },
      };
    } catch (error) {
      throw new Error(`Failed to calculate goal points: ${error.message}`);
    }
  }

  /**
   * Get points earning opportunities for a student
   * @async
   * @param {number} studentId - Student ID
   * @returns {Promise<Array<Object>>} Available earning opportunities
   */
  async getEarningOpportunities(studentId) {
    try {
      const opportunities = [];

      // Active goals
      const activeGoals = await this.goalRepository.findByStudentId(studentId, {
        completed: false,
        limit: 10,
      });

      for (const goal of activeGoals) {
        const points = await this.calculateGoalPoints(goal, true);
        opportunities.push({
          type: "goal_completion",
          title: `Complete: ${goal.title}`,
          description: goal.description,
          potentialPoints: points.totalPoints,
          deadline: goal.target_date,
          difficulty: goal.priority,
          goalId: goal.id,
        });
      }

      // Daily attendance opportunity
      const today = new Date().toISOString().split("T")[0];
      const hasAttendanceToday = await this._checkTodayAttendance(
        studentId,
        today
      );

      if (!hasAttendanceToday) {
        opportunities.push({
          type: "daily_attendance",
          title: "Mark Today's Attendance",
          description: "Earn points for being present today",
          potentialPoints: 1,
          deadline: today,
          difficulty: "low",
        });
      }

      // Weekly streaks
      const streakOpportunity = await this._getStreakOpportunity(studentId);
      if (streakOpportunity) {
        opportunities.push(streakOpportunity);
      }

      return opportunities.sort(
        (a, b) => b.potentialPoints - a.potentialPoints
      );
    } catch (error) {
      throw new Error(`Failed to get earning opportunities: ${error.message}`);
    }
  }

  /**
   * Get points redemption options available
   * @async
   * @param {number} studentId - Student ID
   * @returns {Promise<Array<Object>>} Available redemption options
   */
  async getRedemptionOptions(studentId) {
    try {
      const balance = await this.pointsRepository.getStudentBalance(studentId);
      const availablePoints = balance.current_balance;

      const redemptionCatalog = [
        {
          id: 1,
          name: "Extra Break Time",
          cost: 10,
          description: "5 extra minutes of break time",
        },
        {
          id: 2,
          name: "Homework Pass",
          cost: 25,
          description: "Skip one homework assignment",
        },
        {
          id: 3,
          name: "Choose Your Seat",
          cost: 15,
          description: "Pick your preferred seat for a week",
        },
        {
          id: 4,
          name: "Early Dismissal",
          cost: 50,
          description: "Leave 15 minutes early",
        },
        {
          id: 5,
          name: "Special Recognition",
          cost: 100,
          description: "Certificate of achievement",
        },
      ];

      const availableOptions = redemptionCatalog.filter(
        (option) => option.cost <= availablePoints
      );
      const unavailableOptions = redemptionCatalog.filter(
        (option) => option.cost > availablePoints
      );

      return {
        currentBalance: availablePoints,
        available: availableOptions,
        unavailable: unavailableOptions.map((option) => ({
          ...option,
          pointsNeeded: option.cost - availablePoints,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get redemption options: ${error.message}`);
    }
  }

  /**
   * Validate points transaction data
   * @async
   * @param {Object} transactionData - Transaction data to validate
   * @param {boolean} [isUpdate=false] - Whether this is an update operation
   * @returns {Promise<Object>} Validation result with errors if any
   */
  async validateTransactionData(transactionData, isUpdate = false) {
    const errors = [];

    try {
      // Required fields for creation
      if (!isUpdate) {
        if (!transactionData.student_id) {
          errors.push("Student ID is required");
        }
        if (transactionData.points === undefined) {
          errors.push("Points amount is required");
        }
      }

      // Validate points amount
      if (transactionData.points !== undefined) {
        if (
          !Number.isInteger(transactionData.points) ||
          transactionData.points <= 0
        ) {
          errors.push("Points must be a positive integer");
        }
        if (transactionData.points > 1000) {
          errors.push("Points amount cannot exceed 1000 per transaction");
        }
      }

      // Validate description length
      if (
        transactionData.description &&
        transactionData.description.length > 200
      ) {
        errors.push("Description must be 200 characters or less");
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
   * Check if student has sufficient points for redemption
   * @async
   * @param {number} studentId - Student ID
   * @param {number} pointsRequired - Points required
   * @returns {Promise<boolean>} True if sufficient balance
   */
  async hasSufficientBalance(studentId, pointsRequired) {
    try {
      const balance = await this.pointsRepository.getStudentBalance(studentId);
      return balance.current_balance >= pointsRequired;
    } catch (error) {
      throw new Error(`Failed to check sufficient balance: ${error.message}`);
    }
  }

  /**
   * Get points trends over time
   * @async
   * @param {Object} [options] - Trend analysis options
   * @returns {Promise<Array<Object>>} Points trends data
   */
  async getPointsTrends(options = {}) {
    try {
      const { groupBy = "week", dateRange = {}, studentIds = [] } = options;

      // Generate trend data based on groupBy parameter
      const trends = [];
      const now = new Date();
      const periods = groupBy === "day" ? 30 : groupBy === "week" ? 12 : 6;

      for (let i = periods; i >= 0; i--) {
        const periodStart = new Date(now);
        const periodEnd = new Date(now);

        if (groupBy === "day") {
          periodStart.setDate(now.getDate() - i);
          periodEnd.setDate(now.getDate() - i);
        } else if (groupBy === "week") {
          periodStart.setDate(now.getDate() - i * 7);
          periodEnd.setDate(now.getDate() - i * 7 + 6);
        } else {
          periodStart.setMonth(now.getMonth() - i);
          periodEnd.setMonth(now.getMonth() - i + 1);
        }

        const periodStats = await this.pointsRepository.getAggregatedStats({
          startDate: periodStart,
          endDate: periodEnd,
        });

        trends.push({
          period: periodStart.toISOString().split("T")[0],
          totalPointsAwarded: periodStats.total_points_awarded || 0,
          totalPointsSpent: periodStats.total_points_spent || 0,
          netPoints:
            (periodStats.total_points_awarded || 0) -
            (periodStats.total_points_spent || 0),
          activeStudents: periodStats.active_students || 0,
          averagePerStudent:
            periodStats.active_students > 0
              ? Math.round(
                  (periodStats.total_points_awarded || 0) /
                    periodStats.active_students
                )
              : 0,
        });
      }

      return trends;
    } catch (error) {
      throw new Error(`Failed to get points trends: ${error.message}`);
    }
  }

  // Additional methods continue here...

  /**
   * Apply penalty points for violations or infractions
   * @async
   * @param {Object} penaltyData - Penalty data
   * @returns {Promise<Object>} Penalty transaction result
   */
  async applyPenalty(penaltyData) {
    try {
      const validationResult = await this.validateTransactionData({
        ...penaltyData,
        type: "penalty",
      });

      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      const transaction = await this.pointsRepository.createPointsLog({
        student_id: penaltyData.student_id,
        points: -penaltyData.points,
        reason: penaltyData.description || "Penalty",
        related_goal_id: null,
      });

      const balance = await this.pointsRepository.getStudentBalance(
        penaltyData.student_id
      );

      return {
        transaction,
        balance,
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to apply penalty: ${error.message}`);
    }
  }

  /**
   * Generate points report for specified period
   * @async
   * @param {Object} reportOptions - Report generation options
   * @returns {Promise<Object>} Generated points report
   */
  async generatePointsReport(reportOptions) {
    try {
      const {
        studentIds = [],
        startDate,
        endDate,
        format = "summary",
      } = reportOptions;

      if (!startDate || !endDate) {
        throw new Error(
          "Start date and end date are required for report generation"
        );
      }

      const dateRange = { startDate, endDate };
      const analytics = await this.getPointsAnalytics({
        studentIds,
        dateRange,
      });

      const report = {
        reportType: "points",
        format,
        period: dateRange,
        generatedAt: new Date(),
        ...analytics,
      };

      if (format === "detailed") {
        report.transactionDetails = await this._getTransactionDetails(
          dateRange,
          studentIds
        );
        report.studentBreakdowns = await this._getStudentBreakdowns(
          dateRange,
          studentIds
        );
      }

      return report;
    } catch (error) {
      throw new Error(`Failed to generate points report: ${error.message}`);
    }
  }

  /**
   * Send points-related notifications
   * @async
   * @param {Object} notificationOptions - Notification options
   * @returns {Promise<Object>} Notification sending result
   */
  async sendPointsNotifications(notificationOptions) {
    // Placeholder implementation - would integrate with notification service
    return { success: true, sent: 0 };
  }

  /**
   * Archive old points transactions
   * @async
   * @param {Date} cutoffDate - Date before which transactions should be archived
   * @returns {Promise<Object>} Archive operation result
   */
  async archiveOldTransactions(cutoffDate) {
    // Placeholder implementation - would archive old transactions
    return { success: true, archivedCount: 0 };
  }

  /**
   * Bulk award points for multiple students
   * @async
   * @param {Array<Object>} bulkAwardData - Array of points award data
   * @returns {Promise<Object>} Bulk award operation result
   */
  async bulkAwardPoints(bulkAwardData) {
    try {
      const results = {
        successful: [],
        failed: [],
        totalProcessed: bulkAwardData.length,
      };

      for (const awardData of bulkAwardData) {
        try {
          const result = await this.awardPoints(awardData);
          results.successful.push(result);
        } catch (error) {
          results.failed.push({
            data: awardData,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to bulk award points: ${error.message}`);
    }
  }

  // Private helper methods
  _calculateRedemptionValue(points) {
    // Simple conversion: 1 point = $0.10 value
    return points * 0.1;
  }

  _categorizeTransaction(transaction) {
    // Categorize based on points value and reason field
    if (transaction.points > 0) {
      // Positive points = earned or bonus
      if (transaction.reason && transaction.reason.includes("bonus")) {
        return "Bonus";
      }
      return "Achievement";
    } else {
      // Negative points = redeemed or penalty
      if (transaction.reason && transaction.reason.includes("penalty")) {
        return "Penalty";
      }
      return "Redemption";
    }
  }

  _calculateTransactionImpact(transaction) {
    // Calculate the relative impact of this transaction
    if (transaction.points >= 50) return "high";
    if (transaction.points >= 20) return "medium";
    return "low";
  }

  async _calculateProjectedEarnings(studentId) {
    // Calculate projected earnings based on current patterns
    const recentTransactions = await this.pointsRepository.getRecentActivity({
      studentId,
      days: 30,
    });

    const dailyAverage =
      recentTransactions.length > 0
        ? recentTransactions.reduce((sum, t) => sum + t.points, 0) / 30
        : 0;

    return Math.round(dailyAverage * 30); // Projected monthly earnings
  }

  async _calculateEarningRate(studentId) {
    // Calculate points earned per day over last 30 days
    const recentEarnings = await this.pointsRepository.findPointsLogByStudent(
      studentId,
      {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      }
    );

    // Filter for positive points only (earned points)
    const earnedPoints = recentEarnings.filter((t) => t.points > 0);

    return (
      Math.round(
        (recentEarnings.reduce((sum, t) => sum + t.points, 0) / 30) * 100
      ) / 100
    );
  }

  async _getStudentPointsRank(studentId) {
    const leaderboard = await this.pointsRepository.getLeaderboard({
      limit: 1000,
    });
    const rank =
      leaderboard.findIndex((entry) => entry.student_id === studentId) + 1;
    return rank || null;
  }

  async _getStudentPointsPercentile(studentId) {
    const rank = await this._getStudentPointsRank(studentId);
    if (!rank) return null;

    const totalStudents = await this.studentRepository.countAll();
    return Math.round((1 - (rank - 1) / totalStudents) * 100);
  }

  _calculateDifficultyMultiplier(goal) {
    // Simple difficulty calculation based on goal complexity
    let multiplier = 1.0;

    if (goal.description && goal.description.length > 100) multiplier += 0.2;
    if (goal.priority === "high") multiplier += 0.3;

    return Math.min(multiplier, 2.0); // Cap at 2x
  }

  async _calculatePointsTrend(studentId) {
    const recent = await this.pointsRepository.findPointsLogByStudent(
      studentId,
      {
        limit: 10,
        orderBy: "created_at",
        orderDirection: "DESC",
      }
    );

    if (recent.length < 3) return "stable";

    const recentSum = recent.slice(0, 3).reduce((sum, t) => sum + t.points, 0);
    const olderSum = recent.slice(-3).reduce((sum, t) => sum + t.points, 0);

    if (recentSum > olderSum * 1.2) return "increasing";
    if (recentSum < olderSum * 0.8) return "decreasing";
    return "stable";
  }

  _calculateBadges(entry) {
    const badges = [];

    if (entry.total_balance >= 100) badges.push("Century Club");
    if (entry.earned_points >= 50) badges.push("High Achiever");
    if (entry.bonus_points >= 20) badges.push("Bonus Master");

    return badges;
  }

  async _checkTodayAttendance(studentId, date) {
    // This would check if attendance is already recorded for today
    return false; // Placeholder
  }

  async _getStreakOpportunity(studentId) {
    // This would calculate streak-based opportunities
    return null; // Placeholder
  }

  async _getTopEarners(dateRange) {
    const leaderboard = await this.pointsRepository.getLeaderboard({
      limit: 5,
      ...dateRange,
    });
    return leaderboard;
  }

  async _getMostActiveStudents(dateRange) {
    // Students with most transactions in period
    return [];
  }

  async _getRedemptionPatterns(dateRange) {
    // Analyze redemption patterns
    return {};
  }

  async _calculateEngagementMetrics(dateRange) {
    // Calculate engagement based on points activity
    return {};
  }

  async _generatePointsRecommendations(stats) {
    return [
      "Increase goal completion rewards",
      "Introduce weekly challenges",
      "Add bonus point opportunities",
    ];
  }

  async _getTransactionDetails(dateRange, studentIds) {
    // Get detailed transaction breakdown
    return [];
  }

  async _getStudentBreakdowns(dateRange, studentIds) {
    // Get per-student points breakdown
    return [];
  }
}
