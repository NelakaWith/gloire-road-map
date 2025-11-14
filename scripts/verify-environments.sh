#!/bin/bash

# Environment Setup Verification Script
# Run this to verify your deployment environments are properly configured

echo "=== GitHub Environments Setup Verification ==="
echo ""

# Check if environment configuration files exist
echo "Checking GitHub Actions environment configuration files:"
if [ -f ".github/environments/production.yml" ]; then
    echo "✅ Production environment config found (.github/environments/production.yml)"
    if grep -q "secrets:" ".github/environments/production.yml"; then
        echo "   ✅ Required secrets declared in config"
    else
        echo "   ❌ Required secrets not declared in config"
    fi
else
    echo "❌ Production environment config missing (.github/environments/production.yml)"
fi

if [ -f ".github/environments/demo.yml" ]; then
    echo "✅ Demo environment config found (.github/environments/demo.yml)"
    if grep -q "secrets:" ".github/environments/demo.yml"; then
        echo "   ✅ Required secrets declared in config"
    else
        echo "   ❌ Required secrets not declared in config"
    fi
else
    echo "❌ Demo environment config missing (.github/environments/demo.yml)"
fi

echo ""
echo "⚠️  IMPORTANT: These files declare REQUIRED secrets, but do NOT contain actual secret values."
echo "   Actual secret values must be set in GitHub repository settings → Secrets and variables → Actions"
echo ""

echo "Next steps to complete setup:"
echo "1. Go to GitHub repository → Settings → Environments"
echo "2. Create 'production' environment (will use .github/environments/production.yml)"
echo "3. Create 'demo' environment (will use .github/environments/demo.yml)"
echo "4. Configure required secrets in repository settings → Secrets and variables → Actions"
echo "5. Test deployment workflow"
echo ""

echo "Required GitHub Repository Secrets (set in Settings → Secrets and variables → Actions):"
echo "- DROPLET_HOST: Your server IP"
echo "- DROPLET_USER: SSH username"
echo "- DROPLET_SSH_KEY: Private SSH key"
echo "- DB_NAME: Production database name"
echo "- DB_USER: Production database username"
echo "- DB_PASS: Production database password"
echo "- DEMO_DB_NAME: Demo database name (separate)"
echo "- DEMO_DB_USER: Demo database username (separate)"
echo "- DEMO_DB_PASS: Demo database password (separate)"
echo "- JWT_SECRET: JWT signing secret"