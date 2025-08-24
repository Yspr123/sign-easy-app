"use client"

import { useState, useCallback } from "react"
import type { PlacedField } from "@/components/ui/foundations/DocumentFieldOverlay"

export interface DocumentWithFields {
  file: File
  fields: PlacedField[]
}

export function useFieldTracking() {
  const [documentsWithFields, setDocumentsWithFields] = useState<Map<string, PlacedField[]>>(new Map())

  const getDocumentKey = useCallback((file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`
  }, [])

  const updateDocumentFields = useCallback(
    (file: File, fields: PlacedField[]) => {
      const key = getDocumentKey(file)
      setDocumentsWithFields((prev) => {
        const newMap = new Map(prev)
        newMap.set(key, fields)
        return newMap
      })
    },
    [getDocumentKey],
  )

  const getDocumentFields = useCallback(
    (file: File): PlacedField[] => {
      const key = getDocumentKey(file)
      return documentsWithFields.get(key) || []
    },
    [getDocumentKey, documentsWithFields],
  )

  const removeDocumentFields = useCallback(
    (file: File) => {
      const key = getDocumentKey(file)
      setDocumentsWithFields((prev) => {
        const newMap = new Map(prev)
        newMap.delete(key)
        return newMap
      })
    },
    [getDocumentKey],
  )

  const getAllDocumentsWithFields = useCallback((): DocumentWithFields[] => {
    const result: DocumentWithFields[] = []
    documentsWithFields.forEach((fields, key) => {
      // Note: We can't reconstruct the File object from the key alone
      // This method is mainly for debugging/inspection purposes
      console.log(`Document ${key} has ${fields.length} fields`)
    })
    return result
  }, [documentsWithFields])

  const hasFields = useCallback(
    (file: File): boolean => {
      const fields = getDocumentFields(file)
      return fields.length > 0
    },
    [getDocumentFields],
  )

  const getFieldCount = useCallback(
    (file: File): number => {
      const fields = getDocumentFields(file)
      return fields.length
    },
    [getDocumentFields],
  )

  return {
    updateDocumentFields,
    getDocumentFields,
    removeDocumentFields,
    getAllDocumentsWithFields,
    hasFields,
    getFieldCount,
  }
}
