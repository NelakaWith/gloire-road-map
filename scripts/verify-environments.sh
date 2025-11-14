#!/bin/bash

# Environment Setup Verification Script
# Run this to verify your deployment environments are properly configured

echo "=== GitHub Environments Setup Verification ==="
echo ""

# Check if environment files exist
echo "Checking environment configuration files:"
if [ -f ".github/environments/production.yml" ]; then
    echo "✅ Production environment config found"
    if grep -q "secrets:" ".github/environments/production.yml"; then
        echo "   ✅ Required secrets configured"
    else
        echo "   ❌ Required secrets not configured"
    fi
else
    echo "❌ Production environment config missing"
fi

if [ -f ".github/environments/demo.yml" ]; then
    echo "✅ Demo environment config found"
    if grep -q "secrets:" ".github/environments/demo.yml"; then
        echo "   ✅ Required secrets configured"
    else
        echo "   ❌ Required secrets not configured"
    fi
else
    echo "❌ Demo environment config missing"
fi

echo ""
echo "Next steps to complete setup:"
echo "1. Go to GitHub repository → Settings → Environments"
echo "2. Create 'production' environment"
echo "3. Create 'demo' environment"
echo "4. Configure required secrets in repository settings"
echo "5. Test deployment workflow"
echo ""
echo "Required GitHub Secrets:"
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