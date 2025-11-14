#!/bin/bash

# Deployment helper script for Gloire Road Map
# Usage: ./deploy-helper.sh [environment] [action]
# Environments: production, demo
# Actions: status, logs, restart, stop, deploy, health

ENVIRONMENT=${1:-demo}
ACTION=${2:-status}

# Environment-specific configurations
if [ "$ENVIRONMENT" = "demo" ]; then
    DEPLOY_FOLDER="gloire-road-map-demo"
    NGINX_FOLDER="/var/www/gloire-road-map-demo"
    BACKEND_PORT="3004"
    PM2_NAME="gloire-road-map-backend-demo"
    DOMAIN="demo.roadmap.nelakawithanage.com"
    CORS_ORIGIN="https://demo.roadmap.nelakawithanage.com/"
else
    DEPLOY_FOLDER="gloire-road-map"
    NGINX_FOLDER="/var/www/gloire-road-map-live"
    BACKEND_PORT="3005"
    PM2_NAME="gloire-road-map-backend"
    DOMAIN="roadmap.nelakawithanage.com"
    CORS_ORIGIN="https://roadmap.nelakawithanage.com/"
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
    "deploy")
        echo "=== Manual Deployment for $ENVIRONMENT ==="
        echo "This will deploy the latest code. Continue? (y/N)"
        read -r confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            # Backup current deployment
            if [ -d "~/$DEPLOY_FOLDER" ]; then
                mv ~/$DEPLOY_FOLDER ~/${DEPLOY_FOLDER}_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
            fi

            # Clone repository
            echo "Cloning repository..."
            git clone https://github.com/NelakaWith/gloire-road-map.git ~/$DEPLOY_FOLDER
            cd ~/$DEPLOY_FOLDER
            git checkout develop

            # Deploy backend
            echo "Deploying backend..."
            cd backend

            # Create .env file (you'll need to set these values)
            cat > .env << EOF
PORT=$BACKEND_PORT
CORS_ORIGIN=$CORS_ORIGIN
DB_HOST=127.0.0.1
DB_NAME=SET_YOUR_DB_NAME_HERE
DB_USER=SET_YOUR_DB_USER_HERE
DB_PASSWORD=SET_YOUR_DB_PASS_HERE
JWT_SECRET=SET_YOUR_JWT_SECRET_HERE
EOF

            echo "⚠️  IMPORTANT: Edit the .env file with your actual secrets:"
            echo "   nano .env"
            echo "Press Enter when ready to continue..."
            read -r

            npm install
            pm2 restart $PM2_NAME || pm2 start server.js --name $PM2_NAME

            # Deploy frontend
            echo "Building and deploying frontend..."
            cd ../frontend
            npm install
            npm run build

            # Copy to nginx directory
            sudo mkdir -p $NGINX_FOLDER
            sudo rm -rf $NGINX_FOLDER/*
            sudo cp -r dist/* $NGINX_FOLDER/
            sudo chown -R www-data:www-data $NGINX_FOLDER

            # Reload nginx
            sudo systemctl reload nginx

            echo "✅ Deployment completed for $ENVIRONMENT"
            echo "🌐 Visit: https://$DOMAIN:$([ "$ENVIRONMENT" = "demo" ] && echo "8083" || echo "8081")"
        else
            echo "Deployment cancelled"
        fi
        ;;
    "health")
        echo "=== Health Check for $ENVIRONMENT ==="
        echo "Backend Health:"
        curl -f http://localhost:$BACKEND_PORT/health 2>/dev/null && echo "✅ Backend is responding" || echo "❌ Backend not responding"
        echo ""
        echo "Frontend Check:"
        [ -f "$NGINX_FOLDER/index.html" ] && echo "✅ Frontend files exist" || echo "❌ Frontend files missing"
        echo ""
        echo "SSL Certificate:"
        echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "❌ SSL check failed"
        ;;
    "cleanup")
        echo "=== Cleaning up old deployments ==="
        echo "This will remove backup deployment folders. Are you sure? (y/N)"
        read -r confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            rm -rf ~/${DEPLOY_FOLDER}_backup_* 2>/dev/null || true
            rm -rf ~/${DEPLOY_FOLDER}_old_* 2>/dev/null || true
            echo "Cleanup completed"
        else
            echo "Cleanup cancelled"
        fi
        ;;
    *)
        echo "Usage: $0 [environment] [action]"
        echo "Environments: production, demo"
        echo "Actions: status, logs, restart, stop, deploy, health, cleanup"
        exit 1
        ;;
esac