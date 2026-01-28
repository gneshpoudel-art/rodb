# RODB Website - Render Deployment Checklist

## ✅ Pre-Deployment Verification

Run this checklist before deploying to Render:

### 1. Local Testing
- [ ] Run `npm install` successfully
- [ ] Run `npm start` and verify server starts on port 3000
- [ ] Access http://localhost:3000 in browser
- [ ] Check admin panel at http://localhost:3000/admin
- [ ] Test a few API endpoints (/api/health, /api/articles)

### 2. Git Repository
- [ ] All changes committed: `git status` shows nothing to commit
- [ ] Pushed to GitHub: `git push origin main`
- [ ] Verify repository is public or Render has access

### 3. Configuration Files
- [ ] ✓ `.gitignore` includes `.env` (sensitive data not committed)
- [ ] ✓ `.env.example` created for reference
- [ ] ✓ `render.yaml` created with deployment config
- [ ] ✓ `package.json` has correct `engines.node: "18.x"`
- [ ] ✓ `app.js` has `app.listen()` at the end

### 4. Directory Structure
- [ ] ✓ `/server/data/` exists (database directory)
- [ ] ✓ `/server/uploads/` exists (uploads directory)
- [ ] ✓ `/server/logs/` exists (logs directory)
- [ ] ✓ `/server/backups/` exists (backups directory)
- [ ] ✓ `/server/public/` contains frontend files

---

## 🚀 Render Deployment Steps

### Step 1: Connect GitHub to Render
1. Go to https://render.com
2. Click **Sign Up** or **Sign In**
3. Click **New +** → **Web Service**
4. Click **Connect account** → GitHub
5. Authorize Render to access your GitHub repositories
6. Select the `gneshpoudel/rodb` repository

### Step 2: Configure Service
Fill in these details:
- **Name:** `rodb-news` (or your preferred name)
- **Environment:** Node
- **Region:** Oregon (Free tier only available in Oregon)
- **Branch:** main
- **Root Directory:** Leave empty (project root)
- **Build Command:** `npm install`
- **Start Command:** `node server/app.js`
- **Plan:** Free

### Step 3: Add Environment Variables
In the **Environment** tab, add:

#### Critical Variables (Change These!)
```
NODE_ENV=production
ADMIN_ID=fujitshuu@45
ADMIN_PASSWORD=bIJEji3#@!5gg
JWT_SECRET=[Generate: openssl rand -hex 32]
JWT_REFRESH_SECRET=[Generate: openssl rand -hex 32]
ADMIN_SECRET=[Generate: openssl rand -hex 32]
```

#### Database & Server
```
PORT=3000
HOST=0.0.0.0
DB_PATH=./server/data/rodb.db
```

#### Optional (Use Defaults)
```
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
LOG_LEVEL=info
ORG_NAME=Routine of Dhulikhel Banda
ORG_EMAIL=rodb.dhulikhel@gmail.com
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBER=true
PASSWORD_REQUIRE_SPECIAL=true
ENABLE_COMMENTS=true
ENABLE_USER_REGISTRATION=true
```

### Step 4: Deploy
1. Click **Create Web Service**
2. Render will automatically:
   - Clone repository
   - Install dependencies (`npm install`)
   - Start server (`node server/app.js`)
3. Wait 2-5 minutes for deployment to complete
4. Get your public URL: `https://your-app-name.onrender.com`

---

## 🔍 Post-Deployment Testing

After deployment, test these URLs:

### Frontend
- [ ] Main site: `https://your-app-name.onrender.com/`
- [ ] Article page: `https://your-app-name.onrender.com/article.html?slug=test`
- [ ] Admin panel: `https://your-app-name.onrender.com/admin`

### API Endpoints
- [ ] Health check: `https://your-app-name.onrender.com/api/health`
- [ ] Articles: `https://your-app-name.onrender.com/api/articles`
- [ ] Categories: `https://your-app-name.onrender.com/api/categories`
- [ ] Settings: `https://your-app-name.onrender.com/api/settings/public`

