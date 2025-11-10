from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

# Try to import EasyOCR
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    easyocr = None
    print("WARNING: EasyOCR is not installed. OCR functionality will not work.")
    print("Please install EasyOCR using: pip install easyocr")

# Global OCR reader instance (initialized at startup)
reader = None

# Initialize FastAPI application
app = FastAPI(
    title="Automated Expense Report Processor MVP"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for OCR response
class OCRResponse(BaseModel):
    status: str
    extracted_text: str
    processed_time_ms: float


@app.on_event("startup")
async def startup_event():
    """Initialize the EasyOCR reader once at application startup."""
    global reader
    if not EASYOCR_AVAILABLE:
        print("ERROR: EasyOCR is not installed. Please install it to use OCR functionality.")
        reader = None
        return
    
    try:
        print("Initializing EasyOCR reader (this may take a minute on first run)...")
        reader = easyocr.Reader(['en'], gpu=False)
        print("EasyOCR reader initialized successfully!")
    except Exception as e:
        print(f"ERROR: Failed to initialize EasyOCR reader: {e}")
        reader = None


@app.post("/api/v1/ocr/process_receipt", response_model=OCRResponse)
async def process_receipt(file: UploadFile = File(...)):
    """
    Process a receipt image and extract text using OCR.
    
    Args:
        file: Uploaded image file
    
    Returns:
        OCRResponse with extracted text and processing time
    """
    # Check if reader is initialized
    if not EASYOCR_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="EasyOCR is not installed. Please install it using: pip install easyocr"
        )
    
    if reader is None:
        raise HTTPException(
            status_code=503,
            detail="OCR reader not initialized. Please check server logs. EasyOCR may still be loading or failed to initialize."
        )
    
    # Record start time
    start_time = time.perf_counter()
    
    try:
        # Read the uploaded image file content
        image_bytes = await file.read()
        
        # Perform OCR
        ocr_results = reader.readtext(image_bytes, detail=0)
        
        # Join all text results with newlines
        extracted_text = "\n".join(ocr_results)
        
        # Calculate processing time in milliseconds
        end_time = time.perf_counter()
        processed_time_ms = (end_time - start_time) * 1000
        
        # Return OCRResponse
        return OCRResponse(
            status="success",
            extracted_text=extracted_text,
            processed_time_ms=round(processed_time_ms, 2)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint to verify server and OCR status."""
    return {
        "status": "running",
        "easyocr_available": EASYOCR_AVAILABLE,
        "ocr_reader_initialized": reader is not None,
        "message": "OCR reader initialized" if reader is not None else ("EasyOCR not installed" if not EASYOCR_AVAILABLE else "OCR reader not initialized")
    }


# uvicorn main:app --reload
