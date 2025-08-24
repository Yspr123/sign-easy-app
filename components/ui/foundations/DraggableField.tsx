"use client"

import type React from "react"
import { useDraggable } from "@dnd-kit/core"
import { FileSignature, User, Mail, Calendar } from "lucide-react"

export type FieldType = "signature" | "name" | "email" | "date"

interface DraggableFieldProps {
  id: string
  type: FieldType
  children?: React.ReactNode
}
     
export function DraggableField({ id, type, children }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      type: "field",
      fieldType: type,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const getFieldIcon = () => {
    switch (type) {
      case "signature":
        return <FileSignature className="w-4 h-4" />
      case "name":
        return <User className="w-4 h-4" />
      case "email":
        return <Mail className="w-4 h-4" />
      case "date":
        return <Calendar className="w-4 h-4" />
      default:
        return null
    }
  }

  const getFieldLabel = () => {
    switch (type) {
      case "signature":
        return "Signature"
      case "name":
        return "Name"
      case "email":
        return "Email"
      case "date":
        return "Date"
      default:
        return type
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-primary/50 
        rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging ? "opacity-50 scale-105 shadow-lg" : "hover:border-primary hover:shadow-md"}
      `}
    >
      {getFieldIcon()}
      <span className="text-sm font-medium text-primary">{getFieldLabel()}</span>
      {children}
    </div>
  )
}

export function FieldToolbox() {
  const fields: { type: FieldType; label: string }[] = [
    { type: "signature", label: "Signature" },
    { type: "name", label: "Name" },
    { type: "email", label: "Email" },
    { type: "date", label: "Date" },
  ]

  return (
    <div className="bg-muted/30 p-4 rounded-lg border">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Drag Fields to Document</h3>
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => (
          <DraggableField key={field.type} id={`field-${field.type}`} type={field.type} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Drag these fields onto your document to position them where signatures and information should be placed.
      </p>
    </div>
  )
}
