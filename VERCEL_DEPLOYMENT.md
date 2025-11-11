# Deploying to Vercel - Complete Guide

## Overview

Vercel is a frontend hosting platform. Your **frontend** (React app) can be deployed to Vercel, but your **backend** (FastAPI with EasyOCR) needs to be hosted separately because:

1. Vercel is optimized for serverless functions, not long-running Python processes
2. EasyOCR requires significant resources and model files
3. The backend needs to stay running to process OCR requests

## Step 1: Deploy Your Backend

You need to host your backend on a platform that supports Python applications. Here are the best options:

### Option A: Railway (Recommended - Easy Setup)

1. **Sign up**: Go to [railway.app](https://railway.app)
2. **Create new project**: Click "New Project"
3. **Deploy from GitHub**: Connect your GitHub repo
4. **Configure**:
   - Railway will auto-detect Python
   - Add environment variables if needed
   - Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Get your backend URL**: Railway provides a URL like `https://your-app-name.up.railway.app`
6. **Set CORS**: Update `main.py` or set `ALLOWED_ORIGINS` environment variable

**Backend URL format**: `https://your-app-name.up.railway.app`

### Option B: Render (⚠️ Memory Warning)

**⚠️ IMPORTANT**: EasyOCR requires **at least 1GB RAM**. Render's free tier (512MB) will **fail** with "out of memory" error.

**Solutions:**
1. **Upgrade to Render Starter Plan** ($7/month) - Has 512MB RAM (may still be tight)
2. **Upgrade to Render Standard Plan** ($25/month) - Has 2GB RAM (recommended)
3. **Use Railway instead** (see Option A) - Better free tier options

**If you proceed with Render:**

1. **Sign up**: Go to [render.com](https://render.com)
2. **Create new Web Service**: Click "New" → "Web Service"
3. **Connect GitHub**: Select your repository
4. **Configure**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3.11
   - **Plan**: Select "Starter" ($7/month) or "Standard" ($25/month) - **NOT Free**
5. **Set Environment Variables**:
   - `ALLOWED_ORIGINS`: `https://your-vercel-app.vercel.app`
6. **Get your backend URL**: Render provides a URL like `https://your-app-name.onrender.com`
7. **Note**: Free tier spins down after inactivity (first request may be slow)

**Backend URL format**: `https://your-app-name.onrender.com`

**Alternative**: Use the included `render.yaml` file for automatic configuration.

### Option C: Fly.io (Good Performance)

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Sign up**: `fly auth signup`
3. **Create app**: `fly launch` in your project directory
4. **Deploy**: `fly deploy`
5. **Get your backend URL**: `https://your-app-name.fly.dev`

**Backend URL format**: `https://your-app-name.fly.dev`

### Option D: Heroku (Paid, but Reliable)

1. **Sign up**: Go to [heroku.com](https://heroku.com)
2. **Install Heroku CLI**
3. **Create app**: `heroku create your-app-name`
4. **Deploy**: `git push heroku main`
5. **Get your backend URL**: `https://your-app-name.herokuapp.com`

**Backend URL format**: `https://your-app-name.herokuapp.com`

### Option E: Google Cloud Run (Recommended - Best Free Tier)

1. **Sign up**: Go to [cloud.google.com](https://cloud.google.com)
2. **Install gcloud SDK**: Follow instructions in [GOOGLE_CLOUD_RUN_DEPLOYMENT.md](GOOGLE_CLOUD_RUN_DEPLOYMENT.md)
3. **Deploy**: Use the provided Dockerfile and deployment guide
4. **Get your backend URL**: `https://your-service-xxxxx-uc.a.run.app`
5. **Benefits**: 
   - Generous free tier (2M requests/month)
   - Configurable memory (up to 8GB - perfect for EasyOCR)
   - Auto-scaling to zero (saves money)
   - Pay-per-use pricing

**Backend URL format**: `https://your-service-xxxxx-uc.a.run.app`

**See**: [GOOGLE_CLOUD_RUN_DEPLOYMENT.md](GOOGLE_CLOUD_RUN_DEPLOYMENT.md) for detailed instructions.

### Option F: PythonAnywhere (Simple, but Limited)

1. **Sign up**: Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. **Upload your files** via web interface or Git
3. **Configure web app**: Set up WSGI configuration
4. **Get your backend URL**: `https://yourusername.pythonanywhere.com`

**Backend URL format**: `https://yourusername.pythonanywhere.com`

## Step 2: Configure Backend CORS

Once your backend is deployed, update CORS to allow your Vercel frontend:

### Method 1: Environment Variable (Recommended)

Set the `ALLOWED_ORIGINS` environment variable on your backend hosting platform:

```
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```

### Method 2: Update main.py

Edit `main.py` to include your Vercel domain:

```python
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://your-vercel-app.vercel.app").split(",")
```

## Step 3: Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional, can use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect React/Vite

3. **Set Environment Variable**:
   - In Vercel project settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com`
   - **Important**: Replace `your-backend-url.com` with your actual backend URL from Step 1
   - Make sure to add it for **Production**, **Preview**, and **Development** environments

4. **Redeploy**: After adding the environment variable, trigger a new deployment

## Step 4: Verify Deployment

1. **Check Backend**: Visit `https://your-backend-url.com/health` in browser
   - Should return: `{"status":"running","easyocr_available":true,...}`

2. **Check Frontend**: Visit your Vercel URL
   - Open browser console (F12)
   - Try uploading a receipt
   - Check Network tab to see if requests go to correct backend URL

3. **Check CORS**: If you see CORS errors, update backend CORS settings

## Finding Your Backend URL

### Railway
- Go to your project dashboard
- Click on your service
- The URL is shown at the top: `https://your-app.up.railway.app`

### Render
- Go to your dashboard
- Click on your web service
- The URL is shown: `https://your-app.onrender.com`

### Fly.io
- Run: `fly info` in terminal
- Or check dashboard: `https://your-app.fly.dev`

### Heroku
- Run: `heroku info` in terminal
- Or check dashboard: `https://your-app.herokuapp.com`

## Troubleshooting

### Backend URL Not Working
- Test the `/health` endpoint directly in browser
- Check backend logs for errors
- Verify EasyOCR is installed and initialized

### CORS Errors
- Ensure your Vercel domain is in `ALLOWED_ORIGINS`
- Check both `https://your-app.vercel.app` and your custom domain (if used)
- Restart backend after updating CORS

### Environment Variable Not Working
- Make sure variable name is exactly `VITE_API_URL`
- Redeploy Vercel after setting environment variable
- Check Vercel deployment logs

### First Request Slow (Render Free Tier)
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading to paid tier for production

## Quick Reference

**Backend URL Examples:**
- Railway: `https://receiptsense-api.up.railway.app`
- Render: `https://receiptsense-api.onrender.com`
- Fly.io: `https://receiptsense-api.fly.dev`
- Heroku: `https://receiptsense-api.herokuapp.com`

**Vercel Environment Variable:**
```
VITE_API_URL=https://your-backend-url.com
```

**Backend CORS Environment Variable:**
```
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```

