from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import easyocr
import time

# Global OCR reader instance (initialized at startup)
reader = None

# Initialize FastAPI application
app = FastAPI(
    title="Automated Expense Report Processor MVP"
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
    try:
        reader = easyocr.Reader(['en'], gpu=False)
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
    if reader is None:
        raise HTTPException(
            status_code=503,
            detail="OCR reader not initialized"
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


# uvicorn main:app --reload
