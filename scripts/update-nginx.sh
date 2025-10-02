#!/bin/bash

# Script to update nginx directory with frontend files
# Run this manually if deployment can't access sudo

echo "Updating nginx directory from staging..."

if [ ! -d ~/frontend-staging ]; then
    echo "Error: ~/frontend-staging directory not found"
    echo "Run deployment first to create staging files"
    exit 1
fi

if [ ! "$(ls -A ~/frontend-staging)" ]; then
    echo "Error: ~/frontend-staging is empty"
    exit 1
fi

echo "Frontend staging files:"
ls -la ~/frontend-staging/

echo "Updating /var/www/gloire-road-map-live/..."
sudo mkdir -p /var/www/gloire-road-map-live
sudo rm -rf /var/www/gloire-road-map-live/*
sudo cp -r ~/frontend-staging/* /var/www/gloire-road-map-live/
sudo chown -R www-data:www-data /var/www/gloire-road-map-live

echo "Nginx directory updated successfully!"
echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Done! Check your website now."