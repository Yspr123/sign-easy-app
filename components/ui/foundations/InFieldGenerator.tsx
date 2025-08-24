"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, Pen, Type, X, Check } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import SignatureCanvas from "react-signature-canvas"

interface InlineFieldEditorProps {
  fieldType: "signature" | "name" | "email" | "date"
  value: string
  onSave: (value: string) => void
  onCancel: () => void
}

export function InlineFieldEditor({ fieldType, value, onSave, onCancel }: InlineFieldEditorProps) {
  const [editValue, setEditValue] = useState(value)
  const [signatureMode, setSignatureMode] = useState<"draw" | "type" | "upload">("draw")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value && fieldType === "date" ? new Date(value) : undefined,
  )
  const signatureRef = useRef<SignatureCanvas>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    if (fieldType === "signature") {
      if (signatureMode === "draw" && signatureRef.current) {
        const signatureData = signatureRef.current.toDataURL()
        onSave(signatureData)
      } else {
        onSave(editValue)
      }
    } else if (fieldType === "date" && selectedDate) {
      onSave(format(selectedDate, "yyyy-MM-dd"))
    } else {
      onSave(editValue)
    }
  }

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setEditValue(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
  }

  return (
    <Card className="p-4 w-80 shadow-lg border-2 border-primary">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium capitalize">Edit {fieldType}</h3>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {fieldType === "signature" && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={signatureMode === "draw" ? "default" : "outline"}
                onClick={() => setSignatureMode("draw")}
              >
                <Pen className="w-4 h-4 mr-1" />
                Draw
              </Button>
              <Button
                size="sm"
                variant={signatureMode === "type" ? "default" : "outline"}
                onClick={() => setSignatureMode("type")}
              >
                <Type className="w-4 h-4 mr-1" />
                Type
              </Button>
              <Button
                size="sm"
                variant={signatureMode === "upload" ? "default" : "outline"}
                onClick={() => setSignatureMode("upload")}
              >
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </Button>
            </div>

            {signatureMode === "draw" && (
              <div className="space-y-2">
                <div className="border rounded-lg">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      width: 300,
                      height: 150,
                      className: "signature-canvas rounded-lg",
                    }}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={clearSignature}>
                  Clear
                </Button>
              </div>
            )}

            {signatureMode === "type" && (
              <Input
                placeholder="Type your signature"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="font-cursive text-lg"
                style={{ fontFamily: "cursive" }}
              />
            )}

            {signatureMode === "upload" && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
                {editValue && editValue.startsWith("data:image") && (
                  <img src={editValue || "/placeholder.svg"} alt="Signature" className="max-h-20 border rounded" />
                )}
              </div>
            )}
          </div>
        )}

        {fieldType === "name" && (
          <Input placeholder="Enter your name" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
        )}

        {fieldType === "email" && (
          <Input
            type="email"
            placeholder="Enter your email"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        )}

        {fieldType === "date" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </Card>
  )
}
