"use client"

import { useState } from "react"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Shield,
  Upload,
  ChevronRight,
} from "lucide-react"
import { useProviderAuth, useProviderApplication } from "@/lib/provider-auth-context"
import { PendingActionsList } from "@/components/provider-portal/pending-action-card"
import { ProviderDocumentsPanel } from "@/components/provider-portal/provider-documents-panel"
import type { PendingAction, ProviderDocument } from "@/lib/provider-portal-types"

export default function ProviderPortalPage() {
  const { user } = useProviderAuth()
  const { application, isLoading } = useProviderApplication()
  const [activeSection, setActiveSection] = useState<"overview" | "documents">("overview")
  const [documents, setDocuments] = useState<ProviderDocument[]>(application?.documents || [])

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
          You don't have an active credentialing application. Please contact the credentialing office to initiate your application.
        </p>
        <a
          href="mailto:credentialing@hospital.com"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
        >
          Contact Credentialing Office
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    )
  }

  const getStatusConfig = () => {
    switch (application.status) {
      case "approved":
        return {
          label: "Approved",
          description: "Your credentialing has been approved!",
          icon: CheckCircle,
          color: "text-green-700",
          bg: "bg-green-100",
          border: "border-green-200",
          gradient: "from-green-500 to-emerald-600",
        }
      case "denied":
        return {
          label: "Not Approved",
          description: "Your application was not approved. Please contact us for more information.",
          icon: AlertTriangle,
          color: "text-red-700",
          bg: "bg-red-100",
          border: "border-red-200",
          gradient: "from-red-500 to-rose-600",
        }
      case "committee_review":
        return {
          label: "Committee Review",
          description: "Your application is being reviewed by the credentials committee.",
          icon: Shield,
          color: "text-violet-700",
          bg: "bg-violet-100",
          border: "border-violet-200",
          gradient: "from-violet-500 to-purple-600",
        }
      case "documents_requested":
        return {
          label: "Documents Requested",
          description: "Please upload the requested documents to continue.",
          icon: Upload,
          color: "text-amber-700",
          bg: "bg-amber-100",
          border: "border-amber-200",
          gradient: "from-amber-500 to-orange-600",
        }
      case "under_review":
        return {
          label: "Under Review",
          description: "Your application is being processed by our team.",
          icon: Clock,
          color: "text-blue-700",
          bg: "bg-blue-100",
          border: "border-blue-200",
          gradient: "from-blue-500 to-indigo-600",
        }
      default:
        return {
          label: "In Progress",
          description: "Your application is in progress.",
          icon: TrendingUp,
          color: "text-gray-700",
          bg: "bg-gray-100",
          border: "border-gray-200",
          gradient: "from-gray-500 to-slate-600",
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon
  const pendingActionsCount = application.pendingActions.filter((a) => !a.completed).length

  const handlePendingAction = (action: PendingAction) => {
    if (action.type === "document_upload") {
      setActiveSection("documents")
    }
    // Handle other action types...
  }

  const handleDocumentUpload = async (documentType: string, file: File) => {
    // Simulate upload
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
    // Simulate upload
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your credentialing application.
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Application ID</p>
          <p className="font-mono font-semibold text-gray-900">{application.id}</p>
        </div>
      </div>

      {/* Application Status Card */}
      <div className={`relative overflow-hidden rounded-2xl border-2 ${statusConfig.border} p-6`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.gradient} opacity-5`} />

        <div className="relative flex items-start gap-6">
          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${statusConfig.bg} flex items-center justify-center`}>
            <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className={`text-xl font-bold ${statusConfig.color}`}>{statusConfig.label}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                {application.applicationType === "initial" ? "Initial Credentialing" : "Re-credentialing"}
              </span>
            </div>
            <p className="text-gray-600">{statusConfig.description}</p>

            {application.submittedDate && (
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Submitted: {new Date(application.submittedDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Last updated: {new Date(application.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {pendingActionsCount > 0 && (
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-amber-700">{pendingActionsCount}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">Actions Needed</p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSection("overview")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === "overview"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSection("documents")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeSection === "documents"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Documents
          {documents.filter((d) => d.status === "rejected" || d.status === "reupload_required").length > 0 && (
            <span className="w-5 h-5 bg-red-100 text-red-700 rounded-full text-xs flex items-center justify-center">
              {documents.filter((d) => d.status === "rejected" || d.status === "reupload_required").length}
            </span>
          )}
        </button>
      </div>

      {/* Content based on active section */}
      {activeSection === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Actions - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
              {pendingActionsCount > 0 && (
                <span className="text-sm text-gray-500">{pendingActionsCount} items need attention</span>
              )}
            </div>
            <PendingActionsList
              actions={application.pendingActions}
              onAction={handlePendingAction}
              maxItems={5}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Document Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="text-sm font-semibold text-green-700">
                    {documents.filter((d) => d.status === "approved").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Under Review</span>
                  <span className="text-sm font-semibold text-blue-700">
                    {documents.filter((d) => d.status === "pending").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Needs Re-upload</span>
                  <span className="text-sm font-semibold text-red-700">
                    {documents.filter((d) => d.status === "rejected" || d.status === "reupload_required").length}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveSection("documents")}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
              >
                View All Documents
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Committee Decision (if available) */}
            {application.committeeReview && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Committee Decision</h3>

                {application.committeeReview.decision ? (
                  <div
                    className={`p-4 rounded-lg ${
                      application.committeeReview.decision === "approved"
                        ? "bg-green-50 border border-green-200"
                        : application.committeeReview.decision === "denied"
                        ? "bg-red-50 border border-red-200"
                        : "bg-amber-50 border border-amber-200"
                    }`}
                  >
                    <p
                      className={`font-semibold ${
                        application.committeeReview.decision === "approved"
                          ? "text-green-700"
                          : application.committeeReview.decision === "denied"
                          ? "text-red-700"
                          : "text-amber-700"
                      }`}
                    >
                      {application.committeeReview.decision === "approved"
                        ? "Approved"
                        : application.committeeReview.decision === "denied"
                        ? "Not Approved"
                        : application.committeeReview.decision === "conditional"
                        ? "Conditional Approval"
                        : "Deferred"}
                    </p>
                    {application.committeeReview.decisionDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Decision Date: {new Date(application.committeeReview.decisionDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : application.committeeReview.meetingDate ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-700">Scheduled for Review</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Meeting Date: {new Date(application.committeeReview.meetingDate).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Committee review is pending.</p>
                )}

                {/* Conditions (if any) */}
                {application.committeeReview.conditions && application.committeeReview.conditions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Conditions to Meet:</p>
                    <ul className="space-y-1">
                      {application.committeeReview.conditions.map((condition, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps (if any) */}
                {application.committeeReview.nextSteps && application.committeeReview.nextSteps.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Next Steps:</p>
                    <ul className="space-y-1">
                      {application.committeeReview.nextSteps.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Help Card */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-violet-900 mb-2">Need Help?</h3>
              <p className="text-sm text-violet-700 mb-4">
                Our credentialing team is here to assist you with any questions about your application.
              </p>
              <a
                href="mailto:credentialing@hospital.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
              >
                Contact Support
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <ProviderDocumentsPanel
          documents={documents}
          onUpload={handleDocumentUpload}
          onReupload={handleDocumentReupload}
        />
      )}
    </div>
  )
}
