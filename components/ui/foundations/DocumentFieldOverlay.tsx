"use client"

import type React from "react"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { X, FileSignature, User, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FieldType } from "./DraggableField"  

export interface PlacedField {
  id: string
  type: FieldType
  x: number
  y: number
  page: number
  width: number
  height: number
}

interface DocumentFieldOverlayProps {
  children: React.ReactNode
  onFieldPlaced: (field: PlacedField) => void
  placedFields: PlacedField[]
  onFieldRemoved: (fieldId: string) => void
  currentPage?: number
}

export function DocumentFieldOverlay({
  children,
  onFieldPlaced,
  placedFields,
  onFieldRemoved,
  currentPage = 1,
}: DocumentFieldOverlayProps) {
  const [dragOverPosition, setDragOverPosition] = useState<{ x: number; y: number } | null>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: "document-drop-zone",
    data: {
      type: "document",
      page: currentPage,
    },
  })

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    setDragOverPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  const handleDragLeave = () => {
    setDragOverPosition(null)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOverPosition(null)

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if this is a DndKit drag operation by looking for the active draggable
    const activeElement =
      document.querySelector("[data-rbd-drag-handle-dragging-id]") || document.querySelector(".dnd-kit-draggable")

    if (activeElement) {
      // This is handled by DndKit's onDragEnd
      return
    }

    // Fallback for native drag events
    const fieldType = event.dataTransfer.getData("fieldType") as FieldType
    if (fieldType) {
      const newField: PlacedField = {
        id: `placed-${fieldType}-${Date.now()}`,
        type: fieldType,
        x: x - 50,
        y: y - 15,
        page: currentPage,
        width: fieldType === "signature" ? 120 : 100,
        height: fieldType === "signature" ? 40 : 30,
      }
      onFieldPlaced(newField)
    }
  }

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case "signature":
        return <FileSignature className="w-3 h-3" />
      case "name":
        return <User className="w-3 h-3" />
      case "email":
        return <Mail className="w-3 h-3" />
      case "date":
        return <Calendar className="w-3 h-3" />
      default:
        return null
    }
  }

  const currentPageFields = placedFields.filter((field) => field.page === currentPage)

  return (
    <div
      ref={setNodeRef}
      className={`relative ${isOver ? "bg-primary/5" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {/* Drag preview indicator */}
      {dragOverPosition && isOver && (
        <div
          className="absolute pointer-events-none z-10 bg-primary/20 border-2 border-dashed border-primary rounded"
          style={{
            left: dragOverPosition.x - 50,
            top: dragOverPosition.y - 15,
            width: 100,
            height: 30,
          }}
        />
      )}

      {/* Placed fields overlay */}
      {currentPageFields.map((field) => (
        <div
          key={field.id}
          className="absolute z-20 bg-primary/10 border-2 border-primary rounded flex items-center justify-between px-2 py-1 group"
          style={{
            left: field.x,
            top: field.y,
            width: field.width,
            height: field.height,
          }}
        >
          <div className="flex items-center gap-1">
            {getFieldIcon(field.type)}
            <span className="text-xs font-medium text-primary capitalize">{field.type}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onFieldRemoved(field.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
