"use client"

import { useState, useRef } from "react"
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Download,
  Eye,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react"
import type { ProviderDocument } from "@/lib/provider-portal-types"
import { getPortalConfig } from "@/lib/provider-portal-config"

interface ProviderDocumentsPanelProps {
  documents: ProviderDocument[]
  onUpload: (documentType: string, file: File) => Promise<void>
  onReupload: (documentId: string, file: File) => Promise<void>
}

interface DocumentTypeConfig {
  type: string
  label: string
  description: string
  required: boolean
}

const documentTypes: DocumentTypeConfig[] = [
  {
    type: "state_license",
    label: "State Medical License",
    description: "Current state medical license (unexpired)",
    required: true,
  },
  {
    type: "dea_registration",
    label: "DEA Registration",
    description: "Valid DEA registration certificate",
    required: true,
  },
  {
    type: "board_certification",
    label: "Board Certification",
    description: "Specialty board certification (if applicable)",
    required: false,
  },
  {
    type: "cv_resume",
    label: "CV / Resume",
    description: "Current curriculum vitae",
    required: true,
  },
  {
    type: "malpractice_insurance",
    label: "Malpractice Insurance",
    description: "Current malpractice insurance certificate",
    required: true,
  },
  {
    type: "medical_school_diploma",
    label: "Medical School Diploma",
    description: "Copy of medical school diploma",
    required: false,
  },
  {
    type: "work_verification",
    label: "Work History Verification",
    description: "Employment verification letters",
    required: false,
  },
]

export function ProviderDocumentsPanel({
  documents,
  onUpload,
  onReupload,
}: ProviderDocumentsPanelProps) {
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [reuploadingId, setReuploadingId] = useState<string | null>(null)
  const [dragOverType, setDragOverType] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  const config = getPortalConfig()

  const getDocumentForType = (type: string): ProviderDocument | undefined => {
    return documents.find((d) => d.documentType === type)
  }

  const getStatusConfig = (status: ProviderDocument["status"]) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          label: "Approved",
          className: "bg-green-100 text-green-700 border-green-200",
          iconColor: "text-green-600",
        }
      case "rejected":
        return {
          icon: XCircle,
          label: "Rejected",
          className: "bg-red-100 text-red-700 border-red-200",
          iconColor: "text-red-600",
        }
      case "reupload_required":
        return {
          icon: AlertTriangle,
          label: "Re-upload Required",
          className: "bg-amber-100 text-amber-700 border-amber-200",
          iconColor: "text-amber-600",
        }
      case "pending":
      default:
        return {
          icon: Clock,
          label: "Under Review",
          className: "bg-blue-100 text-blue-700 border-blue-200",
          iconColor: "text-blue-600",
        }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > config.maxDocumentSize * 1024 * 1024) {
      alert(`File size must be less than ${config.maxDocumentSize}MB`)
      return
    }

    if (!config.allowedDocumentTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a PDF, Word document, or image file.")
      return
    }

    try {
      if (selectedDocId) {
        setReuploadingId(selectedDocId)
        await onReupload(selectedDocId, file)
      } else if (selectedType) {
        setUploadingType(selectedType)
        await onUpload(selectedType, file)
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploadingType(null)
      setReuploadingId(null)
      setSelectedType(null)
      setSelectedDocId(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDrop = async (e: React.DragEvent, type: string, docId?: string) => {
    e.preventDefault()
    setDragOverType(null)

    const file = e.dataTransfer.files[0]
    if (!file) return

    // Validate file
    if (file.size > config.maxDocumentSize * 1024 * 1024) {
      alert(`File size must be less than ${config.maxDocumentSize}MB`)
      return
    }

    try {
      if (docId) {
        setReuploadingId(docId)
        await onReupload(docId, file)
      } else {
        setUploadingType(type)
        await onUpload(type, file)
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploadingType(null)
      setReuploadingId(null)
    }
  }

  const triggerUpload = (type: string, docId?: string) => {
    setSelectedType(type)
    setSelectedDocId(docId || null)
    fileInputRef.current?.click()
  }

  // Count stats
  const approved = documents.filter((d) => d.status === "approved").length
  const pending = documents.filter((d) => d.status === "pending").length
  const rejected = documents.filter((d) => d.status === "rejected" || d.status === "reupload_required").length
  const notUploaded = documentTypes.filter((dt) => !getDocumentForType(dt.type)).length

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff"
        onChange={handleFileSelect}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{approved}</div>
          <div className="text-sm text-green-600">Approved</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{pending}</div>
          <div className="text-sm text-blue-600">Under Review</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{rejected}</div>
          <div className="text-sm text-amber-600">Needs Action</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-700">{notUploaded}</div>
          <div className="text-sm text-gray-600">Not Uploaded</div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload all required documents to complete your credentialing application
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {documentTypes.map((docType) => {
            const doc = getDocumentForType(docType.type)
            const isUploading = uploadingType === docType.type
            const isReuploading = doc && reuploadingId === doc.id
            const isDragOver = dragOverType === docType.type

            return (
              <div
                key={docType.type}
                className={`p-6 transition-colors ${isDragOver ? "bg-violet-50" : "hover:bg-gray-50"}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverType(docType.type)
                }}
                onDragLeave={() => setDragOverType(null)}
                onDrop={(e) => handleDrop(e, docType.type, doc?.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Document Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      doc
                        ? doc.status === "approved"
                          ? "bg-green-100"
                          : doc.status === "rejected" || doc.status === "reupload_required"
                          ? "bg-red-100"
                          : "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <FileText
                      className={`w-6 h-6 ${
                        doc
                          ? doc.status === "approved"
                            ? "text-green-600"
                            : doc.status === "rejected" || doc.status === "reupload_required"
                            ? "text-red-600"
                            : "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-gray-900">{docType.label}</h4>
                      {docType.required && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          Required
                        </span>
                      )}
                      {doc && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusConfig(doc.status).className}`}>
                          {(() => {
                            const StatusIcon = getStatusConfig(doc.status).icon
                            return <StatusIcon className="w-3 h-3" />
                          })()}
                          {getStatusConfig(doc.status).label}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{docType.description}</p>

                    {/* Uploaded document info */}
                    {doc && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium">{doc.fileName}</span>
                          <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                          <span>Uploaded {new Date(doc.uploadedDate).toLocaleDateString()}</span>
                        </div>

                        {/* Rejection reason */}
                        {(doc.status === "rejected" || doc.status === "reupload_required") && doc.rejectionReason && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-900">Reason for rejection:</p>
                              <p className="text-sm text-red-700 mt-0.5">{doc.rejectionReason}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Drop zone indicator */}
                    {isDragOver && (
                      <div className="mt-3 p-4 border-2 border-dashed border-violet-400 bg-violet-50 rounded-lg text-center">
                        <Upload className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-violet-700">Drop file here to upload</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc ? (
                      <>
                        <button
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Re-upload button for rejected docs */}
                        {(doc.status === "rejected" || doc.status === "reupload_required") && (
                          <button
                            onClick={() => triggerUpload(docType.type, doc.id)}
                            disabled={isReuploading}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                          >
                            {isReuploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                Re-upload
                              </>
                            )}
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => triggerUpload(docType.type)}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Upload Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>Maximum file size: {config.maxDocumentSize}MB</li>
          <li>Accepted formats: PDF, Word documents, JPEG, PNG, TIFF</li>
          <li>All documents must be clear, legible, and unexpired</li>
          <li>You can drag and drop files onto any document row</li>
        </ul>
      </div>
    </div>
  )
}
