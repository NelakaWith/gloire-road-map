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

Use `nginx_sample_prod.conf` for production configuration.

### Demo

Use `nginx_sample_demo.conf` for demo configuration.

Both configurations need to be added to your nginx sites and enabled.

## Environment Variables

Each environment gets its own `.env` file with appropriate settings:

- **Production**: `PORT=3005`, `CORS_ORIGIN=https://roadmap.nelakawithanage.com/`
- **Demo**: `PORT=3007`, `CORS_ORIGIN=https://demo.roadmap.nelakawithanage.com/`

## Database

Each environment uses its own separate database:
| Aspect | Production | Demo |
|-----------------|----------------|---------------------------|
| **Database** | `DB_NAME` | `DEMO_DB_NAME` (separate) |
| **DB User** | `DB_USER` | `DB_USER` |
| **DB Password** | `DB_PASS` | `DB_PASS` |

- **Demo**: Uses `DEMO_DB_NAME`, `DEMO_DB_USER`, `DEMO_DB_PASS` secrets

This ensures complete isolation between production and demo data.

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

## GitHub Environments Setup

To properly differentiate between production and demo environments in GitHub:

### 1. Create Production Environment

1. Go to your GitHub repository → Settings → Environments
2. Click "New environment"
3. Name it `production`
4. Optionally add environment URL: `https://roadmap.nelakawithanage.com/`
5. Add any required reviewers or deployment branches if needed
6. **Required secrets are already configured** in `.github/environments/production.yml`

### 2. Create Demo Environment

1. Click "New environment" again
2. Name it `demo`
3. Optionally add environment URL: `https://demo.roadmap.nelakawithanage.com/`
4. Configure different protection rules if desired (e.g., no reviewers for demo)
5. **Required secrets are already configured** in `.github/environments/demo.yml`

### Environment Differentiation

| Aspect                 | Production                             | Demo                                        |
| ---------------------- | -------------------------------------- | ------------------------------------------- |
| **GitHub Environment** | `production`                           | `demo`                                      |
| **Domain**             | `roadmap.nelakawithanage.com`          | `roadmap-demo.nelakawithanage.com`          |
| **Backend Port**       | `3005`                                 | `3007`                                      |
| **Deploy Folder**      | `~/gloire-road-map`                    | `~/gloire-road-map-demo`                    |
| **Nginx Folder**       | `/var/www/gloire-road-map-live`        | `/var/www/gloire-road-map-demo`             |
| **PM2 Process**        | `gloire-road-map-backend`              | `gloire-road-map-backend-demo`              |
| **CORS Origin**        | `https://roadmap.nelakawithanage.com/` | `https://roadmap-demo.nelakawithanage.com/` |
| **Database**           | `DB_NAME`                              | `DEMO_DB_NAME` (separate)                   |
| **DB User**            | `DB_USER`                              |                                             |
| **DB Password**        | `DB_PASS`                              |                                             |

## Next Steps

1. **Create GitHub Environments**: Set up production and demo environments in GitHub
2. **Update Nginx**: Add the demo config to your server
3. **DNS Setup**: Point `demo.roadmap.nelakawithanage.com` to your server
4. **SSL Certificates**: Configure SSL for demo domain
5. **Test Deployment**: Use manual dispatch in GitHub Actions to test both production and demo environments
