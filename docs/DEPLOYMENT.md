# Deployment Guide

This project supports deployment to multiple environments using the same GitHub Actions workflow.

## Environments

### Production Environment
- **Domain**: `https://roadmap.nelakawithanage.com/`
- **Backend Port**: 3005
- **Frontend Path**: `/var/www/gloire-road-map-live`
- **Backend Folder**: `~/gloire-road-map`
- **PM2 Process**: `gloire-road-map-backend`
- **Triggers**: Tags (`v*`), releases, manual dispatch

### Demo Environment
- **Domain**: `https://demo.roadmap.nelakawithanage.com/`
- **Backend Port**: 3007
- **Frontend Path**: `/var/www/gloire-road-map-demo`
- **Backend Folder**: `~/gloire-road-map-demo`
- **PM2 Process**: `gloire-road-map-backend-demo`
- **Triggers**: Manual dispatch, tags (`v*`), releases

## Deployment Methods

### Manual Deployment

Both production and demo environments are deployed manually using GitHub Actions workflow dispatch:

1. **Production Deployment**:
   - Go to GitHub Actions → "Deploy" workflow → "Run workflow"
   - Select "production" environment
   - Or create a git tag: `git tag v1.2.3 && git push origin v1.2.3`
   - Or create a GitHub release

2. **Demo Deployment**:
   - Go to GitHub Actions → "Deploy" workflow → "Run workflow"
   - Select "demo" environment

### Server Management

Use the deployment helper script on the server:

```bash
# Check status
./scripts/deploy-helper.sh production status
./scripts/deploy-helper.sh demo status

# View logs
./scripts/deploy-helper.sh production logs
./scripts/deploy-helper.sh demo logs

# Restart services
./scripts/deploy-helper.sh production restart
./scripts/deploy-helper.sh demo restart

# Stop services
./scripts/deploy-helper.sh production stop
./scripts/deploy-helper.sh demo stop

# Cleanup old deployments
./scripts/deploy-helper.sh production cleanup
```

## Nginx Configuration

### Production
Use `nginx_sample.conf` for production configuration.

### Demo
Use `nginx_demo_sample.conf` for demo configuration.

Both configurations need to be added to your nginx sites and enabled.

## Environment Variables

Each environment gets its own `.env` file with appropriate settings:

- **Production**: `PORT=3005`, `CORS_ORIGIN=https://roadmap.nelakawithanage.com/`
- **Demo**: `PORT=3007`, `CORS_ORIGIN=https://demo.roadmap.nelakawithanage.com/`

## Database

Both environments share the same database but can be configured to use different databases by updating the GitHub secrets.

## Monitoring

- Use `pm2 status` to check backend process status
- Check nginx status with `sudo systemctl status nginx`
- View logs using the deployment helper script
- Monitor disk usage of deployment folders

## Troubleshooting

1. **Deployment fails**: Check GitHub Actions logs for detailed error messages
2. **Backend not responding**: Use `./scripts/deploy-helper.sh [env] logs` to check PM2 logs
3. **Frontend not loading**: Verify nginx configuration and file permissions
4. **Database connection issues**: Check `.env` file and database credentials

## Security Notes

- Each environment has its own CORS origin for security
- Different ports prevent conflicts between environments
- Separate nginx configurations allow for different SSL certificates if needed

## Next Steps

1. **Update Nginx**: Add the demo config to your server
2. **DNS Setup**: Point `demo.roadmap.nelakawithanage.com` to your server
3. **SSL Certificates**: Configure SSL for demo domain
4. **Test Deployment**: Use manual dispatch in GitHub Actions to test both production and demo environments