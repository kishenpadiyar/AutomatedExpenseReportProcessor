# Automated Expense Report Processor

A full-stack application for processing receipt images using OCR (Optical Character Recognition).

## Project Structure

- **Backend**: FastAPI service with EasyOCR (`main.py`)
- **Frontend**: React SPA with Tailwind CSS (`App.jsx`)

## Prerequisites

- Python 3.10 or 3.11 (recommended - EasyOCR has compatibility issues with Python 3.14)
- Node.js 16+ and npm
- EasyOCR installed (see installation instructions below)

## Installation

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. **Important**: If EasyOCR installation fails (common with Python 3.14), you have two options:

   **Option A**: Use Python 3.10 or 3.11 (recommended)
   ```bash
   # Install Python 3.11, then:
   python3.11 -m pip install -r requirements.txt
   ```

   **Option B**: Try installing EasyOCR manually (may require C++ build tools on Windows):
   ```bash
   pip install easyocr
   ```

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

## Running the Application

### Start Backend Server

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at: http://localhost:8000

**Note**: On first run, EasyOCR initialization may take 1-2 minutes as it downloads models.

### Start Frontend Server

```bash
npm run dev
```

The frontend will be available at: http://localhost:5173

## Troubleshooting

### OCR Not Working / Keeps Loading

1. **Check if backend is running**: Visit http://localhost:8000 in your browser
2. **Check EasyOCR installation**: 
   ```bash
   python -c "import easyocr; print('EasyOCR installed')"
   ```
3. **Check backend logs**: Look for EasyOCR initialization messages
4. **CORS issues**: The code now includes CORS middleware - ensure backend is running

### EasyOCR Installation Issues

If you encounter compilation errors when installing EasyOCR:

1. **Use Python 3.10 or 3.11** (most reliable solution)
2. Install Visual C++ Build Tools (Windows)
3. Try installing pre-built wheels if available

## API Endpoints

- `POST /api/v1/ocr/process_receipt` - Process receipt image and extract text
  - Accepts: image file (multipart/form-data)
  - Returns: JSON with `status`, `extracted_text`, and `processed_time_ms`

## Technology Stack

- **Backend**: FastAPI, EasyOCR, Python
- **Frontend**: React, Tailwind CSS, Vite

