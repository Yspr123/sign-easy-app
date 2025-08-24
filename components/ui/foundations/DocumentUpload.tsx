"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, X, Eye, Download, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { DocumentPreview } from "./DocumentPreview"
import { generateSignedPDF, downloadBlob } from "./PdfGenerator"
import { useFieldTracking } from "@/hooks/UseFieldTracking"
import type { PlacedField } from "./DocumentFieldOverlay"

interface SignedDocument {
  files: File[]
  fieldPositions: Map<string, PlacedField[]>
}

const uploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "Please select at least one file"),
})

type UploadFormData = z.infer<typeof uploadSchema>

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "application/rtf": [".rtf"],
  "application/vnd.oasis.opendocument.text": [".odt"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/tiff": [".tiff"],
  "image/gif": [".gif"],
}

export function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [signedDocuments, setSignedDocuments] = useState<SignedDocument[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const { updateDocumentFields, getDocumentFields, removeDocumentFields, hasFields, getFieldCount } = useFieldTracking()

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      files: [],
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...uploadedFiles, ...acceptedFiles]
      setUploadedFiles(newFiles)
      form.setValue("files", newFiles)
      form.clearErrors("files")
    },
    [uploadedFiles, form],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: true,
  })

  const removeFile = (index: number) => {
    const fileToRemove = uploadedFiles[index]
    removeDocumentFields(fileToRemove)

    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    form.setValue("files", newFiles)
  }

  const onSubmit = (data: UploadFormData) => {
    console.log("[v0] Opening document preview for field placement:", data.files)
    if (data.files.length > 0) {
      setPreviewFile(data.files[0])
    }
  }

  const handleDownloadDocument = async (file: File) => {
    console.log("[v0] Downloading document with fields:", file)

    const fields = getDocumentFields(file)
    if (fields.length === 0) {
      alert("Please add and fill some fields before downloading.")
      return
    }

    const emptyFields = fields.filter((field) => !field.value || field.value.trim() === "")
    if (emptyFields.length > 0) {
      alert("Please fill in all fields before downloading.")
      return
    }

    setIsGeneratingPDF(true)
    try {
      const signatureData = {
        name: fields.find((f) => f.type === "name")?.value || "",
        email: fields.find((f) => f.type === "email")?.value || "",
        date: fields.find((f) => f.type === "date")?.value || "",
        signature: fields.find((f) => f.type === "signature")?.value || "",
      }

      const signedPdfBlob = await generateSignedPDF(file, signatureData, fields)

      const originalName = file.name.split(".")[0]
      const filename = `${originalName}_signed.pdf`

      downloadBlob(signedPdfBlob, filename)
    } catch (error) {
      console.error("[v0] Error generating signed PDF:", error)
      alert("Error generating signed document. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleFieldsChanged = (file: File, fields: PlacedField[]) => {
    updateDocumentFields(file, fields)
  }

  const supportedTypes = "PDF, DOC, DOCX, TXT, RTF, ODT, PPT, PPTX, XLS, XLSX, JPG, JPEG, PNG, TIFF, GIF"

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-8">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-foreground">
                  {isDragActive ? "Drop files here" : "Drag and drop files here"}
                </h3>
                <p className="text-muted-foreground">Or, browse files from your computer</p>
              </div>
              <Button type="button" variant="secondary" className="mt-4">
                Browse files
              </Button>
            </div>
          </div>

          {form.formState.errors.files && (
            <p className="text-destructive text-sm mt-2">{form.formState.errors.files.message}</p>
          )}

          <p className="text-sm text-muted-foreground mt-4 text-center">Supported file types: {supportedTypes}</p>
        </Card>

        {uploadedFiles.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        {hasFields(file) && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {getFieldCount(file)} field{getFieldCount(file) !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(file.type === "application/pdf" ||
                      file.type === "application/msword" ||
                      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewFile(file)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {hasFields(file) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(file)}
                        disabled={isGeneratingPDF}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {uploadedFiles.length > 0 && (
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Add Fields to Documents
            </Button>
          </div>
        )}
      </form>

      {previewFile && (
        <DocumentPreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onFieldsChanged={(fields) => handleFieldsChanged(previewFile, fields)}
          initialFields={getDocumentFields(previewFile)}
        />
      )}
    </div>
  )
}
