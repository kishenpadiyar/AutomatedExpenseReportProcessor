# Troubleshooting "Failed to fetch" Error

## Quick Diagnosis

### Step 1: Check if you're running locally or on a deployed website

**If running locally:**
- Make sure the backend server is running on `http://localhost:8000`
- Check the terminal where you started the backend
- The frontend should work automatically (defaults to localhost)

**If running on a deployed website:**
- You need to set the `VITE_API_URL` environment variable
- The backend must be deployed and accessible
- CORS must be configured correctly

## Common Issues and Solutions

### Issue 1: Environment Variable Not Set (Deployed Website)

**Symptom:** Error shows `http://localhost:8000` even though you're on a deployed site.

**Solution:**
1. Set the `VITE_API_URL` environment variable in your hosting platform:
   - **Netlify**: Site settings → Environment variables → Add `VITE_API_URL`
   - **Vercel**: Project settings → Environment Variables → Add `VITE_API_URL`
   - **GitHub Pages**: Use a `.env` file and rebuild (see below)
   - **Other platforms**: Check their documentation for environment variables

2. Rebuild/redeploy your frontend after setting the variable

3. Example values:
   ```
   VITE_API_URL=https://api.yourdomain.com
   VITE_API_URL=https://yourdomain.com/api
   ```

### Issue 2: Backend Not Running or Not Accessible

**Symptom:** Error message mentions the backend URL but connection fails.

**Solution:**
1. **Check backend is running:**
   ```bash
   # Test backend health endpoint
   curl http://localhost:8000/health
   # Or visit in browser: http://localhost:8000/health
   ```

2. **For deployed backend:**
   - Ensure the backend server is running
   - Check the backend URL is correct (no typos)
   - Verify the backend is publicly accessible (not behind a firewall)

3. **Test backend accessibility:**
   ```bash
   curl https://your-backend-url.com/health
   ```

### Issue 3: CORS Errors

**Symptom:** Browser console shows CORS policy errors.

**Solution:**
1. Update `main.py` to include your frontend domain:
   ```python
   ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://your-frontend-domain.com").split(",")
   ```

2. Or set the `ALLOWED_ORIGINS` environment variable when running the backend:
   ```bash
   export ALLOWED_ORIGINS="http://localhost:5173,https://your-frontend-domain.com"
   python -m uvicorn main:app --reload
   ```

3. Restart the backend after making changes

### Issue 4: Wrong API URL Format

**Symptom:** Error shows an incorrect or malformed URL.

**Solution:**
- Ensure `VITE_API_URL` does NOT include the endpoint path
- Correct: `https://api.yourdomain.com`
- Incorrect: `https://api.yourdomain.com/api/v1/ocr/extract_structured`

The endpoint path (`/api/v1/ocr/extract_structured`) is added automatically by the code.

### Issue 5: Environment Variable Not Loading (Vite)

**Symptom:** Environment variable is set but not being used.

**Solution:**
1. **For Vite projects:**
   - Environment variables must start with `VITE_` to be exposed to the client
   - The variable is `VITE_API_URL` (already correct)

2. **After setting environment variable:**
   - Stop the dev server
   - Restart: `npm run dev`
   - Or rebuild: `npm run build`

3. **Check if variable is loaded:**
   - Open browser console (F12)
   - Look for debug logs showing the API URL
   - Or check: `console.log(import.meta.env.VITE_API_URL)`

## Testing Steps

### For Local Development:
1. Start backend: `python -m uvicorn main:app --reload`
2. Start frontend: `npm run dev`
3. Open browser console (F12) and check for API URL logs
4. Try uploading a receipt

### For Deployed Website:
1. Set `VITE_API_URL` in your hosting platform
2. Rebuild/redeploy frontend
3. Open browser console (F12) → Network tab
4. Try uploading a receipt
5. Check the Network tab to see:
   - What URL is being called
   - What error code is returned
   - Any CORS errors

## Debug Information

The updated code now provides better error messages. Check:
1. **Browser Console (F12)**: Look for error messages and API URL logs
2. **Network Tab**: See the exact request being made and response received
3. **Error Message**: The UI now shows more detailed error information

## Still Having Issues?

1. Check browser console for detailed error messages
2. Verify backend is accessible by visiting the health endpoint directly
3. Ensure environment variables are set correctly in your hosting platform
4. Check that CORS is configured to allow your frontend domain
5. Verify the backend URL is correct (no typos, correct protocol http/https)

