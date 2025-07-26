# Gloire Road Map Backend

## Project setup

1. Copy `.env.example` to `.env` and set your MySQL credentials and JWT secret.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the Express server.

## Features
- REST API for authentication, students, and goals
- JWT authentication, bcrypt password hashing
- MySQL database (see `../mysql/schema.sql`)

## Endpoints
- POST `/api/auth/register` — Register admin (only if no users exist)
- POST `/api/auth/login` — Login
- GET `/api/auth/me` — Get current user
- CRUD for students and goals (see routes)
