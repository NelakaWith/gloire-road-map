# Gloire Road Map - Goal Tracking App

## Overview

A goal-tracking system for an admin to manage student goals. The project supports both local development (offline) and automated builds/deployments to a remote host via GitHub Actions. You can run it locally for development and testing, or use the repository's CI to create releases and deploy to a droplet/VM.

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

Note: for security, please change the default admin password after installing — the README includes the original default for convenience during local development only.

### 3. Install Dependencies

- Open a terminal in `frontend/` and run: `npm install`
- Open a terminal in `backend/` and run: `npm install`

### 4. Configure Environment

- Copy `.env.example` to `.env` in both `frontend/` and `backend/` and adjust as needed.

### 5. Start the App

- Double-click `start-dev.bat` to launch MySQL, backend, and frontend servers.
- Open http://localhost:5173 in your browser.

---

## Current status and notes

- Deployment: The repo includes CI/CD workflows (`.github/workflows/release.yml` and `.github/workflows/deploy.yml`) so releases can be created and deployed to a remote droplet or VM. The deploy workflow supports tag pushes (v\*), manual dispatch, and release events. It creates a GitHub Deployment and reports status back to the repository.
- UI: The frontend uses Vue 3 + PrimeVue components. Modal forms (add/edit) were migrated to PrimeVue Form with in-file resolvers and initial values. The app header/navigation was extracted to `frontend/src/components/AppHeader.vue` and there is a reusable `PageHeader.vue` used across views. A global PrimeVue `ConfirmDialog` and `ConfirmationService` are installed so confirmation prompts work consistently.
- Styling: Tailwind CSS + PostCSS is used. A `.scrollable-panel` utility exists for lists that need internal scrolling.
- Database: The MySQL schema was updated to add extra fields for goals (description, target_date, setup_date, updated_at). The provided seed data was extended to include those columns. Run the schema import before applying the seed file.
- Commit policy / tooling: Commitizen + commitlint + Husky are configured. PRs are validated by a workflow (`.github/workflows/pr-check.yml`) which enforces Conventional Commit-style PR titles and runs commitlint on PR commits.

### Repository rules and changelog commits

This repository enforces rules that require changes to `main` to be made through pull requests. As a result the automatic `@semantic-release/git` step that attempts to push changelog updates directly to `main` was disabled to avoid failing CI runs. If you want changelog updates to be committed back to the repo automatically, consider one of these approaches:

- Create a PR-based workflow: have semantic-release open a pull request with the changelog commit instead of pushing directly (requires additional configuration/plugins).
- Use a bot with an elevated token (PAT) and repository settings that permit that bot to push to `main`.
- Keep changelog generation local and merge the changelog via your normal PR process.

### How to trigger a deploy

- Push a semantic-release tag (example: `v1.2.3`) or publish a GitHub Release — the deploy workflow listens for tag pushes and `release.created`/`release.published` events.
- Ensure the repository's Actions settings allow workflows to use the `GITHUB_TOKEN` for write operations, or set a PAT in secrets and update the workflow to use it.

Security & local-deploy notes

- This project is intended for local/offline development and testing. The default admin password is included in the README for convenience; change it immediately on any environment exposed beyond your machine.
- The deploy workflow copies files and runs commands on a remote server via SSH using secrets (`DROPLET_HOST`, `DROPLET_USER`, `DROPLET_SSH_KEY`). Keep these secrets secure and rotate keys as needed.

---

## Troubleshooting

- If MySQL does not start, check XAMPP or Windows Services.
- If ports are in use, change them in `.env` files and `start-dev.bat`.
- For help, see comments in each folder's README or code files.
