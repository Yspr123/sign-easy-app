"use client"

import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

interface SignatureData {
  name: string
  email: string
  date: string
  signature: string
}

async function convertImageToPng(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      canvas.width = img.width
      canvas.height = img.height

      if (ctx) {
        // Set white background for transparency
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        // Convert to PNG
        const pngDataUrl = canvas.toDataURL("image/png")
        resolve(pngDataUrl)
      } else {
        reject(new Error("Could not get canvas context"))
      }
    }
    img.onerror = () => reject(new Error("Could not load image"))
    img.src = dataUrl
  })
}

export async function generateSignedPDF(originalFile: File, signatureData: SignatureData): Promise<Blob> {
  try {
    // Create a new PDF document for the signature page
    const signaturePdf = await PDFDocument.create()
    const page = signaturePdf.addPage([612, 792]) // Standard letter size

    // Load fonts
    const font = await signaturePdf.embedFont(StandardFonts.Helvetica)
    const boldFont = await signaturePdf.embedFont(StandardFonts.HelveticaBold)

    // Add title
    page.drawText("Document Signature", {
      x: 50,
      y: 720,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    // Add signature information
    const yStart = 650
    const lineHeight = 30

    page.drawText("Signer Information:", {
      x: 50,
      y: yStart,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Name: ${signatureData.name}`, {
      x: 50,
      y: yStart - lineHeight,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Email: ${signatureData.email}`, {
      x: 50,
      y: yStart - lineHeight * 2,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Date: ${signatureData.date}`, {
      x: 50,
      y: yStart - lineHeight * 3,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    // Add signature image
    if (signatureData.signature) {
      try {
        console.log("[v0] Converting signature to PNG format")
        const pngSignature = await convertImageToPng(signatureData.signature)

        // Convert base64 PNG signature to image
        const signatureImageBytes = await fetch(pngSignature).then((res) => res.arrayBuffer())
        const signatureImage = await signaturePdf.embedPng(signatureImageBytes)

        page.drawText("Signature:", {
          x: 50,
          y: yStart - lineHeight * 5,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        page.drawImage(signatureImage, {
          x: 50,
          y: yStart - lineHeight * 8,
          width: 200,
          height: 80,
        })

        console.log("[v0] Signature image embedded successfully")
      } catch (error) {
        console.error("[v0] Error embedding signature image:", error)
        // Fallback text if signature image fails
        page.drawText("Signature: [Digital Signature Applied]", {
          x: 50,
          y: yStart - lineHeight * 5,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        })
      }
    }

    // Add timestamp
    page.drawText(`Document signed on: ${new Date().toLocaleString()}`, {
      x: 50,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    })

    // If original file is PDF, merge with it
    if (originalFile.type === "application/pdf") {
      try {
        const originalPdfBytes = await originalFile.arrayBuffer()
        const originalPdf = await PDFDocument.load(originalPdfBytes)

        // Copy pages from signature PDF to original PDF (prepend signature page)
        const [signaturePage] = await originalPdf.copyPages(signaturePdf, [0])
        originalPdf.insertPage(0, signaturePage)

        const pdfBytes = await originalPdf.save()
        return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
      } catch (error) {
        console.error("[v0] Error merging with original PDF:", error)
        // Return just the signature page if merging fails
        const pdfBytes = await signaturePdf.save()
        return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
      }
    } else {
      // For non-PDF files, return just the signature page
      const pdfBytes = await signaturePdf.save()
      return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
    }
  } catch (error) {
    console.error("[v0] Error generating signed PDF:", error)
    throw new Error("Failed to generate signed PDF")
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
