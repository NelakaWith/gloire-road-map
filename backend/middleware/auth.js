/**
 * @fileoverview JWT Authentication middleware
 * @description Provides JWT token verification middleware for protecting API routes
 * @author @NelakaWith
 * @version 1.0.0
 */

import jwt from "jsonwebtoken";

/**
 * JWT Authentication middleware
 * @function authenticateJWT
 * @description Verifies JWT tokens from httpOnly cookies and attaches user info to request
 * @param {Object} req - Express request object
 * @param {Object} req.cookies - Request cookies
 * @param {string} req.cookies.auth_token - JWT token from httpOnly cookie
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() on success, sends error response on failure
 * @throws {401} Unauthorized if no token is provided
 * @throws {403} Forbidden if token is invalid or expired
 * @example
 * // Usage in routes:
 * app.use('/api/protected', authenticateJWT, protectedRoutes);
 *
 * // Cookie format:
 * auth_token=<jwt_token>
 */
export function authenticateJWT(req, res, next) {
  const token = req.cookies.auth_token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "No token provided" });
  }
}
