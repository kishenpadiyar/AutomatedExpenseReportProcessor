import { useState } from 'react'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [ocrResult, setOcrResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setOcrResult(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setOcrResult(null)
    }
  }

  const handleProcessReceipt = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError(null)
    setOcrResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/api/v1/ocr/process_receipt', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setOcrResult(data)
      } else {
        // Get error message from response
        let errorMessage = `API Error: Could not process receipt. (Status: ${response.status})`
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          }
        } catch (e) {
          // If response is not JSON, use default message
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(`Error: ${err.message}. Please ensure the backend server is running.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-8">
          Receipt OCR Processor
        </h1>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* File Upload Area */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-teal-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
            </div>
          </div>

          {/* Selected File Name */}
          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Selected:</span> {selectedFile.name}
              </p>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={handleProcessReceipt}
            disabled={!selectedFile || isLoading}
            className="mt-6 w-full bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Process Receipt'}
          </button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Processing your receipt...</p>
          </div>
        )}

        {/* Result Display Card */}
        {ocrResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Extraction Complete</h2>
            <div className="mb-4 p-4 bg-teal-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Processing Time</p>
              <p className="text-2xl font-bold text-teal-600">{ocrResult.processed_time_ms} ms</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Extracted Text:</p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap break-words">
                  {ocrResult.extracted_text || 'No text extracted'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

