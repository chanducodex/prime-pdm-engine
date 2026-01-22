"use client"

import { useState } from "react"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Activity,
  Users,
  Shield,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useProviderAuth, useProviderApplication } from "@/lib/provider-auth-context"
import { ProviderDocumentsPanel } from "@/components/provider-portal/provider-documents-panel"
import type { ProviderDocument } from "@/lib/provider-portal-types"

export default function ProviderApplicationPage() {
  const { user } = useProviderAuth()
  const { application, isLoading } = useProviderApplication()
  const [documents, setDocuments] = useState<ProviderDocument[]>(application?.documents || [])
  const [activeTab, setActiveTab] = useState<"timeline" | "documents" | "decision">("timeline")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your application...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Application Found</h2>
        <p className="text-gray-600 mb-6">
          You don't have an active credentialing application.
        </p>
        <Link
          href="/provider-portal"
          className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const getStatusConfig = () => {
    switch (application.status) {
      case "approved":
        return { label: "Approved", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle }
      case "denied":
        return { label: "Not Approved", color: "text-red-700", bg: "bg-red-100", icon: AlertTriangle }
      case "committee_review":
        return { label: "Committee Review", color: "text-violet-700", bg: "bg-violet-100", icon: Users }
      case "documents_requested":
        return { label: "Documents Requested", color: "text-amber-700", bg: "bg-amber-100", icon: FileText }
      case "under_review":
        return { label: "Under Review", color: "text-blue-700", bg: "bg-blue-100", icon: Clock }
      default:
        return { label: "In Progress", color: "text-gray-700", bg: "bg-gray-100", icon: Activity }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  // Timeline steps
  const timelineSteps = [
    {
      id: 1,
      title: "Application Submitted",
      description: "Your application has been received",
      status: "completed" as const,
      date: application.submittedDate,
    },
    {
      id: 2,
      title: "Document Review",
      description: "Documents are being reviewed and verified",
      status: application.status === "documents_requested" ? "current" :
             ["under_review", "committee_review", "approved", "denied"].includes(application.status) ? "completed" : "pending" as const,
    },
    {
      id: 3,
      title: "Primary Source Verification",
      description: "Credentials are being verified with primary sources",
      status: ["committee_review", "approved", "denied"].includes(application.status) ? "completed" :
             application.status === "under_review" ? "current" : "pending" as const,
    },
    {
      id: 4,
      title: "Committee Review",
      description: "Application is being reviewed by the credentials committee",
      status: application.status === "approved" || application.status === "denied" ? "completed" :
             application.status === "committee_review" ? "current" : "pending" as const,
      date: application.committeeReview?.meetingDate,
    },
    {
      id: 5,
      title: "Final Decision",
      description: "Committee decision on your application",
      status: application.status === "approved" || application.status === "denied" ? "completed" : "pending" as const,
      date: application.committeeReview?.decisionDate,
    },
  ]

  const handleDocumentUpload = async (documentType: string, file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const newDoc: ProviderDocument = {
      id: `DOC-${Date.now()}`,
      documentType,
      fileName: file.name,
      uploadedDate: new Date().toISOString(),
      status: "pending",
      fileSize: file.size,
      fileUrl: URL.createObjectURL(file),
    }
    setDocuments((prev) => [...prev, newDoc])
  }

  const handleDocumentReupload = async (documentId: string, file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              fileName: file.name,
              uploadedDate: new Date().toISOString(),
              status: "pending" as const,
              fileSize: file.size,
              fileUrl: URL.createObjectURL(file),
              rejectionReason: undefined,
            }
          : doc
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/provider-portal"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Application</h1>
          <p className="text-gray-600 mt-1">
            Track your credentialing application status and manage documents
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Application ID</p>
          <p className="font-mono font-semibold text-gray-900">{application.id}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl border-2 p-6 ${statusConfig.bg} border-current/20`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
            <StatusIcon className={`w-7 h-7 ${statusConfig.color}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${statusConfig.color}`}>{statusConfig.label}</h2>
            <p className="text-gray-600 mt-1">
              {application.applicationType === "initial" ? "Initial Credentialing" : "Re-credentialing"} Application
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last updated: {new Date(application.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 border-b-2 text-sm font-medium transition-colors ${
              activeTab === "timeline"
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Timeline
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-3 border-b-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "documents"
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
            {documents.filter((d) => d.status === "rejected" || d.status === "reupload_required").length > 0 && (
              <span className="w-5 h-5 bg-red-100 text-red-700 rounded-full text-xs flex items-center justify-center">
                {documents.filter((d) => d.status === "rejected" || d.status === "reupload_required").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("decision")}
            className={`py-3 border-b-2 text-sm font-medium transition-colors ${
              activeTab === "decision"
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Committee Decision
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "timeline" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h3>
          <div className="relative">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className="flex gap-4 pb-8 last:pb-0">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : step.status === "current"
                        ? "bg-violet-100 text-violet-600 ring-4 ring-violet-50"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : step.status === "current" ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 mt-2 ${
                        step.status === "completed" ? "bg-green-200" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h4
                    className={`font-medium ${
                      step.status === "completed"
                        ? "text-gray-900"
                        : step.status === "current"
                        ? "text-violet-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                  {step.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(step.date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      step.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : step.status === "current"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {step.status === "completed" ? "Completed" : step.status === "current" ? "In Progress" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <ProviderDocumentsPanel
          documents={documents}
          onUpload={handleDocumentUpload}
          onReupload={handleDocumentReupload}
        />
      )}

      {activeTab === "decision" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Committee Decision</h3>

          {application.committeeReview?.decision ? (
            <div className="space-y-6">
              {/* Decision Card */}
              <div
                className={`p-6 rounded-xl border-2 ${
                  application.committeeReview.decision === "approved"
                    ? "bg-green-50 border-green-200"
                    : application.committeeReview.decision === "denied"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      application.committeeReview.decision === "approved"
                        ? "bg-green-100"
                        : application.committeeReview.decision === "denied"
                        ? "bg-red-100"
                        : "bg-amber-100"
                    }`}
                  >
                    {application.committeeReview.decision === "approved" ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : application.committeeReview.decision === "denied" ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-lg font-semibold ${
                        application.committeeReview.decision === "approved"
                          ? "text-green-700"
                          : application.committeeReview.decision === "denied"
                          ? "text-red-700"
                          : "text-amber-700"
                      }`}
                    >
                      {application.committeeReview.decision === "approved"
                        ? "Application Approved"
                        : application.committeeReview.decision === "denied"
                        ? "Application Not Approved"
                        : application.committeeReview.decision === "conditional"
                        ? "Conditional Approval"
                        : "Decision Deferred"}
                    </h4>
                    {application.committeeReview.decisionDate && (
                      <p className="text-sm text-gray-600">
                        Decision Date: {new Date(application.committeeReview.decisionDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditions */}
              {application.committeeReview.conditions && application.committeeReview.conditions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-3">Conditions to Meet</h4>
                  <ul className="space-y-2">
                    {application.committeeReview.conditions.map((condition, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {application.committeeReview.nextSteps && application.committeeReview.nextSteps.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Next Steps</h4>
                  <ul className="space-y-2">
                    {application.committeeReview.nextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                        <span className="w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                          {idx + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : application.committeeReview?.meetingDate ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Review Scheduled</h4>
              <p className="text-blue-700">
                Your application is scheduled for committee review on{" "}
                <strong>{new Date(application.committeeReview.meetingDate).toLocaleDateString()}</strong>
              </p>
              <p className="text-sm text-blue-600 mt-2">
                You will be notified of the decision within 2-3 business days after the meeting.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Pending Review</h4>
              <p className="text-gray-600">
                Your application has not yet been scheduled for committee review.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please ensure all required documents are uploaded and verified.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
