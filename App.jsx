import { useState } from 'react'
import { appConfig } from './src/config'

function App() {
  const [currentPage, setCurrentPage] = useState('landing') // 'landing', 'ocr', or 'contact'
  const [darkMode, setDarkMode] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [structuredResult, setStructuredResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showRawText, setShowRawText] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setStructuredResult(null)
      setShowRawText(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setStructuredResult(null)
      setShowRawText(false)
    }
  }

  const handleExtractData = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError(null)
    setStructuredResult(null)
    setShowRawText(false)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/api/v1/ocr/extract_structured', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setStructuredResult(data)
      } else {
        let errorMessage = `API Error: Could not extract data. (Status: ${response.status})`
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          }
        } catch (e) {
          // If response is not JSON, use default message
          if (response.status === 404) {
            errorMessage = `Endpoint not found (404). Please ensure the backend is running with the latest code.`
          }
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(`Error: ${err.message}. Please ensure the backend server is running.`)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  const capitalizeFirst = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const downloadJSON = () => {
    if (!structuredResult) return

    // Create a JSON string with proper formatting
    const jsonString = JSON.stringify(structuredResult, null, 2)
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob)
    
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a')
    link.href = url
    
    // Generate filename with merchant name and date if available
    const merchant = structuredResult.merchant_name?.replace(/[^a-z0-9]/gi, '_') || 'receipt'
    const date = structuredResult.transaction_date?.replace(/[^a-z0-9]/gi, '_') || new Date().toISOString().split('T')[0]
    link.download = `${merchant}_${date}.json`
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Navigation Menu Component
  const NavigationMenu = () => (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`fixed top-4 left-6 sm:left-8 z-50 p-3 rounded-lg transition-all duration-200 shadow-lg ${
          darkMode 
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Menu Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
        <div className="p-6">
          <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Navigation
          </h3>
          <nav className="space-y-2">
            <button
              onClick={() => {
                setCurrentPage('landing')
                setMenuOpen(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPage === 'landing'
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentPage('ocr')
                setMenuOpen(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPage === 'ocr'
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              OCR Processor
            </button>
            <button
              onClick={() => {
                setCurrentPage('contact')
                setMenuOpen(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPage === 'contact'
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Contact
            </button>
          </nav>
        </div>
      </div>
    </>
  )

  // Footer Component
  const Footer = () => (
    <footer className={`mt-12 pt-8 pb-6 border-t transition-colors duration-200 ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
        <a
          href="/ReceiptSense Terms of Service.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm transition-colors duration-200 hover:underline ${
            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Terms of Service
        </a>
        <span className={`hidden sm:inline ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>|</span>
        <a
          href="/ReceiptSense Privacy Policy.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm transition-colors duration-200 hover:underline ${
            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Privacy Policy
        </a>
        <span className={`hidden sm:inline ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>|</span>
        <p className={`text-sm transition-colors duration-200 ${
          darkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          © {new Date().getFullYear()} ReceiptSense. All rights reserved.
        </p>
      </div>
    </footer>
  )

  // Landing Page Component
  const LandingPage = () => (
    <div className={`min-h-screen transition-all duration-200 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100'
    } py-12 px-4 sm:px-6 lg:px-8`}>
      <NavigationMenu />
      <div className="max-w-4xl mx-auto">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-md`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Header */}
        <div className={`text-center mb-12 pb-8 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className={`text-5xl sm:text-6xl font-light mb-4 tracking-tight transition-colors duration-200 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {appConfig.title}
          </h1>
          <div className={`w-24 h-1 mx-auto mb-8 transition-colors duration-200 ${
            darkMode ? 'bg-blue-500' : 'bg-blue-600'
          }`}></div>
        </div>
          
        <div className={`rounded-lg shadow-md p-8 sm:p-10 mb-8 transition-all duration-200 ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-800/90' 
            : 'bg-gradient-to-br from-white to-gray-50/50'
        }`}>
          <div className={`max-w-3xl mx-auto space-y-6 transition-colors duration-200 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
              <p className={`text-lg sm:text-xl leading-relaxed font-light transition-colors duration-200 ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {appConfig.description.intro}
              </p>
              
              <p className={`text-base sm:text-lg leading-relaxed transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {appConfig.description.technology}
              </p>
              
              <p className={`text-base sm:text-lg leading-relaxed font-medium mt-6 transition-colors duration-200 ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {appConfig.description.uiExplanation}
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-8">
                {appConfig.description.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        darkMode ? 'bg-blue-900' : 'bg-blue-50'
                      }`}>
                        <svg className={`w-6 h-6 transition-colors duration-200 ${
                          darkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <p className={`text-sm sm:text-base leading-relaxed pt-1 transition-colors duration-200 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{feature}</p>
                  </div>
                ))}
              </div>
              
              <div className={`mt-8 pt-6 border-t transition-colors duration-200 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-base sm:text-lg leading-relaxed italic transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {appConfig.description.closing}
                </p>
              </div>
            </div>
          </div>
          
          {/* Try Now Button */}
          <div className="mt-8">
            <button
              onClick={() => setCurrentPage('ocr')}
              className={`group inline-flex items-center px-8 py-3 text-white text-base font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-200 uppercase tracking-wide ${
                darkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span className="mr-2">Get Started</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
      </div>
      <Footer />
    </div>
  )

  // OCR Page Component
  const OCRPage = () => (
    <div className={`min-h-screen transition-all duration-200 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100'
    } py-8 px-4 sm:px-6 lg:px-8`}>
      <NavigationMenu />
      <div className="max-w-5xl mx-auto">
        {/* Header with Theme Toggle and Home Button */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className={`pb-6 border-b-2 transition-colors duration-200 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-3xl sm:text-4xl font-light mb-2 transition-colors duration-200 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {appConfig.title}
              </h2>
              <div className={`w-16 h-0.5 transition-colors duration-200 ${
                darkMode ? 'bg-blue-500' : 'bg-blue-600'
              }`}></div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage('landing')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } shadow-md`}
              aria-label="Go to home"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } shadow-md`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`mb-6 p-4 border-l-4 border-red-500 rounded shadow-sm transition-colors duration-200 ${
            darkMode ? 'bg-red-900/30' : 'bg-red-50'
          }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`text-sm font-medium transition-colors duration-200 ${
                darkMode ? 'text-red-300' : 'text-red-800'
              }`}>{error}</p>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        <div className={`rounded-lg shadow-md p-6 sm:p-8 mb-6 transition-all duration-200 ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-800/90' 
            : 'bg-gradient-to-br from-white to-gray-50/50'
        }`}>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? darkMode
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-blue-500 bg-blue-50'
                : darkMode
                  ? 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16">
                <svg
                  className={`h-full w-full transition-colors ${
                    isDragging ? 'text-blue-500' : 'text-gray-400'
                  }`}
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
              </div>
              <div>
                <p className={`text-base font-medium mb-1 transition-colors duration-200 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>Click to upload</span> or drag and drop
                </p>
                <p className={`text-sm transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>PNG, JPG, JPEG up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Selected File Name */}
          {selectedFile && (
            <div className={`mt-6 p-4 border rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'bg-blue-900/30 border-blue-700' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-3 transition-colors duration-200 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className={`text-sm font-medium transition-colors duration-200 ${
                  darkMode ? 'text-blue-200' : 'text-blue-900'
                }`}>
                  <span className="font-semibold">Selected:</span> {selectedFile.name}
                </p>
              </div>
            </div>
          )}

          {/* Extract Data Button */}
          <button
            onClick={handleExtractData}
            disabled={!selectedFile || isLoading}
            className={`mt-6 w-full text-white font-medium py-3 px-6 rounded-md shadow-md hover:shadow-lg disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wide text-sm ${
              darkMode
                ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Extract Data'
            )}
          </button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className={`rounded-lg shadow-md p-12 text-center transition-all duration-200 ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-800/90' 
              : 'bg-gradient-to-br from-white to-gray-50/50'
          }`}>
            <div className="inline-block">
              <div className={`animate-spin rounded-full h-12 w-12 border-4 transition-colors duration-200 ${
                darkMode 
                  ? 'border-gray-700 border-t-blue-500' 
                  : 'border-gray-200 border-t-blue-600'
              }`}></div>
            </div>
            <p className={`mt-6 text-base font-medium transition-colors duration-200 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Processing and Structuring Data...
            </p>
            <p className={`mt-2 text-sm transition-colors duration-200 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>This may take a few moments</p>
          </div>
        )}

        {/* Structured Result Display */}
        {structuredResult && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className={`rounded-lg shadow-md p-6 sm:p-8 transition-all duration-200 ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-800/90' 
                : 'bg-gradient-to-br from-white to-gray-50/50'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex-1">
                  <h2 className={`text-3xl sm:text-4xl font-light mb-2 transition-colors duration-200 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {structuredResult.merchant_name || 'Unknown Merchant'}
                  </h2>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-blue-900 text-blue-300' 
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {capitalizeFirst(structuredResult.document_type || 'Document')}
                  </span>
                </div>
                <button
                  onClick={downloadJSON}
                  className={`mt-4 sm:mt-0 inline-flex items-center px-4 py-2 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-200 ${
                    darkMode 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download JSON
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className={`rounded-lg p-6 border transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-blue-900/30 border-blue-700' 
                    : 'bg-blue-50 border-blue-100'
                }`}>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-2 transition-colors duration-200 ${
                    darkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}>Total Amount</p>
                  <p className={`text-3xl sm:text-4xl font-light transition-colors duration-200 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(structuredResult.total_amount, structuredResult.currency)}
                  </p>
                  {structuredResult.currency && structuredResult.currency !== 'USD' && (
                    <p className={`text-sm mt-2 transition-colors duration-200 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{structuredResult.currency}</p>
                  )}
                </div>
                <div className={`rounded-lg p-6 border transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-2 transition-colors duration-200 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Transaction Date</p>
                  <p className={`text-2xl sm:text-3xl font-light transition-colors duration-200 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatDate(structuredResult.transaction_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            {structuredResult.line_items && structuredResult.line_items.length > 0 && (
              <div className={`rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-800/90' 
                  : 'bg-gradient-to-br from-white to-gray-50/50'
              }`}>
                <div className={`px-6 py-4 border-b transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`text-lg font-medium flex items-center transition-colors duration-200 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <svg className={`w-5 h-5 mr-2 transition-colors duration-200 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Line Items
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className={`sticky top-0 transition-colors duration-200 ${
                      darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <tr>
                        <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider border-b transition-colors duration-200 ${
                          darkMode 
                            ? 'text-gray-300 border-gray-600' 
                            : 'text-gray-700 border-gray-200'
                        }`}>
                          #
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b transition-colors duration-200 ${
                          darkMode 
                            ? 'text-gray-300 border-gray-600' 
                            : 'text-gray-700 border-gray-200'
                        }`}>
                          Item Description
                        </th>
                        <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider border-b transition-colors duration-200 ${
                          darkMode 
                            ? 'text-gray-300 border-gray-600' 
                            : 'text-gray-700 border-gray-200'
                        }`}>
                          Qty
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider border-b transition-colors duration-200 ${
                          darkMode 
                            ? 'text-gray-300 border-gray-600' 
                            : 'text-gray-700 border-gray-200'
                        }`}>
                          Unit Price
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider border-b transition-colors duration-200 ${
                          darkMode 
                            ? 'text-gray-300 border-gray-600' 
                            : 'text-gray-700 border-gray-200'
                        }`}>
                          Line Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors duration-200 ${
                      darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                    }`}>
                      {structuredResult.line_items.map((item, index) => {
                        const lineTotal = item.line_total !== undefined 
                          ? item.line_total 
                          : (item.quantity || 1) * (item.price || 0)
                        return (
                          <tr key={index} className={`transition-colors ${
                            darkMode
                              ? index % 2 === 0 
                                ? 'bg-gray-800 hover:bg-gray-700/50' 
                                : 'bg-gray-800/50 hover:bg-gray-700/50'
                              : index % 2 === 0 
                                ? 'bg-white hover:bg-gray-50' 
                                : 'bg-gray-50 hover:bg-gray-50'
                          }`}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-center transition-colors duration-200 ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {index + 1}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.name || 'N/A'}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-center transition-colors duration-200 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {item.quantity || 1}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right transition-colors duration-200 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {formatCurrency(item.price, structuredResult.currency)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right transition-colors duration-200 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatCurrency(lineTotal, structuredResult.currency)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw Text Debug Area */}
            {structuredResult.raw_ocr_text && (
              <div className={`rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-800/90' 
                  : 'bg-gradient-to-br from-white to-gray-50/50'
              }`}>
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className={`w-full px-6 py-4 flex items-center justify-between transition-colors border-b ${
                    darkMode
                      ? 'bg-gray-700/50 hover:bg-gray-700 border-gray-600'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className={`w-5 h-5 mr-2 transition-colors duration-200 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className={`text-base font-medium transition-colors duration-200 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>Raw OCR Text</h3>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-all duration-200 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    } ${showRawText ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showRawText && (
                  <div className={`border-t transition-colors duration-200 ${
                    darkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className={`p-6 max-h-96 overflow-y-auto transition-colors duration-200 ${
                      darkMode ? 'bg-gray-900' : 'bg-gray-50'
                    }`}>
                      <pre className={`text-xs sm:text-sm font-mono whitespace-pre-wrap break-words transition-colors duration-200 ${
                        darkMode ? 'text-gray-300' : 'text-gray-800'
                      }`}>
                        {structuredResult.raw_ocr_text}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
      
      {/* Floating Home Icon */}
      <button
        onClick={() => setCurrentPage('landing')}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
          darkMode 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        aria-label="Go to home"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </div>
  )

  // Contact Page Component
  const ContactPage = () => (
    <div className={`min-h-screen transition-all duration-200 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100'
    } py-12 px-4 sm:px-6 lg:px-8`}>
      <NavigationMenu />
      <div className="max-w-4xl mx-auto">
        {/* Home Button and Theme Toggle */}
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={() => setCurrentPage('landing')}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-md`}
            aria-label="Go to home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-md`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Header */}
        <div className={`text-center mb-12 pb-8 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className={`text-5xl sm:text-6xl font-light mb-4 tracking-tight transition-colors duration-200 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Contact Me
          </h1>
          <div className={`w-24 h-1 mx-auto mb-8 transition-colors duration-200 ${
            darkMode ? 'bg-blue-500' : 'bg-blue-600'
          }`}></div>
        </div>

        {/* Contact Card */}
        <div className={`rounded-lg shadow-md p-8 sm:p-10 mb-8 transition-all duration-200 ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-800/90' 
            : 'bg-gradient-to-br from-white to-gray-50/50'
        }`}>
          <div className="max-w-2xl mx-auto">
            <p className={`text-lg sm:text-xl leading-relaxed text-center mb-12 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Get in touch with me:
            </p>

            <div className="flex justify-center items-center gap-8 sm:gap-12">
              {/* Email */}
              <a
                href="mailto:kishen.padiyar@gmail.com"
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-lg transform hover:scale-110 ${
                  darkMode
                    ? 'bg-blue-900 hover:bg-blue-800'
                    : 'bg-blue-100 hover:bg-blue-200'
                }`}
                aria-label="Send email"
              >
                <svg className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-200 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/kishenpadiyar"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-lg transform hover:scale-110 ${
                  darkMode
                    ? 'bg-blue-900 hover:bg-blue-800'
                    : 'bg-blue-100 hover:bg-blue-200'
                }`}
                aria-label="Visit LinkedIn profile"
              >
                <svg className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-200 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/kishenpadiyar"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-lg transform hover:scale-110 ${
                  darkMode
                    ? 'bg-blue-900 hover:bg-blue-800'
                    : 'bg-blue-100 hover:bg-blue-200'
                }`}
                aria-label="Visit GitHub profile"
              >
                <svg className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-200 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.005.07 1.534 1.032 1.534 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Credits Section */}
        <div className={`rounded-lg shadow-md p-6 sm:p-8 transition-all duration-200 ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-800/90' 
            : 'bg-gradient-to-br from-white to-gray-50/50'
        }`}>
          <div className="text-center">
            <p className={`text-sm mb-4 transition-colors duration-200 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Powered by
            </p>
            <a
              href="https://github.com/JaidedAI/EasyOCR"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                darkMode
                  ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <svg className={`w-5 h-5 transition-colors duration-200 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`} fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.005.07 1.534 1.032 1.534 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className={`font-medium transition-colors duration-200 ${
                darkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                EasyOCR
              </span>
              <svg className={`w-4 h-4 transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Floating Home Icon */}
      <button
        onClick={() => setCurrentPage('landing')}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
          darkMode 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        aria-label="Go to home"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </div>
  )

  // Main render - conditionally show landing, OCR, or contact page
  if (currentPage === 'landing') return <LandingPage />
  if (currentPage === 'ocr') return <OCRPage />
  if (currentPage === 'contact') return <ContactPage />
  return <LandingPage />
}

export default App
