# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for EasyOCR
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Expose port (Cloud Run uses PORT environment variable)
ENV PORT=8080
EXPOSE 8080

# Run the application
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1

