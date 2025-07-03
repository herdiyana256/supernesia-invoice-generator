"use client"

export const generatePDF = async (elementId: string, filename: string) => {
  try {
    // Show loading notification
    showNotification("Generating PDF...", "loading")

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error("Invoice preview not found. Please show preview first.")
    }

    // Wait a bit to ensure element is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Dynamic import html2pdf
    const html2pdf = (await import("html2pdf.js")).default

    // Configure PDF options for better quality and auto download
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: filename,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        letterRendering: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
      },
    }

    // Generate PDF and force download
    const pdf = html2pdf().set(opt).from(element)

    // Use save() method to force download
    await pdf.save()

    // Show success notification
    hideNotification()
    showNotification("PDF berhasil didownload!", "success")

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    hideNotification()
    showNotification("Gagal generate PDF. Pastikan preview sudah ditampilkan dan coba lagi.", "error")
    return false
  }
}

export const printInvoice = () => {
  try {
    showNotification("Preparing for print...", "loading")

    // Create print-specific styles
    const printCSS = `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        body * {
          visibility: hidden;
        }
        
        #invoice-preview, #invoice-preview * {
          visibility: visible;
        }
        
        #invoice-preview {
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          background: white !important;
          color: black !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 15px !important;
          box-shadow: none !important;
          border: none !important;
        }
        
        .bg-\\[\\#e9e15b\\]\\/10,
        .bg-\\[\\#e9e15b\\]\\/20,
        .bg-\\[\\#e9e15b\\] {
          background-color: #f9f7e6 !important;
        }
        
        .text-\\[\\#2b2b2b\\] {
          color: #2b2b2b !important;
        }
        
        .border-\\[\\#e9e15b\\] {
          border-color: #e9e15b !important;
        }
        
        table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        
        table, th, td {
          border: 1px solid #333 !important;
        }
        
        th, td {
          padding: 6px !important;
          font-size: 11px !important;
        }
        
        .no-print {
          display: none !important;
        }
      }
    `

    // Add print styles to document
    const styleElement = document.createElement("style")
    styleElement.textContent = printCSS
    document.head.appendChild(styleElement)

    setTimeout(() => {
      hideNotification()
      window.print()

      // Remove print styles after printing
      setTimeout(() => {
        if (document.head.contains(styleElement)) {
          document.head.removeChild(styleElement)
        }
      }, 1000)
    }, 500)
  } catch (error) {
    console.error("Error printing:", error)
    hideNotification()
    showNotification("Gagal print. Silakan coba lagi.", "error")
  }
}

// Notification helper functions
function showNotification(message: string, type: "success" | "error" | "info" | "loading") {
  // Remove existing notifications
  const existing = document.querySelectorAll(".toast-notification")
  existing.forEach((el) => el.remove())

  const notification = document.createElement("div")
  notification.className = `toast-notification fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 text-white ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : type === "loading"
          ? "bg-blue-500"
          : "bg-gray-500"
  }`

  if (type === "loading") {
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>${message}</span>
      </div>
    `
  } else {
    notification.textContent = message
  }

  document.body.appendChild(notification)

  // Auto remove after 3 seconds (except loading)
  if (type !== "loading") {
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }
}

function hideNotification() {
  const notifications = document.querySelectorAll(".toast-notification")
  notifications.forEach((el) => el.remove())
}

export const generateShareableLink = (invoiceData: any) => {
  const encodedData = btoa(JSON.stringify(invoiceData))
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?preview=${encodedData}`
}

export const parseSharedData = (sharedParam: string) => {
  try {
    return JSON.parse(atob(sharedParam))
  } catch (error) {
    console.error("Error parsing shared data:", error)
    return null
  }
}
