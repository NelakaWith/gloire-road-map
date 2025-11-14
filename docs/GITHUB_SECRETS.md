# GitHub Secrets Setup Guide

## Repository Secrets (Global)

These secrets are available to all environments:

- `DROPLET_HOST` - Your server IP address
- `DROPLET_USER` - SSH username
- `DROPLET_SSH_KEY` - Private SSH key
- `JWT_SECRET` - JWT signing secret

## Production Environment Secrets

Set these in repository settings → Secrets and variables → Actions:

- `DB_NAME` - Production database name
- `DB_USER` - Production database username
- `DB_PASS` - Production database password

## Demo Environment Secrets

Set these in repository settings → Secrets and variables → Actions:

- `DEMO_DB_NAME` - Demo database name (separate)
- `DEMO_DB_USER` - Demo database username (separate)
- `DEMO_DB_PASS` - Demo database password (separate)

## How It Works

The deployment workflow automatically selects the correct database secrets based on the environment:

- **Production deployments**: Use `DB_NAME`, `DB_USER`, `DB_PASS`
- **Demo deployments**: Use `DEMO_DB_NAME`, `DEMO_DB_USER`, `DEMO_DB_PASS`

This ensures complete data isolation between production and demo environments.
