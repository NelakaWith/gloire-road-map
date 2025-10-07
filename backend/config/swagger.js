/**
 * @fileoverview Swagger/OpenAPI configuration
 * @description Configuration for automatic API documentation generation
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import swaggerJsdoc from "swagger-jsdoc";

/**
 * Swagger JSDoc configuration options
 * @type {Object}
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gloire Road Map API",
      version: "1.0.0",
      description:
        "A comprehensive student management and goal tracking system with attendance monitoring",
      contact: {
        name: "Gloire Road Map Team",
        email: "support@gloire-roadmap.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:3005",
        description: "Development server",
      },
      {
        url: "https://api.gloire-roadmap.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        Student: {
          type: "object",
          required: ["name"],
          properties: {
            id: {
              type: "integer",
              description: "Unique student identifier",
              example: 1,
            },
            name: {
              type: "string",
              description: "Full name of the student",
              example: "John Doe",
            },
            contact_number: {
              type: "string",
              nullable: true,
              description: "Student contact phone number",
              example: "+1-234-567-8900",
            },
            address: {
              type: "string",
              nullable: true,
              description: "Student physical address",
              example: "123 Main St, City, State 12345",
            },
            date_of_birth: {
              type: "string",
              format: "date",
              nullable: true,
              description: "Student date of birth",
              example: "2000-01-15",
            },
            points: {
              type: "integer",
              description: "Achievement points earned",
              example: 45,
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Registration timestamp",
              example: "2025-10-01T00:00:00.000Z",
            },
            days_attended: {
              type: "integer",
              description: "Number of days marked as present",
              example: 18,
            },
            total_attendance_records: {
              type: "integer",
              description: "Total attendance records",
              example: 20,
            },
          },
        },
        Goal: {
          type: "object",
          required: ["student_id", "title"],
          properties: {
            id: {
              type: "integer",
              description: "Unique goal identifier",
              example: 1,
            },
            student_id: {
              type: "integer",
              description: "Reference to student",
              example: 1,
            },
            title: {
              type: "string",
              description: "Goal title",
              example: "Complete Math Assignment",
            },
            description: {
              type: "string",
              nullable: true,
              description: "Detailed goal description",
              example: "Complete chapters 1-5 of algebra textbook",
            },
            target_date: {
              type: "string",
              format: "date",
              nullable: true,
              description: "Target completion date",
              example: "2025-10-15",
            },
            is_completed: {
              type: "boolean",
              description: "Completion status",
              example: false,
            },
            completed_at: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Actual completion timestamp",
              example: "2025-10-14T14:30:00.000Z",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Goal creation timestamp",
              example: "2025-10-01T09:00:00.000Z",
            },
          },
        },
        Attendance: {
          type: "object",
          required: ["student_id", "date", "status"],
          properties: {
            id: {
              type: "integer",
              description: "Unique attendance record identifier",
              example: 1,
            },
            student_id: {
              type: "integer",
              description: "Reference to student",
              example: 1,
            },
            date: {
              type: "string",
              format: "date",
              description: "Attendance date",
              example: "2025-10-07",
            },
            status: {
              type: "string",
              enum: ["present", "absent", "late", "excused"],
              description: "Attendance status",
              example: "present",
            },
            notes: {
              type: "string",
              nullable: true,
              description: "Optional notes about attendance",
              example: "Arrived 5 minutes late due to traffic",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Record creation timestamp",
              example: "2025-10-07T08:00:00.000Z",
            },
          },
        },
        User: {
          type: "object",
          required: ["userName", "email", "password"],
          properties: {
            id: {
              type: "integer",
              description: "Unique user identifier",
              example: 1,
            },
            user_name: {
              type: "string",
              description: "Unique username",
              example: "admin",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "admin@example.com",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
              example: "2025-10-01T00:00:00.000Z",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
              example: "Resource not found",
            },
            error: {
              type: "string",
              description: "Error type",
              example: "NotFoundError",
            },
            details: {
              type: "string",
              description: "Additional error details",
              example: "Student with ID 999 does not exist",
            },
          },
        },
        SuccessMessage: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Success message",
              example: "Operation completed successfully",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Students",
        description: "Student management operations",
      },
      {
        name: "Goals",
        description: "Goal tracking and management",
      },
      {
        name: "Attendance",
        description: "Attendance recording and monitoring",
      },
      {
        name: "Points",
        description: "Points system and leaderboards",
      },
      {
        name: "Analytics",
        description: "Analytics and reporting",
      },
    ],
  },
  apis: ["../routes/*.js", "../models.js"],
};

/**
 * Generate Swagger specification
 * @type {Object}
 */
export const specs = swaggerJsdoc(options);

/**
 * Swagger UI options
 * @type {Object}
 */
export const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Gloire Road Map API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
};
