# Fixing Render "Out of Memory" Error

## The Problem

EasyOCR requires **at least 1-2GB of RAM** to load its machine learning models. Render's free tier only provides **512MB**, which causes the deployment to fail with:

```
Ran out of memory (used over 512MB) while running your code.
```

## Solutions

### Solution 1: Upgrade Render Plan (Recommended for Render)

**Option A: Starter Plan ($7/month)**
- 512MB RAM (may still be tight, but might work)
- Better than free tier
- **Warning**: May still hit memory limits during model loading

**Option B: Standard Plan ($25/month) - RECOMMENDED**
- 2GB RAM (sufficient for EasyOCR)
- More reliable
- Better performance

**Steps:**
1. Go to your Render dashboard
2. Click on your service
3. Go to "Settings" → "Plan"
4. Upgrade to "Starter" or "Standard"
5. Redeploy your service

### Solution 2: Use Railway Instead (Better Free Tier)

Railway offers a better free tier and is more suitable for EasyOCR:

1. **Sign up**: [railway.app](https://railway.app)
2. **Create new project** from GitHub
3. **Deploy**: Railway auto-detects Python
4. **Free tier**: $5 credit/month (usually enough for small apps)
5. **Paid tier**: $5/month for 512MB, $20/month for 2GB

**Railway is recommended** because:
- Better free tier options
- More memory available
- Easier configuration
- Better for ML/AI workloads

### Solution 3: Optimize EasyOCR (Limited Impact)

While we can't reduce EasyOCR's memory requirements significantly, we can:

1. **Use only English language** (already done: `['en']`)
2. **Disable GPU** (already done: `gpu=False`)
3. **Lazy loading** (not recommended - slower performance)

The current code is already optimized. The issue is simply that EasyOCR needs more memory than Render's free tier provides.

## Quick Fix: Switch to Railway

If you want to avoid paying for Render, **Railway is the best alternative**:

1. **Create Railway account**: [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. **Select your repository**
4. **Railway auto-configures** everything
5. **Get your backend URL**: `https://your-app.up.railway.app`
6. **Set in Vercel**: `VITE_API_URL=https://your-app.up.railway.app`

Railway's free tier ($5 credit/month) is usually sufficient for development/testing.

## Configuration Files Created

I've created these files to help with Render deployment:

- **`render.yaml`**: Auto-configuration for Render (requires paid plan)
- **`Procfile`**: Process definition for Render
- **`runtime.txt`**: Python version specification

**Note**: These files won't fix the memory issue - you still need to upgrade your Render plan.

## Recommended Path Forward

1. **For free hosting**: Use **Railway** (better free tier)
2. **For Render**: Upgrade to **Standard Plan** ($25/month)
3. **For production**: Consider **Fly.io** or **Heroku** (more reliable)

## Testing After Fix

1. **Check backend health**: `https://your-backend-url.com/health`
2. **Should return**: `{"status":"running","easyocr_available":true,...}`
3. **Test OCR**: Upload a receipt through your Vercel frontend
4. **Check logs**: Monitor Render/Railway logs for any errors

## Memory Requirements Summary

| Platform | Free Tier | Starter | Standard | Recommendation |
|----------|-----------|---------|---------|----------------|
| **Render** | 512MB ❌ | 512MB ⚠️ | 2GB ✅ | Standard Plan |
| **Railway** | $5 credit ✅ | $5/512MB | $20/2GB | Free tier works |
| **Fly.io** | 256MB ❌ | 512MB ⚠️ | 2GB ✅ | Paid tier needed |
| **Heroku** | N/A | $7/512MB | $25/2GB | Paid tier needed |

**EasyOCR needs**: ~1-2GB RAM minimum

