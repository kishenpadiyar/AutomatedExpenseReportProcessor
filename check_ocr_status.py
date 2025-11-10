#!/usr/bin/env python3
"""Quick script to check EasyOCR installation and status."""

print("Checking EasyOCR installation...")
print("-" * 50)

try:
    import easyocr
    print("OK EasyOCR is installed")
    
    print("\nAttempting to initialize EasyOCR reader...")
    print("(This may take 1-2 minutes on first run)")
    reader = easyocr.Reader(['en'], gpu=False)
    print("OK EasyOCR reader initialized successfully!")
    print("\nOCR is ready to use!")
    
except ImportError:
    print("X EasyOCR is NOT installed")
    print("\nTo install EasyOCR, run:")
    print("  pip install easyocr")
    print("\nNote: If installation fails (common with Python 3.14),")
    print("consider using Python 3.10 or 3.11 instead.")
    
except Exception as e:
    print(f"X Failed to initialize EasyOCR: {e}")
    print("\nPossible solutions:")
    print("1. Reinstall EasyOCR: pip install --upgrade easyocr")
    print("2. Use Python 3.10 or 3.11 instead of Python 3.14")
    print("3. Check if you have required system dependencies")

