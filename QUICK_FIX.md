# Quick Fix for "OCR reader not initialized"

## The Problem
EasyOCR is **not installed**, so the OCR reader cannot be initialized.

## Quick Solution

### 1. Install EasyOCR
Open a terminal and run:
```bash
pip install easyocr
```

**If that fails** (common with Python 3.14), you need Python 3.10 or 3.11:
```bash
# Download Python 3.11 from python.org, then:
py -3.11 -m pip install -r requirements.txt
```

### 2. Restart the Backend Server

**Stop the current backend** (Ctrl+C in the terminal where it's running), then:

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Wait for the message: `"EasyOCR reader initialized successfully!"`

### 3. Test It

1. Check health: http://localhost:8000/health
   - Should show: `"ocr_reader_initialized": true`

2. Try OCR in frontend: http://localhost:5173
   - Upload a receipt image
   - Click "Process Receipt"
   - Should work now!

## Why This Happens

- EasyOCR is a large package with dependencies
- Python 3.14 is very new and some packages don't support it yet
- The backend needs EasyOCR to initialize the OCR reader

## Still Having Issues?

Run the diagnostic:
```bash
python check_ocr_status.py
```

This will tell you exactly what's wrong.

