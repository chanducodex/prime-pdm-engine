"use client"

import { Upload, Trash2, FileText, Image, File, Download, Eye } from "lucide-react"
import { useState, useRef } from "react"

interface Document {
  id: number
  name: string
  type: string
  size: string
  uploadedDate: string
  url?: string
}

interface DocumentsTabProps {
  providerId: number
  providerName: string
}

// Simple unique ID generator to avoid collisions when using timestamps
let __uniqueIdCounter = 0
function nextUniqueId(): number {
  __uniqueIdCounter = (__uniqueIdCounter + 1) % 1000
  return Date.now() * 1000 + __uniqueIdCounter
}

// Mock documents for demonstration
const mockDocuments: Document[] = [
  {
    id: 1,
    name: "Medical_License.pdf",
    type: "PDF",
    size: "245 KB",
    uploadedDate: "Jan 10, 2026",
  },
  {
    id: 2,
    name: "Profile_Photo.jpg",
    type: "JPG",
    size: "1.2 MB",
    uploadedDate: "Dec 15, 2025",
  },
  {
    id: 3,
    name: "Board_Certification.pdf",
    type: "PDF",
    size: "532 KB",
    uploadedDate: "Nov 20, 2025",
  },
  {
    id: 4,
    name: "DEA_License.pdf",
    type: "PDF",
    size: "189 KB",
    uploadedDate: "Oct 5, 2025",
  },
]

export function DocumentsTab({ providerId, providerName }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      // Validate file type and size
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
      ]
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Please upload PDF, JPG, or PNG files.`)
        return
      }

      if (file.size > maxSize) {
        alert(`File too large: ${file.name}. Maximum size is 10MB.`)
        return
      }

      // Simulate upload progress (use unique ID to avoid collisions)
      const uploadId = `${file.name}-${nextUniqueId()}`
      setUploadProgress((prev) => ({ ...prev, [uploadId]: 0 }))

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[uploadId] || 0
          if (current >= 100) {
            clearInterval(interval)

            // Add document to list
            const newDoc: Document = {
              id: nextUniqueId(),
              name: file.name,
              type: file.name.split(".").pop()?.toUpperCase() || "FILE",
              size: formatFileSize(file.size),
              uploadedDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }

            setDocuments((prev) => [newDoc, ...prev])

            // Remove progress
            setTimeout(() => {
              setUploadProgress((prev) => {
                const next = { ...prev }
                delete next[uploadId]
                return next
              })
            }, 500)

            return prev
          }
          return { ...prev, [uploadId]: current + 10 }
        })
      }, 100)
    })
  }

  const handleDelete = (docId: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    }
  }

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "PDF":
        return <FileText className="w-5 h-5" />
      case "JPG":
      case "JPEG":
      case "PNG":
      case "GIF":
        return <Image className="w-5 h-5" />
      default:
        return <File className="w-5 h-5" />
    }
  }

  const getFileIconBg = (type: string) => {
    switch (type.toUpperCase()) {
      case "PDF":
        return "bg-red-50 text-red-600"
      case "JPG":
      case "JPEG":
      case "PNG":
      case "GIF":
        return "bg-blue-50 text-blue-600"
      default:
        return "bg-gray-50 text-gray-600"
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Documents & Attachments ({documents.length})
        </h3>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-violet-400 bg-violet-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <Upload
          className={`w-10 h-10 mx-auto mb-3 ${
            isDragging ? "text-violet-500" : "text-gray-400"
          }`}
        />
        <p className="text-sm text-gray-600 mb-1">
          {isDragging ? "Drop files here" : "Drag and drop files here or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mb-4">Supports PDF, JPG, PNG up to 10MB</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
          type="button"
        >
          Browse Files
        </button>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <div key={id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{id.split("-")[0]}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileIconBg(
                    doc.type
                  )}`}
                >
                  {getFileIcon(doc.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {doc.size} • Uploaded {doc.uploadedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  title="Preview"
                  type="button"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  title="Download"
                  type="button"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No documents uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload documents like licenses, certifications, and photos
          </p>
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
