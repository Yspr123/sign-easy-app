"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, X, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { DocumentPreview } from "./DocumentPreview"


const uploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "Please select at least one file"),
})

type UploadFormData = z.infer<typeof uploadSchema>

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "application/vnd.ms-powerpoint": [".ppt"]
}

export function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewFile, setPreviewFile] = useState<File | null>(null)

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
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    form.setValue("files", newFiles)
  }

  const onSubmit = (data: UploadFormData) => {
    console.log("Uploading files:", data.files)
    // Handle file upload logic here
  }

  const supportedTypes = "PDF, DOC, DOCX, TXT, PPT"

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Upload Area */}
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

        {/* Uploaded Files */}
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
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Submit Button */}
        {uploadedFiles.length > 0 && (
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Upload Documents
            </Button>
          </div>
        )}
      </form>

      {/* Document Preview Modal */}
      {previewFile && <DocumentPreview file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  )
}
