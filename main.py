from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import re
import os
from datetime import datetime

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
# For production, add your frontend domain to allow_origins
# Example: allow_origins=["http://localhost:5173", "https://yourdomain.com"]
# Note: Using "*" with allow_credentials=True is not allowed, so specify origins explicitly
# Set ALLOWED_ORIGINS environment variable to add production domains (comma-separated)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for OCR response
class OCRResponse(BaseModel):
    status: str
    extracted_text: str
    processed_time_ms: float

# Pydantic model for structured extraction response
class LineItem(BaseModel):
    name: str
    quantity: float
    price: float
    line_total: float

class StructuredExtractionResponse(BaseModel):
    document_type: str
    merchant_name: str
    transaction_date: str
    total_amount: float
    currency: str
    line_items: list[LineItem]
    raw_ocr_text: str


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


@app.post("/api/v1/ocr/extract_structured", response_model=StructuredExtractionResponse)
async def extract_structured(file: UploadFile = File(...)):
    """
    Extract structured data from a receipt image using OCR.
    
    Args:
        file: Uploaded image file
    
    Returns:
        StructuredExtractionResponse with parsed receipt data
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
        raw_ocr_text = "\n".join(ocr_results)
        
        # Basic parsing of OCR text (this is a simplified version)
        # In a production system, you would use NLP or ML models for better extraction
        lines = raw_ocr_text.split('\n')
        
        # Try to extract basic information (simplified parsing)
        merchant_name = "Unknown Merchant"
        transaction_date = ""
        total_amount = 0.0
        currency = "USD"
        line_items = []
        
        # Simple heuristics for extraction (can be improved with better parsing)
        for i, line in enumerate(lines):
            line_upper = line.upper().strip()
            
            # Try to find merchant name (usually in first few lines)
            if i < 3 and len(line) > 3 and merchant_name == "Unknown Merchant":
                merchant_name = line.strip()
            
            # Try to find date patterns
            if not transaction_date:
                # Look for date-like patterns
                date_patterns = [
                    r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',
                    r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',
                ]
                for pattern in date_patterns:
                    match = re.search(pattern, line)
                    if match:
                        transaction_date = match.group()
                        break
            
            # Try to find total amount (look for currency symbols and numbers)
            if not total_amount:
                # Look for patterns like $XX.XX or XX.XX USD
                total_match = re.search(r'[\$]?\s*(\d+\.\d{2})', line_upper)
                if total_match:
                    try:
                        total_amount = float(total_match.group(1))
                        # Check for currency
                        if 'USD' in line_upper or '$' in line:
                            currency = "USD"
                        elif 'EUR' in line_upper or '€' in line:
                            currency = "EUR"
                        elif 'GBP' in line_upper or '£' in line:
                            currency = "GBP"
                    except:
                        pass
            
            # Try to extract line items (simplified - looks for price patterns)
            if i > 2 and i < len(lines) - 3:  # Skip header and footer
                item_match = re.search(r'(\d+\.\d{2})', line)
                if item_match:
                    try:
                        price = float(item_match.group(1))
                        # Extract item name (everything before the price)
                        item_name = re.sub(r'[\$]?\s*\d+\.\d{2}.*$', '', line).strip()
                        if item_name and price > 0:
                            quantity = 1.0
                            line_total = quantity * price
                            line_items.append(LineItem(
                                name=item_name or f"Item {len(line_items) + 1}",
                                quantity=quantity,
                                price=price,
                                line_total=line_total
                            ))
                    except:
                        pass
        
        # If no line items found, create a placeholder
        if not line_items and raw_ocr_text:
            line_items.append(LineItem(
                name="Extracted Text (Parsing Needed)",
                quantity=1.0,
                price=0.0,
                line_total=0.0
            ))
        
        # If no date found, use current date or empty
        if not transaction_date:
            transaction_date = datetime.now().strftime("%Y-%m-%d")
        
        # Determine document type
        document_type = "receipt"
        if "invoice" in raw_ocr_text.lower():
            document_type = "invoice"
        elif "bill" in raw_ocr_text.lower():
            document_type = "bill"
        
        # Calculate processing time
        end_time = time.perf_counter()
        processed_time_ms = (end_time - start_time) * 1000
        
        # Return structured response
        return StructuredExtractionResponse(
            document_type=document_type,
            merchant_name=merchant_name,
            transaction_date=transaction_date,
            total_amount=total_amount,
            currency=currency,
            line_items=line_items,
            raw_ocr_text=raw_ocr_text
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


# uvicorn main:app --reload
