"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download, FileText, FileImage, Presentation, File } from "lucide-react"
import Image from "next/image"

interface DocumentPreviewProps {
  file: File
  onClose: () => void
}

export function DocumentPreview({ file, onClose }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [textContent, setTextContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    let objectUrl: string | null = null

    const createPreview = async () => {
      if (!isMounted) return

      setIsLoading(true)
      setPreviewUrl("")
      setTextContent("")

      try {
        if (file.type === "application/pdf") {
          objectUrl = URL.createObjectURL(file)
          if (isMounted) {
            setPreviewUrl(objectUrl)
          }
        } else if (file.type.startsWith("image/")) {
          objectUrl = URL.createObjectURL(file)
          if (isMounted) {
            setPreviewUrl(objectUrl)
          }
        } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
          const text = await file.text()
          if (isMounted) {
            setTextContent(text)
          }
        }
      } catch (error) {
        console.error("Error creating preview:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    createPreview()

    return () => {
      isMounted = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [file])

  const downloadFile = () => {
    const url = URL.createObjectURL(file)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileIcon = () => {
    if (file.type === "application/pdf") return <FileText className="w-8 h-8 text-red-500" />
    if (file.type.startsWith("image/")) return <FileImage className="w-8 h-8 text-blue-500" />
    if (file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx"))
      return <FileText className="w-8 h-8 text-blue-600" />
    if (file.type.includes("presentation") || file.name.endsWith(".ppt") || file.name.endsWith(".pptx"))
      return <Presentation className="w-8 h-8 text-orange-500" />
    if (file.type === "text/plain" || file.name.endsWith(".txt")) return <FileText className="w-8 h-8 text-gray-600" />
    return <File className="w-8 h-8 text-gray-500" />
  }

  const getFileTypeDescription = () => {
    if (file.type === "application/pdf") return "PDF Document"
    if (file.type.startsWith("image/")) return "Image File"
    if (file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) return "Word Document"
    if (file.type.includes("presentation") || file.name.endsWith(".ppt") || file.name.endsWith(".pptx"))
      return "PowerPoint Presentation"
    if (file.type === "text/plain" || file.name.endsWith(".txt")) return "Text Document"
    return "Document"
  }

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      )
    }

    if (file.type === "application/pdf" && previewUrl) {
      return (
        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <iframe src={previewUrl} className="w-full h-full" title={`Preview of ${file.name}`} />
        </div>
      )
    }

    if (file.type.startsWith("image/") && previewUrl) {
      return (
        <div className="w-full max-h-[600px] border rounded-lg overflow-hidden flex items-center justify-center bg-muted/20">
         <Image width={100} height={100}  alt={file.name}  className="max-w-full max-h-full object-contain"  src={previewUrl || "/placeholder.svg"}/>
        </div>
      )
    }

    if ((file.type === "text/plain" || file.name.endsWith(".txt")) && textContent) {
      return (
        <div className="w-full h-[500px] border rounded-lg overflow-hidden">
          <div className="h-full overflow-auto p-4 bg-muted/20 font-mono text-sm">
            <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
          </div>
        </div>
      )
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-muted/50 rounded-lg">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            {getFileIcon()}
          </div>
          <div>
            <h3 className="font-medium">{getFileTypeDescription()}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx")
                ? "Word documents require download to view"
                : file.type.includes("presentation") || file.name.endsWith(".ppt") || file.name.endsWith(".pptx")
                  ? "PowerPoint files require download to view"
                  : "Preview not available for this file type"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <Button onClick={downloadFile} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download to view
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{file.name}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={downloadFile}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  )
}
