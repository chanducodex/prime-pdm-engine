"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import type { CredentialingApplication, CredentialingDocument, DocumentType } from "@/lib/credentialing-types"
import { mockCredentialingDocuments } from "@/lib/credentialing-mock-data"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Eye,
  Sparkles,
  Clock,
} from "lucide-react"
import type { UserContext } from "@/lib/credentialing-rbac"
import { hasPermission, CredentialingAction } from "@/lib/credentialing-rbac"

interface DocumentsUploadTabProps {
  application: CredentialingApplication
  onUpdate: (application: CredentialingApplication) => void
  currentUser: UserContext
}

export function DocumentsUploadTab({ application, currentUser }: DocumentsUploadTabProps) {
  const [documents, setDocuments] = useState<CredentialingDocument[]>(
    mockCredentialingDocuments.filter((doc) => doc.applicationId === application.id)
  )
  const [showExtractionModal, setShowExtractionModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<CredentialingDocument | null>(null)

  const documentTypes: { type: DocumentType; label: string; required: boolean }[] = [
    { type: "state_license", label: "State Medical License", required: true },
    { type: "dea_registration", label: "DEA Registration", required: true },
    { type: "board_certification", label: "Board Certification", required: false },
    { type: "cv_resume", label: "CV / Resume", required: true },
    { type: "medical_school_diploma", label: "Medical School Diploma", required: false },
    { type: "malpractice_insurance", label: "Malpractice Insurance", required: true },
    { type: "work_verification", label: "Work History Verification", required: false },
    { type: "other", label: "Other Documents", required: false },
  ]

  const getDocumentStatus = (type: DocumentType) => {
    const doc = documents.find((d) => d.type === type)
    return doc?.status || "pending_upload"
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending_upload: {
        icon: Clock,
        label: "Pending Upload",
        className: "bg-gray-100 text-gray-700",
      },
      uploaded: {
        icon: FileText,
        label: "Uploaded",
        className: "bg-blue-100 text-blue-700",
      },
      extracted: {
        icon: Sparkles,
        label: "AI Extracted",
        className: "bg-purple-100 text-purple-700",
      },
      verified: {
        icon: CheckCircle,
        label: "Verified",
        className: "bg-green-100 text-green-700",
      },
      expired: {
        icon: XCircle,
        label: "Expired",
        className: "bg-red-100 text-red-700",
      },
      rejected: {
        icon: AlertTriangle,
        label: "Rejected",
        className: "bg-amber-100 text-amber-700",
      },
    }

    const statusConfig = config[status as keyof typeof config] || config.pending_upload
    const Icon = statusConfig.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {statusConfig.label}
      </span>
    )
  }

  const handleViewExtraction = (doc: CredentialingDocument) => {
    setSelectedDocument(doc)
    setShowExtractionModal(true)
  }

  const simulateUpload = (type: DocumentType) => {
    // Simulate file upload
    const newDoc: CredentialingDocument = {
      id: `DOC-${Date.now()}`,
      applicationId: application.id,
      type,
      name: `${type.replace(/_/g, " ")}.pdf`,
      fileName: `${type}_${Date.now()}.pdf`,
      fileSize: Math.floor(Math.random() * 500000) + 100000,
      uploadDate: new Date().toISOString(),
      status: "uploaded",
      extractedData: null,
      verificationStatus: "not_verified",
      uploadedBy: "Provider Portal",
      notes: "Uploaded via provider portal",
    }

    setDocuments((prev) => [...prev, newDoc])

    // Simulate AI extraction after 2 seconds
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === newDoc.id
            ? {
                ...doc,
                status: "extracted",
                extractedData: {
                  documentType: type,
                  extractionDate: new Date().toISOString(),
                  confidence: Math.random() * 0.15 + 0.85, // 85-100%
                  fields: {},
                  alerts: [],
                },
              }
            : doc
        )
      )
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Upload Summary */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Upload Center</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload credentialing documents for AI-powered data extraction and verification
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">
                  <span className="font-semibold">{documents.filter((d) => d.status === "extracted" || d.status === "verified").length}</span> Extracted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <span className="font-semibold">{documents.filter((d) => d.status === "uploaded").length}</span> Processing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-700">
                  <span className="font-semibold">
                    {documentTypes.filter((dt) => !documents.some((d) => d.type === dt.type)).length}
                  </span>{" "}
                  Pending
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-violet-600 bg-white border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors">
              Download All
            </button>
            {hasPermission(currentUser, CredentialingAction.UPLOAD_DOCUMENTS) && (
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors shadow-sm">
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Documents
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {documentTypes.map((docType) => {
            const doc = documents.find((d) => d.type === docType.type)
            const status = getDocumentStatus(docType.type)

            return (
              <div key={docType.type} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-medium text-gray-900">{docType.label}</h4>
                      {docType.required && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          Required
                        </span>
                      )}
                      {getStatusBadge(status)}
                    </div>

                    {doc && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            <span className="font-medium">File:</span> {doc.fileName}
                          </span>
                          <span>
                            <span className="font-medium">Size:</span> {(doc.fileSize / 1024).toFixed(0)} KB
                          </span>
                          <span>
                            <span className="font-medium">Uploaded:</span>{" "}
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                        </div>

                        {doc.extractedData && (
                          <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-purple-900 font-medium">
                              AI Extraction Complete • Confidence: {(doc.extractedData.confidence * 100).toFixed(1)}%
                            </span>
                            <button
                              onClick={() => handleViewExtraction(doc)}
                              className="ml-auto text-xs font-medium text-purple-600 hover:text-purple-700 underline"
                            >
                              View Extracted Data
                            </button>
                          </div>
                        )}

                        {doc.extractedData?.alerts && doc.extractedData.alerts.length > 0 && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-900 mb-1">Alerts:</p>
                              {doc.extractedData.alerts.map((alert, idx) => (
                                <p key={idx} className="text-xs text-amber-800">
                                  • {alert}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    {doc ? (
                      <>
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View document">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        {doc.extractedData && (
                          <button
                            onClick={() => handleViewExtraction(doc)}
                            className="px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            <Sparkles className="w-4 h-4 inline mr-1" />
                            View Extraction
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => simulateUpload(docType.type)}
                        className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Extraction Modal rendered via portal to avoid being constrained by parent transforms */}
      {showExtractionModal && selectedDocument?.extractedData &&
        (typeof document !== "undefined" && document.body
          ? createPortal(
              <div className="fixed inset-0 z-[100] flex items-center justify-center">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowExtractionModal(false)} />

                {/* Dialog */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="extraction-modal-title"
                  className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-violet-600" />
                        <div>
                          <h3 id="extraction-modal-title" className="text-lg font-semibold text-gray-900">AI Extraction Results</h3>
                          <p className="text-sm text-gray-500">
                            {selectedDocument.name} • Confidence: {(selectedDocument.extractedData.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowExtractionModal(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {/* License Data */}
                      {selectedDocument.extractedData.license && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Medical License Information</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">License Number:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.license.number}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">State:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.license.state}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Issue Date:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.license.issueDate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Expiration Date:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.license.expirationDate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <p className="font-medium text-green-600">{selectedDocument.extractedData.license.status}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Specialty:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.license.specialty}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DEA Data */}
                      {selectedDocument.extractedData.dea && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">DEA Registration</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">DEA Number:</span>
                              <p className="font-medium text-gray-900 font-mono">{selectedDocument.extractedData.dea.number}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <p className="font-medium text-green-600">{selectedDocument.extractedData.dea.status}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Issue Date:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.dea.issueDate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Expiration Date:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.dea.expirationDate}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">Schedules:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.dea.schedules?.join(", ")}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Board Certification */}
                      {selectedDocument.extractedData.boardCertification && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Board Certification</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="col-span-2">
                              <span className="text-gray-500">Board:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.boardCertification.board}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Specialty:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.boardCertification.specialty}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <p className="font-medium text-green-600">{selectedDocument.extractedData.boardCertification.status}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Certification Date:</span>
                              <p className="font-medium text-gray-900">
                                {selectedDocument.extractedData.boardCertification.certificationDate}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Expiration Date:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.boardCertification.expirationDate}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Malpractice Insurance */}
                      {selectedDocument.extractedData.malpracticeInsurance && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Malpractice Insurance</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="col-span-2">
                              <span className="text-gray-500">Carrier:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.malpracticeInsurance.carrier}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Policy Number:</span>
                              <p className="font-medium text-gray-900 font-mono">
                                {selectedDocument.extractedData.malpracticeInsurance.policyNumber}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Coverage Amount:</span>
                              <p className="font-medium text-gray-900">
                                {selectedDocument.extractedData.malpracticeInsurance.coverageAmount}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Issue Date:</span>
                              <p className="font-medium text-gray-900">{selectedDocument.extractedData.malpracticeInsurance.issueDate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Expiration Date:</span>
                              <p className="font-medium text-gray-900">
                                {selectedDocument.extractedData.malpracticeInsurance.expirationDate}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">Coverage Type:</span>
                              <p className="font-medium text-gray-900 capitalize">
                                {selectedDocument.extractedData.malpracticeInsurance.coverageType.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowExtractionModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
                      Verify Data
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null)}
    </div>
  )
}
