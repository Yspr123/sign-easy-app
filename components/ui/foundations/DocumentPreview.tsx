"use client"

import { useState, useEffect } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download, FileText, FileImage, Presentation, File } from "lucide-react"
import type { PlacedField } from "./DocumentFieldOverlay"
import { FieldToolbox, DraggableField, type FieldType } from "./DraggableField"

interface DocumentPreviewProps {
  file: File
  onClose: () => void
  onFieldsChanged?: (fields: PlacedField[]) => void
  initialFields?: PlacedField[]
}

export function DocumentPreview({ file, onClose, onFieldsChanged, initialFields = [] }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [textContent, setTextContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [placedFields, setPlacedFields] = useState<PlacedField[]>(initialFields)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeField, setActiveField] = useState<{ id: string; type: FieldType } | null>(null)

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

  const handleFieldPlaced = (field: PlacedField) => {
    const newFields = [...placedFields, field]
    setPlacedFields(newFields)
    onFieldsChanged?.(newFields)
  }

  const handleFieldRemoved = (fieldId: string) => {
    const newFields = placedFields.filter((field) => field.id !== fieldId)
    setPlacedFields(newFields)
    onFieldsChanged?.(newFields)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === "field") {
      setActiveField({
        id: active.id as string,
        type: active.data.current.fieldType as FieldType,
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveField(null)

    if (over && over.id === "document-drop-zone" && active.data.current?.type === "field") {
      const dropEvent = event as any
      if (dropEvent.delta) {
        // Calculate drop position based on drag delta and initial position
        const rect = document.getElementById("document-drop-zone")?.getBoundingClientRect()
        if (rect) {
          const x = dropEvent.delta.x + 100 // Approximate starting position
          const y = dropEvent.delta.y + 100

          const newField: PlacedField = {
            id: `placed-${active.data.current.fieldType}-${Date.now()}`,
            type: active.data.current.fieldType as FieldType,
            x: Math.max(0, x - 50),
            y: Math.max(0, y - 15),
            page: currentPage,
            width: active.data.current.fieldType === "signature" ? 120 : 100,
            height: active.data.current.fieldType === "signature" ? 40 : 30,
          }
          handleFieldPlaced(newField)
        }
      }
    }
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
          <img
            src={previewUrl || "/placeholder.svg"}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0">
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

          <div className="p-6 pt-4 space-y-4">
            <FieldToolbox />

            {placedFields.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {placedFields.length} field{placedFields.length !== 1 ? "s" : ""} placed on document
              </div>
            )}

            <div id="document-drop-zone">{renderPreview()}</div>
          </div>
        </DialogContent>
      </Dialog>

      <DragOverlay>{activeField ? <DraggableField id={activeField.id} type={activeField.type} /> : null}</DragOverlay>
    </DndContext>
  )
}
