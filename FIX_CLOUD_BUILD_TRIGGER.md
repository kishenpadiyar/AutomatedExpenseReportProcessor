# Fixing Cloud Build Trigger Branch Pattern Error

## The Problem

You're getting this error:
```
Failed: Cloud Build Trigger for this service was successfully created but no branch matching the configured branch pattern could be found.
```

This happens when:
- The Cloud Build trigger is configured to watch a specific branch (e.g., `main` or `master`)
- Your current branch doesn't match that pattern
- The branch hasn't been pushed to the remote repository yet

## Quick Fix Options

### Option 1: Push Your Current Branch (Recommended)

If you're working on a branch that should trigger deployments:

```bash
# Check your current branch
git branch --show-current

# Push your current branch to remote
git push origin YOUR_BRANCH_NAME

# If it's your first push, set upstream:
git push -u origin YOUR_BRANCH_NAME
```

### Option 2: Switch to the Branch the Trigger Watches

If the trigger is watching `main` or `master`:

```bash
# Switch to main branch
git checkout main

# Or if it's master:
git checkout master

# Make sure it's up to date
git pull origin main  # or master

# Push any changes
git push origin main  # or master
```

### Option 3: Update the Trigger Configuration

If you want to use a different branch:

1. **Go to Cloud Console**:
   - Navigate to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
   - Find your trigger
   - Click "Edit"

2. **Update Branch Pattern**:
   - Change the branch pattern to match your branch
   - Common patterns:
     - `^main$` - matches only `main` branch
     - `^master$` - matches only `master` branch
     - `.*` - matches all branches (not recommended for production)
     - `^(main|develop)$` - matches `main` or `develop`

3. **Save** the trigger

## Step-by-Step: Set Up Cloud Build Trigger Correctly

### Method 1: Using Cloud Console (Web UI)

1. **Go to Cloud Build Triggers**:
   - Visit: https://console.cloud.google.com/cloud-build/triggers
   - Select your project

2. **Create New Trigger** (or edit existing):
   - Click "Create Trigger" or edit existing trigger
   - **Name**: `receiptsense-backend-deploy`
   - **Event**: Push to a branch
   - **Source**: Connect your GitHub repository
   - **Branch**: 
     - If using `main`: `^main$`
     - If using `master`: `^master$`
     - Or use regex pattern

3. **Configuration**:
   - **Type**: Cloud Build configuration file (yaml)
   - **Location**: `cloudbuild.yaml`
   - **Substitution variables** (optional):
     - `_SERVICE_NAME`: `receiptsense-backend`
     - `_REGION`: `us-central1`

4. **Save** the trigger

### Method 2: Using gcloud CLI

```bash
# Create a trigger that watches the main branch
gcloud builds triggers create github \
  --name="receiptsense-backend-deploy" \
  --repo-name="YOUR_REPO_NAME" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --region="us-central1"
```

Replace:
- `YOUR_REPO_NAME`: Your GitHub repository name
- `YOUR_GITHUB_USERNAME`: Your GitHub username

### Method 3: Manual Deploy (Skip Trigger)

If you don't need automated deployments, you can deploy manually:

```bash
# Deploy directly without using triggers
gcloud run deploy receiptsense-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300
```

## Verify Your Setup

### Check Current Branch
```bash
git branch --show-current
```

### Check Remote Branches
```bash
git branch -r
```

### Check Trigger Configuration
```bash
# List all triggers
gcloud builds triggers list

# Get details of a specific trigger
gcloud builds triggers describe TRIGGER_NAME
```

### Test the Trigger
```bash
# Make a small change and push
echo "# Test" >> README.md
git add README.md
git commit -m "Test trigger"
git push origin main  # or your branch name
```

Then check Cloud Build logs:
```bash
gcloud builds list --limit=5
```

## Common Branch Patterns

| Pattern | Matches |
|---------|---------|
| `^main$` | Only `main` branch |
| `^master$` | Only `master` branch |
| `^main$|^develop$` | `main` or `develop` |
| `.*` | All branches (not recommended) |
| `^release/.*` | All branches starting with `release/` |

## Troubleshooting

### Trigger Not Firing After Push

1. **Check trigger is active**:
   ```bash
   gcloud builds triggers list
   ```

2. **Check branch name matches**:
   ```bash
   git branch --show-current
   # Compare with trigger's branch pattern
   ```

3. **Check Cloud Build logs**:
   ```bash
   gcloud builds list --limit=10
   ```

4. **Manually run trigger**:
   - Go to Cloud Console → Cloud Build → Triggers
   - Click "Run" on your trigger

### Repository Not Connected

If you see "repository not found":
1. Go to Cloud Console → Cloud Build → Repositories
2. Connect your GitHub repository
3. Grant necessary permissions

### Permission Errors

If you get permission errors:
```bash
# Grant Cloud Build service account permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
```

## Recommended Setup

For production, use this pattern:

1. **Development**: Deploy manually or use a `develop` branch trigger
2. **Production**: Use `main` branch trigger for automatic deployments
3. **Configuration**: 
   - Branch pattern: `^main$`
   - Build config: `cloudbuild.yaml`
   - Auto-deploy: Enabled

## Quick Reference

**Check current branch:**
```bash
git branch --show-current
```

**Push to trigger branch:**
```bash
git push origin main  # or master
```

**List triggers:**
```bash
gcloud builds triggers list
```

**Manual deploy (skip trigger):**
```bash
gcloud run deploy receiptsense-backend --source . --region us-central1
```

**View build history:**
```bash
gcloud builds list --limit=10
```

