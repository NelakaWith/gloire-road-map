#!/bin/bash

# Deployment helper script for Gloire Road Map
# Usage: ./deploy.sh [environment] [action]
# Environments: production, demo
# Actions: status, logs, restart, stop

ENVIRONMENT=${1:-production}
ACTION=${2:-status}

# Environment-specific configurations
if [ "$ENVIRONMENT" = "demo" ]; then
    DEPLOY_FOLDER="gloire-road-map-demo"
    NGINX_FOLDER="/var/www/gloire-road-map-demo"
    BACKEND_PORT="3007"
    PM2_NAME="gloire-road-map-backend-demo"
    DOMAIN="demo.roadmap.nelakawithanage.com"
else
    DEPLOY_FOLDER="gloire-road-map"
    NGINX_FOLDER="/var/www/gloire-road-map-live"
    BACKEND_PORT="3005"
    PM2_NAME="gloire-road-map-backend"
    DOMAIN="roadmap.nelakawithanage.com"
fi

echo "=== Gloire Road Map Deployment Helper ==="
echo "Environment: $ENVIRONMENT"
echo "Domain: $DOMAIN"
echo "Backend Port: $BACKEND_PORT"
echo "PM2 Process: $PM2_NAME"
echo "Deploy Folder: ~/$DEPLOY_FOLDER"
echo "Nginx Folder: $NGINX_FOLDER"
echo ""

case $ACTION in
    "status")
        echo "=== PM2 Status ==="
        pm2 status $PM2_NAME
        echo ""
        echo "=== Nginx Status ==="
        sudo systemctl status nginx --no-pager -l | head -20
        echo ""
        echo "=== Disk Usage ==="
        df -h $NGINX_FOLDER
        ;;
    "logs")
        echo "=== PM2 Logs for $PM2_NAME ==="
        pm2 logs $PM2_NAME --lines 50
        ;;
    "restart")
        echo "=== Restarting $PM2_NAME ==="
        pm2 restart $PM2_NAME
        echo "=== Reloading Nginx ==="
        sudo systemctl reload nginx
        ;;
    "stop")
        echo "=== Stopping $PM2_NAME ==="
        pm2 stop $PM2_NAME
        ;;
    "cleanup")
        echo "=== Cleaning up old deployments ==="
        echo "This will remove old deployment folders. Are you sure? (y/N)"
        read -r confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            rm -rf ~/${DEPLOY_FOLDER}_old_* 2>/dev/null || true
            echo "Cleanup completed"
        else
            echo "Cleanup cancelled"
        fi
        ;;
    *)
        echo "Usage: $0 [environment] [action]"
        echo "Environments: production, demo"
        echo "Actions: status, logs, restart, stop, cleanup"
        exit 1
        ;;
esac