/**
 * @fileoverview Input validation middleware using Joi
 * @description Comprehensive validation schemas for all API endpoints
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import Joi from "joi";

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context.value,
      }));

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

// Authentication validation schemas
export const authSchemas = {
  register: Joi.object({
    userName: Joi.string()
      .min(3)
      .max(50)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        "string.pattern.base":
          "Username can only contain letters, numbers, and underscores",
        "string.min": "Username must be at least 3 characters long",
        "string.max": "Username cannot exceed 50 characters",
      }),

    email: Joi.string().email().max(255).required().messages({
      "string.email": "Please provide a valid email address",
    }),

    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot exceed 128 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
  }),

  login: Joi.object({
    userName: Joi.string().required().messages({
      "any.required": "Username is required",
    }),

    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),
};

// Student validation schemas
export const studentSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(255).trim().required().messages({
      "string.min": "Name cannot be empty",
      "string.max": "Name cannot exceed 255 characters",
    }),

    contact_number: Joi.string()
      .max(50)
      .pattern(/^[\+]?[0-9\s\-\(\)]*$/)
      .allow("")
      .optional()
      .messages({
        "string.pattern.base":
          "Contact number can only contain numbers, spaces, hyphens, parentheses, and plus sign",
      }),

    address: Joi.string().max(1000).allow("").optional().messages({
      "string.max": "Address cannot exceed 1000 characters",
    }),

    date_of_birth: Joi.date()
      .iso()
      .max("now")
      .min(new Date(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000)) // Max 100 years old
      .allow(null)
      .optional()
      .messages({
        "date.max": "Date of birth cannot be in the future",
        "date.min": "Date of birth seems too old (more than 100 years ago)",
        "date.format": "Date of birth must be in ISO format (YYYY-MM-DD)",
      }),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(255).trim().optional().messages({
      "string.min": "Name cannot be empty",
      "string.max": "Name cannot exceed 255 characters",
    }),

    contact_number: Joi.string()
      .max(50)
      .pattern(/^[\+]?[0-9\s\-\(\)]*$/)
      .allow("")
      .optional()
      .messages({
        "string.pattern.base":
          "Contact number can only contain numbers, spaces, hyphens, parentheses, and plus sign",
      }),

    address: Joi.string().max(1000).allow("").optional().messages({
      "string.max": "Address cannot exceed 1000 characters",
    }),

    date_of_birth: Joi.date()
      .iso()
      .max("now")
      .min(new Date(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000))
      .allow(null)
      .optional()
      .messages({
        "date.max": "Date of birth cannot be in the future",
        "date.min": "Date of birth seems too old (more than 100 years ago)",
        "date.format": "Date of birth must be in ISO format (YYYY-MM-DD)",
      }),
  }),

  createGoal: Joi.object({
    title: Joi.string().min(1).max(255).trim().required().messages({
      "string.min": "Goal title cannot be empty",
      "string.max": "Goal title cannot exceed 255 characters",
    }),
  }),
};

// Goal validation schemas
export const goalSchemas = {
  create: Joi.object({
    student_id: Joi.number().integer().positive().required().messages({
      "number.base": "Student ID must be a number",
      "number.integer": "Student ID must be a whole number",
      "number.positive": "Student ID must be positive",
    }),

    title: Joi.string().min(1).max(255).trim().required().messages({
      "string.min": "Goal title cannot be empty",
      "string.max": "Goal title cannot exceed 255 characters",
    }),

    description: Joi.string().max(1000).allow("").optional().messages({
      "string.max": "Goal description cannot exceed 1000 characters",
    }),

    target_date: Joi.date().iso().min("now").allow(null).optional().messages({
      "date.min": "Target date cannot be in the past",
      "date.format": "Target date must be in ISO format (YYYY-MM-DD)",
    }),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255).trim().optional().messages({
      "string.min": "Goal title cannot be empty",
      "string.max": "Goal title cannot exceed 255 characters",
    }),

    description: Joi.string().max(1000).allow("").optional().messages({
      "string.max": "Goal description cannot exceed 1000 characters",
    }),

    target_date: Joi.date().iso().min("now").allow(null).optional().messages({
      "date.min": "Target date cannot be in the past",
      "date.format": "Target date must be in ISO format (YYYY-MM-DD)",
    }),

    is_completed: Joi.boolean().optional().messages({
      "boolean.base": "Completion status must be true or false",
    }),

    completed_at: Joi.date().iso().allow(null).optional().messages({
      "date.format": "Completion date must be in ISO format (YYYY-MM-DD)",
    }),
  }),
};

// Attendance validation schemas
export const attendanceSchemas = {
  create: Joi.object({
    student_id: Joi.number().integer().positive().required().messages({
      "number.base": "Student ID must be a number",
      "number.integer": "Student ID must be a whole number",
      "number.positive": "Student ID must be positive",
    }),

    date: Joi.date().iso().max("now").required().messages({
      "date.max": "Attendance date cannot be in the future",
      "date.format": "Date must be in ISO format (YYYY-MM-DD)",
    }),

    status: Joi.string()
      .valid("present", "absent", "late", "excused")
      .required()
      .messages({
        "any.only": "Status must be one of: present, absent, late, excused",
      }),

    notes: Joi.string().max(500).allow("").optional().messages({
      "string.max": "Notes cannot exceed 500 characters",
    }),
  }),

  update: Joi.object({
    status: Joi.string()
      .valid("present", "absent", "late", "excused")
      .optional()
      .messages({
        "any.only": "Status must be one of: present, absent, late, excused",
      }),

    notes: Joi.string().max(500).allow("").optional().messages({
      "string.max": "Notes cannot exceed 500 characters",
    }),
  }),

  query: Joi.object({
    student_id: Joi.number().integer().positive().optional().messages({
      "number.base": "Student ID must be a number",
      "number.integer": "Student ID must be a whole number",
      "number.positive": "Student ID must be positive",
    }),

    date: Joi.date().iso().optional().messages({
      "date.format": "Date must be in ISO format (YYYY-MM-DD)",
    }),

    start_date: Joi.date().iso().optional().messages({
      "date.format": "Start date must be in ISO format (YYYY-MM-DD)",
    }),

    end_date: Joi.date()
      .iso()
      .when("start_date", {
        is: Joi.exist(),
        then: Joi.date().min(Joi.ref("start_date")).messages({
          "date.min": "End date must be after start date",
        }),
      })
      .optional()
      .messages({
        "date.format": "End date must be in ISO format (YYYY-MM-DD)",
      }),

    status: Joi.string()
      .valid("present", "absent", "late", "excused")
      .optional()
      .messages({
        "any.only": "Status must be one of: present, absent, late, excused",
      }),
  }),
};

// Common parameter validation
export const paramSchemas = {
  id: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "ID must be a number",
      "number.integer": "ID must be a whole number",
      "number.positive": "ID must be positive",
    }),
  }),

  studentId: Joi.object({
    student_id: Joi.number().integer().positive().required().messages({
      "number.base": "Student ID must be a number",
      "number.integer": "Student ID must be a whole number",
      "number.positive": "Student ID must be positive",
    }),
  }),
};
