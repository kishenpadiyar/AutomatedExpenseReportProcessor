# Deployment Guide

## Backend API URL Configuration

When deploying the application to a website, you need to configure the backend API URL.

### Option 1: Environment Variable (Recommended)

1. Create a `.env` file in the root directory of your project
2. Add the following line:
   ```
   VITE_API_URL=https://your-backend-domain.com
   ```
   Replace `https://your-backend-domain.com` with your actual backend server URL

3. Rebuild the frontend:
   ```bash
   npm run build
   ```

### Option 2: Update CORS Settings

Update the CORS settings in `main.py` to allow requests from your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://your-frontend-domain.com"  # Add your production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Example Deployment Scenarios

#### Scenario 1: Same Domain
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/api`
- Set `VITE_API_URL=https://yourdomain.com`

#### Scenario 2: Different Domains
- Frontend: `https://app.yourdomain.com`
- Backend: `https://api.yourdomain.com`
- Set `VITE_API_URL=https://api.yourdomain.com`
- Update CORS in `main.py` to include `https://app.yourdomain.com`

#### Scenario 3: Subdirectory
- Frontend: `https://yourdomain.com/app`
- Backend: `https://yourdomain.com/api`
- Set `VITE_API_URL=https://yourdomain.com`

### Testing

After deployment, test the API connection:
1. Open browser developer tools (F12)
2. Go to the Network tab
3. Try uploading a receipt
4. Check if the request goes to the correct backend URL
5. Verify there are no CORS errors

### Troubleshooting

**Error: "Failed to fetch"**
- Check that the backend server is running and accessible
- Verify the `VITE_API_URL` environment variable is set correctly
- Check browser console for CORS errors
- Ensure the backend CORS settings include your frontend domain

**Error: "CORS policy"**
- Update `main.py` CORS `allow_origins` to include your frontend domain
- Restart the backend server after making changes

