// ReceiptSense Application Configuration
// Update these values to change the title and description displayed on the page

export const appConfig = {
  // Application Title
  title: "ReceiptSense",

  // Application Description
  description: {
    intro: "This application is an intelligent Structured Expense Processor designed to automatically digitize and organize financial documents like receipts and invoices.",
    
    technology: "Instead of just grabbing the raw text from an image, it uses Optical Character Recognition (OCR) technology to extract key financial information and convert it into clean, machine-readable structured JSON data.",
    
    uiExplanation: "The user interface (UI) then takes that structured data and presents it professionally:",
    
    features: [
      "A high-level Summary Card shows the merchant name, transaction date, and the total amount.",
      "A critical, scrollable Data Table immediately follows, breaking down the transaction to the most granular level by listing every individual line item with its quantity, unit price, and total."
    ],
    
    closing: "Essentially, it turns a messy image into clear, organized data that is ready for expense reporting."
  }
}

