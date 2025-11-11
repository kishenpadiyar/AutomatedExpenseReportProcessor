# Deploying Backend to Google Cloud Run

Google Cloud Run is an excellent choice for deploying your FastAPI backend with EasyOCR because:
- ✅ **Generous free tier**: 2 million requests/month, 360,000 GB-seconds, 180,000 vCPU-seconds
- ✅ **Configurable memory**: Can set up to 8GB RAM (EasyOCR needs ~2GB)
- ✅ **Auto-scaling**: Scales to zero when not in use (saves money)
- ✅ **Pay-per-use**: Only pay for what you use
- ✅ **Fast cold starts**: Usually under 10 seconds

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Billing Enabled**: Cloud Run requires billing to be enabled (but free tier covers most usage)
3. **Google Cloud SDK (gcloud)**: Install from [cloud.google.com/sdk](https://cloud.google.com/sdk)

## Step 1: Install Google Cloud SDK

### Windows
1. Download installer from [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
2. Run the installer
3. Restart your terminal

### Mac/Linux
```bash
# Mac
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

## Step 2: Authenticate

```bash
# Login to Google Cloud
gcloud auth login

# Set your project (replace with your project ID)
gcloud config set project YOUR_PROJECT_ID
```

**Don't have a project yet?** Create one:
```bash
# Create a new project
gcloud projects create receiptsense-backend --name="ReceiptSense Backend"

# Set it as current project
gcloud config set project receiptsense-backend

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
# Link a billing account to your project
```

## Step 3: Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API (for automated deployments)
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com
```

## Step 4: Build and Deploy

### Option A: Quick Deploy (Recommended)

```bash
# Navigate to your project directory
cd "C:\Users\kisha\Automated Expense Report Processor"

# Build and deploy in one command
gcloud run deploy receiptsense-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "ALLOWED_ORIGINS=https://your-vercel-app.vercel.app"
```

**What this does:**
- `--source .`: Builds from current directory (uses Dockerfile)
- `--region us-central1`: Deploys to US Central region
- `--memory 2Gi`: Allocates 2GB RAM (sufficient for EasyOCR)
- `--cpu 2`: Allocates 2 CPU cores
- `--timeout 300`: 5 minute timeout (for OCR processing)
- `--allow-unauthenticated`: Makes it publicly accessible
- `--set-env-vars`: Sets CORS origins

### Option B: Build Docker Image First

If you prefer to build the image separately:

```bash
# Build the Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/receiptsense-backend .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/receiptsense-backend

# Deploy to Cloud Run
gcloud run deploy receiptsense-backend \
  --image gcr.io/YOUR_PROJECT_ID/receiptsense-backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "ALLOWED_ORIGINS=https://your-vercel-app.vercel.app"
```

## Step 5: Get Your Backend URL

After deployment, Cloud Run will provide a URL:

```bash
# Get the service URL
gcloud run services describe receiptsense-backend --region us-central1 --format 'value(status.url)'
```

**Example output**: `https://receiptsense-backend-xxxxx-uc.a.run.app`

## Step 6: Configure CORS

Update the `ALLOWED_ORIGINS` environment variable with your Vercel frontend URL:

```bash
gcloud run services update receiptsense-backend \
  --region us-central1 \
  --update-env-vars "ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com"
```

Or set it during initial deployment (see Step 4).

## Step 7: Test Your Backend

1. **Health Check**: Visit `https://your-backend-url.run.app/health`
   - Should return: `{"status":"running","easyocr_available":true,...}`

2. **API Docs**: Visit `https://your-backend-url.run.app/docs`
   - Should show FastAPI Swagger UI

## Step 8: Configure Vercel

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.run.app` (from Step 5)
4. **Redeploy** your Vercel frontend

## Step 9: Monitor and Manage

### View Logs
```bash
gcloud run services logs read receiptsense-backend --region us-central1
```

### Update Service
```bash
# After making code changes, redeploy:
gcloud run deploy receiptsense-backend \
  --source . \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2
```

### View Service Details
```bash
gcloud run services describe receiptsense-backend --region us-central1
```

### Delete Service (if needed)
```bash
gcloud run services delete receiptsense-backend --region us-central1
```

## Configuration Options

### Memory Settings
- **Minimum**: 128Mi (won't work for EasyOCR)
- **Recommended**: 2Gi (sufficient for EasyOCR)
- **Maximum**: 8Gi (if needed for larger images)

### CPU Settings
- **Minimum**: 1 (may be slow)
- **Recommended**: 2 (good balance)
- **Maximum**: 8 (for faster processing)

### Timeout Settings
- **Default**: 300 seconds (5 minutes)
- **Maximum**: 3600 seconds (60 minutes)
- **Recommended**: 300 seconds (sufficient for OCR)

### Auto-scaling
- **Min instances**: 0 (scales to zero when idle - saves money)
- **Max instances**: 10 (adjust based on traffic)

## Cost Estimation

**Free Tier (Always Free):**
- 2 million requests/month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

**Beyond Free Tier:**
- **Memory**: ~$0.0000025 per GB-second
- **CPU**: ~$0.00002400 per vCPU-second
- **Requests**: $0.40 per million requests

**Example Monthly Cost** (beyond free tier):
- 10,000 requests: ~$0.004
- 2GB RAM, 2 CPU, 5 min average: ~$0.10 per request
- **Total for 10,000 requests**: ~$1.00/month

## Troubleshooting

### Build Fails
```bash
# Check Dockerfile syntax
docker build -t test-image .

# Test locally
docker run -p 8080:8080 test-image
```

### Out of Memory
```bash
# Increase memory allocation
gcloud run services update receiptsense-backend \
  --region us-central1 \
  --memory 4Gi
```

### CORS Errors
```bash
# Update ALLOWED_ORIGINS
gcloud run services update receiptsense-backend \
  --region us-central1 \
  --update-env-vars "ALLOWED_ORIGINS=https://your-frontend-url.com"
```

### Slow Cold Starts
- First request after idle period may take 10-30 seconds
- Consider setting `--min-instances 1` to keep one instance warm (costs more)

### Check Logs
```bash
# View recent logs
gcloud run services logs read receiptsense-backend --region us-central1 --limit 50

# Follow logs in real-time
gcloud run services logs tail receiptsense-backend --region us-central1
```

## Automated Deployments (Optional)

### Using Cloud Build

1. **Push code to GitHub** (make sure you're on the branch the trigger watches)
   ```bash
   git push origin master  # or main, depending on your branch
   ```

2. **Connect Cloud Build to GitHub**:
   - Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
   - Create trigger
   - Connect repository
   - **Important**: Set branch pattern to match your branch:
     - If using `master`: `^master$`
     - If using `main`: `^main$`
   - Use `cloudbuild.yaml` configuration

3. **Automatic deployments**: Every push to the configured branch will auto-deploy

**Troubleshooting**: If you get "no branch matching the configured branch pattern" error:
- Check your current branch: `git branch --show-current`
- Update the trigger's branch pattern to match (e.g., `^master$` instead of `^main$`)
- Or push to the branch the trigger is watching
- See [FIX_CLOUD_BUILD_TRIGGER.md](FIX_CLOUD_BUILD_TRIGGER.md) for detailed help

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - run: gcloud run deploy receiptsense-backend --source . --region us-central1
```

## Quick Reference

**Deploy Command:**
```bash
gcloud run deploy receiptsense-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars "ALLOWED_ORIGINS=https://your-vercel-app.vercel.app"
```

**Get URL:**
```bash
gcloud run services describe receiptsense-backend \
  --region us-central1 \
  --format 'value(status.url)'
```

**Update Environment Variables:**
```bash
gcloud run services update receiptsense-backend \
  --region us-central1 \
  --update-env-vars "ALLOWED_ORIGINS=https://your-frontend-url.com"
```

**View Logs:**
```bash
gcloud run services logs read receiptsense-backend --region us-central1
```

## Next Steps

1. ✅ Deploy backend to Cloud Run
2. ✅ Get backend URL
3. ✅ Set `VITE_API_URL` in Vercel
4. ✅ Test the connection
5. ✅ Monitor usage in Cloud Console

Your backend is now ready! 🚀

