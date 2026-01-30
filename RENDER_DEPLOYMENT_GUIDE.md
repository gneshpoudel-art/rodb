# Render Deployment Guide - RODB News Platform

## Status: ✅ READY FOR DEPLOYMENT

Your application is now ready to be deployed to Render with minimal configuration changes.

---

## Issues Fixed

### 1. **Database Initialization Issue** 
- **Problem**: Database connection became null after initial startup
- **Fix**: Added null checks in `server/config/database.js` for all database methods
- **Files Updated**: `server/config/database.js`

### 2. **Server Startup Issue** ✅
- **Problem**: `app.js` was trying to start the server directly, causing duplicate initialization
- **Fix**: Separated app configuration (app.js) from server startup (server.js)
- **Files Updated**: `server/app.js`, `package.json`

### 3. **Package.json Scripts** ✅
- **Problem**: Start script was pointing to wrong file
- **Fix**: Updated scripts to use `server/server.js`
- **Files Updated**: `package.json`

### 4. **Environment Configuration** ✅
- **Problem**: Invalid template syntax in .env file
- **Fix**: Replaced `${PORT:-3000}` with plain `3000`
- **Files Updated**: `.env`, `render.yaml`

---

## Current Deployment Configuration

### ✅ Verified Working

```
✓ Server starts properly at http://0.0.0.0:3000
✓ Database initializes and maintains connection
✓ API endpoints respond correctly
✓ Categories endpoints working
✓ All database operations functional
✓ Graceful shutdown handling implemented
```

### npm Scripts

```json
{
  "start": "node server/server.js",
  "dev": "nodemon server/server.js",
  "init-db": "node server/config/initDatabase.js"
}
```

---

## Deploying to Render

### Step 1: Push to GitHub
```bash
cd /home/arcgg/rodb
git add .
git commit -m "Fixed database initialization and server startup"
git push origin main
```

### Step 2: Create Render Service

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `electricpoudel-hash/rodb`
4. Configure the service:

**Name**: `rodb-news`  
**Environment**: `Node`  
**Build Command**: `npm install`  
**Start Command**: `node server/server.js`  
**Region**: Choose your region (e.g., Ohio, Frankfurt)

### Step 3: Set Environment Variables

In Render dashboard, add these environment variables:

| Key | Value | Type |
|-----|-------|------|
| `NODE_ENV` | `production` | Standard |
| `PORT` | `3000` | Standard |
| `HOST` | `0.0.0.0` | Standard |
| `DB_PATH` | `/tmp/rodb.db` | Standard |
| `JWT_SECRET` | (generate strong secret) | Secret |
| `JWT_REFRESH_SECRET` | (generate strong secret) | Secret |
| `ORG_NAME` | `Routine of Dhulikhel Banda` | Standard |
| `ORG_EMAIL` | `rodb.dhulikhel@gmail.com` | Standard |

> **Important**: Change all JWT secrets to strong, unique values in production!

### Step 4: Database Persistence

**⚠️ IMPORTANT**: SQLite in `/tmp` will be lost when Render rebuilds/restarts.

For persistent storage on Render's free tier, you have options:

**Option A: PostgreSQL (Recommended)**
- Upgrade to Render PostgreSQL database
- Update `server/config/database.js` to use `pg` instead of `sqlite3`

**Option B: External Database**
- Use MongoDB Atlas (free tier available)
- Requires code changes to switch from SQLite

**Option C: Persistent Disk (Paid)**
- Render offers persistent disks for paid plans

---

## Testing After Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Get categories
curl https://your-app.onrender.com/api/categories

# Get public settings
curl https://your-app.onrender.com/api/settings/public

# Get articles
curl https://your-app.onrender.com/api/articles
```

---

## Performance Considerations

| Item | Status | Notes |
|------|--------|-------|
| SSL/HTTPS | ✅ Auto | Render provides free SSL |
| Cold Starts | ⚠️ ~30-60s | Expected on free tier |
| Database Concurrency | ✅ WAL Mode | Enabled for SQLite |
| Rate Limiting | ✅ Configured | 100 req/15min per IP |
| CORS | ✅ Configured | Cross-origin requests allowed |

---

## Common Issues & Fixes

### Issue: "Cannot find module 'sqlite3'"
**Solution**: Run `npm install` - dependencies are already in package.json

### Issue: Database file not found
**Solution**: Database auto-creates on first startup in `server/data/` directory

### Issue: Admin panel not loading
**Solution**: Ensure all routes are properly mounted in `server/app.js`

### Issue: CORS errors in frontend
**Solution**: CORS is configured in `server/config/security.js` - verify origin settings

---

## Files Modified for Deployment

1. ✅ `server/app.js` - Removed duplicate server startup
2. ✅ `server/config/database.js` - Added null checks for database
3. ✅ `package.json` - Fixed start scripts
4. ✅ `.env` - Fixed environment variable syntax
5. ✅ `render.yaml` - Updated start command

---

## Next Steps

1. **Test locally** (already done ✅)
2. **Push to GitHub** with deployment-ready code
3. **Create Render service** with configuration above
4. **Monitor** first deployment in Render dashboard
5. **Set up database** persistence strategy
6. **Configure custom domain** (if needed)

---

## Support & Monitoring

- **Logs**: Available in Render dashboard
- **Health Endpoint**: `GET /api/health` - check server status
- **Database**: Check `/server/logs/` directory for application logs

---

**Status**: Ready for production deployment ✅