### Admin Login
- [ ] ID: `fujitshuu@45`
- [ ] Password: `bIJEji3#@!5gg`

---

## 🐛 Troubleshooting

### Build Fails
**Error:** `npm install` fails
- **Solution:** Ensure all dependencies in `package.json` are valid
- **Check:** Run `npm install` locally first

**Error:** Sharp compilation fails
- **Solution:** ✓ Already fixed - Node 18.x specified in `package.json`
- **Check:** Render uses Linux; sharp compiles on Linux

### Server Doesn't Start
**Error:** `Application exited early`
- **Solution:** ✓ Fixed - `app.listen()` added to `app.js`
- **Check:** Last lines of `app.js` have the listen code

**Error:** `PORT already in use`
- **Solution:** Change PORT in Environment Variables
- **Check:** PORT should be 3000 (default)

### Database Issues
**Error:** `Database not found`
- **Solution:** Database auto-initializes on first run
- **Check:** Logs show database initialization

**Error:** `Cannot write to database`
- **Solution:** Render's `/data` directory is writable
- **Check:** Use `./server/data/rodb.db` as DB_PATH

### Environment Variables Not Loaded
**Error:** Variables undefined
- **Solution:** Ensure variables are added in Render dashboard (not .env file)
- **Check:** Refresh Render dashboard before redeploying
- **Trigger:** Redeploy service after adding variables

### Admin Login Fails
**Error:** `401 Unauthorized` at admin panel
- **Solution:** Check ADMIN_ID and ADMIN_PASSWORD match your environment variables
- **Default:** ID=`fujitshuu@45`, Password=`bIJEji3#@!5gg`

---

## 📊 Monitoring

### Check Logs
1. Go to Render Dashboard
2. Select your service
3. Click **Logs** tab
4. Real-time logs show errors and info

### Monitor Metrics
- **CPU:** Should be < 30% at rest
- **Memory:** Should be < 200MB at rest
- **Network:** Monitor inbound/outbound

### Deployment History
- Click **Deploys** tab to see past deployments
- Can rollback to previous version if needed

---

## 💡 Important Notes

### Data Persistence
- ✓ Database (`./server/data/rodb.db`) persists between deployments
- ✓ Uploads (`./server/uploads/`) persist between deployments
- ✓ Logs (`./server/logs/`) persist between deployments

### Cold Starts
- Free tier services spin down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds (cold start)
- Upgrade to paid tier to eliminate cold starts

### File Upload Limits
- Max file size: 10MB (configured in `UPLOAD_MAX_FILE_SIZE`)
- Allowed image types: JPEG, PNG, WebP, GIF
- Uploaded files stored in `/server/uploads/`

### Security
- ⚠️ Never commit `.env` to GitHub
- ⚠️ Change JWT secrets in production
- ⚠️ Change admin credentials in production
- ⚠️ Don't hardcode sensitive data
- ✓ Use Render Environment Variables for secrets

---

## 🔄 Updating Your Site

To update your site after deployment:

1. Make changes locally
2. Test with `npm start`
3. Commit: `git add . && git commit -m "message"`
4. Push: `git push origin main`
5. Render automatically redeploys (if auto-deploy is enabled)

Or manually redeploy:
1. Go to Render Dashboard
2. Select your service
3. Click **Manual Deploy** → **Deploy latest commit**

---

## 📞 Support

If you encounter issues:

1. Check logs in Render dashboard
2. Verify environment variables are set
3. Ensure all files are committed to GitHub
4. Render documentation: https://render.com/docs
5. RODB documentation: See `RENDER_DEPLOYMENT.md`

---

## ✨ Next Steps (Optional)

- [ ] Set up custom domain
- [ ] Enable auto-deploy from GitHub
- [ ] Set up monitoring/alerts
- [ ] Upgrade to paid tier (eliminate cold starts)
- [ ] Set up database backups
- [ ] Configure CDN with Cloudflare

---

**Deployment Date:** [Your Date]
**Render URL:** [Your Render URL]
**Admin Email:** rodb.dhulikhel@gmail.com

---

Good luck with your deployment! 🚀
