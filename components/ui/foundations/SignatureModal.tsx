"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Upload, Trash2 } from "lucide-react"
import Image from "next/image"

const signatureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  date: z.string().min(1, "Date is required"),
})

type SignatureFormData = z.infer<typeof signatureSchema>

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  files: File[]
  onComplete: (data: SignatureFormData & { signature: string }) => void
}

export function SignatureModal({ isOpen, onClose, files, onComplete }: SignatureModalProps) {
  const [signatureType, setSignatureType] = useState<"draw" | "upload">("draw")
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null)
  const signatureRef = useRef<SignatureCanvas>(null)

  const form = useForm<SignatureFormData>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      name: "",
      email: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
  }

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedSignature(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeUploadedSignature = () => {
    setUploadedSignature(null)
  }

  const onSubmit = (data: SignatureFormData) => {
    let signature = ""

    if (signatureType === "draw" && signatureRef.current) {
      if (signatureRef.current.isEmpty()) {
        alert("Please provide a signature")
        return
      }
      signature = signatureRef.current.toDataURL()
    } else if (signatureType === "upload") {
      if (!uploadedSignature) {
        alert("Please upload a signature image")
        return
      }
      signature = uploadedSignature
    }

    onComplete({ ...data, signature })
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sign Documents</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Document Info */}
          <Card className="p-4">
            <h3 className="font-medium mb-2">Documents to Sign:</h3>
            <div className="space-y-1">
              {files.map((file, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  {file.name}
                </p>
              ))}
            </div>
          </Card>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...form.register("name")} placeholder="Enter your full name" />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...form.register("email")} placeholder="Enter your email" />
              {form.formState.errors.email && (
                <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-destructive text-sm">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-4">
            <Label>Signature *</Label>
            <Tabs value={signatureType} onValueChange={(value) => setSignatureType(value as "draw" | "upload")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="draw">Draw Signature</TabsTrigger>
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
              </TabsList>

              <TabsContent value="draw" className="space-y-4">
                <Card className="p-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        width: 500,
                        height: 200,
                        className: "signature-canvas w-full h-48",
                      }}
                      backgroundColor="rgb(255, 255, 255)"
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <Card className="p-4">
                  {!uploadedSignature ? (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">Upload an image of your signature</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-white">
                        
                        <Image width={100} height={100}  alt={uploadedSignature }  className="max-w-full max-h-full object-contain"  src={uploadedSignature || "/placeholder.svg"}/>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={removeUploadedSignature}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button type="submit">Complete Signing</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
