# Gloire Road Map - Goal Tracking App

## Overview

A local-only goal-tracking system for an admin to manage student goals. Runs fully offline on Windows. No Docker or cloud required.

## Stack

- Frontend: Vue 3 + Vite
- Backend: Express.js (Node.js)
- Database: MySQL (local, e.g., XAMPP)
- Auth: Email/password, bcrypt, JWT

## Folder Structure

- frontend/ # Vue 3 app
- backend/ # Express.js API
- mysql/ # SQL schema & seed
- start-dev.bat # One-click launcher
- README.txt # This file

## Setup Instructions

### 1. Install Prerequisites

- Node.js (https://nodejs.org/)
- MySQL (via XAMPP or Windows service)
- (Optional) Git

### 2. Database Setup

- Start MySQL (via XAMPP or Windows service)
- Import the SQL file in `mysql/schema.sql` using phpMyAdmin or MySQL CLI:
  - `mysql -u root -p < mysql/schema.sql`
- This creates tables and a sample admin user (email: admin@example.com, password: admin123)

### 3. Install Dependencies

- Open a terminal in `frontend/` and run: `npm install`
- Open a terminal in `backend/` and run: `npm install`

### 4. Configure Environment

- Copy `.env.example` to `.env` in both `frontend/` and `backend/` and adjust as needed.

### 5. Start the App

- Double-click `start-dev.bat` to launch MySQL, backend, and frontend servers.
- Open http://localhost:5173 in your browser.

---

## Default Admin Login

- Email: admin@example.com
- Password: admin123

---

## Troubleshooting

- If MySQL does not start, check XAMPP or Windows Services.
- If ports are in use, change them in `.env` files and `start-dev.bat`.
- For help, see comments in each folder's README or code files.
