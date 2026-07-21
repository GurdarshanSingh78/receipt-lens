"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Loader2, Camera, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function ReceiptUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const router = useRouter()
  const { userId } = useAuth()

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }
    setIsUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "x-user-id": userId || "",
        },
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        router.refresh()
      } else {
        setError(data.error || "Upload failed")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setIsUploading(false)
    }
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }, [])

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  return (
    <div className="space-y-3">
      <Card className={`border-2 border-dashed transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300"}`}>
        <CardContent className="p-8 text-center">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className="cursor-pointer"
          >
            <input
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
              id="receipt-upload"
            />
            <label htmlFor="receipt-upload" className="cursor-pointer block">
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-slate-600 font-medium">Extracting data...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                    <Camera className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Drop receipt here</p>
                    <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                  </div>
                  <p className="text-xs text-slate-400">JPG, PNG up to 10MB</p>
                </div>
              )}
            </label>
          </div>
        </CardContent>
      </Card>
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}
