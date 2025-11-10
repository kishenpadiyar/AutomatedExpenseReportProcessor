# How to Fix "OCR reader not initialized" Error

## Problem
The error "OCR reader not initialized" occurs because **EasyOCR is not installed** on your system.

## Solution: Install EasyOCR

### Step 1: Check Your Python Version
```bash
python --version
```

### Step 2: Try Installing EasyOCR

**If you have Python 3.10 or 3.11:**
```bash
pip install easyocr
```

**If you have Python 3.14 (current):**
EasyOCR may have compatibility issues. Try one of these:

#### Option A: Install EasyOCR (may fail)
```bash
pip install easyocr
```

If this fails with compilation errors, proceed to Option B.

#### Option B: Use Python 3.10 or 3.11 (Recommended)
1. Download Python 3.11 from https://www.python.org/downloads/
2. Install it (you can have multiple Python versions)
3. Use it specifically for this project:
   ```bash
   py -3.11 -m pip install -r requirements.txt
   py -3.11 -m uvicorn main:app --reload
   ```

#### Option C: Use a Virtual Environment with Python 3.11
```bash
# Create virtual environment with Python 3.11
py -3.11 -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn main:app --reload
```

### Step 3: Verify Installation
Run the diagnostic script:
```bash
python check_ocr_status.py
```

You should see:
```
OK EasyOCR is installed
OK EasyOCR reader initialized successfully!
```

### Step 4: Restart Backend Server
After installing EasyOCR, restart your backend server:
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Note:** On first run, EasyOCR initialization may take 1-2 minutes as it downloads models.

### Step 5: Check Health Endpoint
Visit: http://localhost:8000/health

You should see:
```json
{
  "status": "running",
  "easyocr_available": true,
  "ocr_reader_initialized": true,
  "message": "OCR reader initialized"
}
```

## Troubleshooting

### If EasyOCR Installation Fails on Windows:

1. **Install Visual C++ Build Tools:**
   - Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Install "Desktop development with C++" workload

2. **Try installing dependencies separately:**
   ```bash
   pip install torch torchvision
   pip install opencv-python
   pip install easyocr
   ```

3. **Use pre-built wheels if available:**
   ```bash
   pip install --only-binary :all: easyocr
   ```

### Alternative: Use Docker (Advanced)
If installation continues to fail, consider using Docker with a pre-configured Python 3.11 environment.

## After Installation

Once EasyOCR is installed and the backend restarted:
1. The health endpoint should show `ocr_reader_initialized: true`
2. The OCR feature in the frontend should work
3. You can upload receipt images and extract text

