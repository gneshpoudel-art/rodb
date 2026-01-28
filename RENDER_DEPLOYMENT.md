# Render Deployment Guide

## Prerequisites
- GitHub account with the `gneshpoudel/rodb` repository
- Render account (https://render.com)

## Deployment Steps

### Step 1: Push to GitHub
Ensure all your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Create a Web Service on Render
1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub account and select the `rodb` repository
4. Fill in the following details:
   - **Name:** `rodb-news` (or your preferred name)
   - **Environment:** Node
   - **Region:** Oregon (or closest to you)
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `node server/app.js`
   - **Plan:** Free

### Step 3: Add Environment Variables
In the Render dashboard, go to **Environment** and add these variables:

#### Required (Change these!)
```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
JWT_SECRET=[Generate a strong random string]
JWT_REFRESH_SECRET=[Generate a strong random string]
ADMIN_SECRET=[Generate a strong random string]
ADMIN_ID=fujitshuu@45
ADMIN_PASSWORD=bIJEji3#@!5gg
```

#### Optional (Use defaults if not needed)
```
DB_PATH=./server/data/rodb.db
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
LOG_LEVEL=info
ORG_NAME=Routine of Dhulikhel Banda
ORG_EMAIL=rodb.dhulikhel@gmail.com
```

### Step 4: Deploy
Click **Create Web Service** and Render will automatically:
1. Clone your repository
2. Install dependencies
3. Build your app
4. Start the server

Your app will be live at: `https://your-app-name.onrender.com`

## Important Notes

### Database
- SQLite database will be stored in `./server/data/rodb.db`
- Data persists between deployments on Render
- Backups are stored in `./server/backups`

### Static Files
- Your frontend files are served from `/public` directory
- Admin panel accessible at `/admin`
- API endpoints accessible at `/api/*`

### Logs
- Check deployment logs in Render dashboard
- Application logs available in `./server/logs`

### Troubleshooting

**Build Fails with sharp error:**
- Render uses Linux environment, sharp should compile correctly
- Ensure `engines.node` is set to `18.x` in package.json (✓ Already configured)

**Application exits immediately:**
- Check that all required environment variables are set
- Verify `app.listen()` is configured (✓ Already added)

**Database not persisting:**
- Render's free tier stores files in `/data` directory
- Keep DB_PATH as `./server/data/rodb.db` for proper persistence

**Port issues:**
- Ensure PORT is set to 3000 in environment variables
- Use HOST=0.0.0.0 to allow external connections

## Monitoring

Monitor your deployment at:
- https://dashboard.render.com
- Check logs in real-time
- Monitor resource usage (CPU, Memory)

## Free Tier Limits
- 0.5 GB RAM
- 0.5 CPU
- No custom domain without upgrade
- Services spin down after 15 minutes of inactivity (auto-restart on request)

## After Deployment

1. Test your website at the provided Render URL
2. Verify admin panel works: `/admin`
3. Test API endpoints: `/api/articles`, `/api/health`, etc.
4. Monitor logs for any errors

## Security Reminders

⚠️ **DO NOT commit `.env` file to GitHub**
- Use Environment Variables in Render dashboard
- Rotate admin credentials periodically
- Change JWT secrets in production
- Keep admin credentials secure

## Next Steps (Optional)

1. **Custom Domain:** Connect a custom domain in Render settings
2. **Database Upgrade:** Consider upgrading to PostgreSQL for production
3. **CDN:** Use Cloudflare for faster content delivery
4. **Monitoring:** Set up uptime monitoring

---

For more help, visit: https://render.com/docs
