"use client"

import { useState } from "react"
import type { CredentialingApplication } from "@/lib/credentialing-types"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Calendar,
  User,
  FileText,
  TrendingUp,
} from "lucide-react"

import type { UserContext } from "@/lib/credentialing-rbac"

interface CredentialingStatusTabProps {
  application: CredentialingApplication
  onUpdate: (application: CredentialingApplication) => void
  currentUser: UserContext
}

export function CredentialingStatusTab({ application, onUpdate }: CredentialingStatusTabProps) {
  const workflowSteps = [
    {
      id: "application_received",
      label: "Application Received",
      date: application.applicationDate,
      status: "completed" as const,
    },
    {
      id: "documents_upload",
      label: "Documents Upload",
      date: application.applicationDate,
      status:
        application.status === "documents_pending" ||
        application.status === "not_started"
          ? ("pending" as const)
          : ("completed" as const),
    },
    {
      id: "data_extraction",
      label: "AI Data Extraction",
      date: null,
      status:
        application.status === "extraction_in_progress"
          ? ("in_progress" as const)
          : application.status === "documents_pending" || application.status === "not_started"
          ? ("pending" as const)
          : ("completed" as const),
    },
    {
      id: "psv_verification",
      label: "Primary Source Verification",
      date: null,
      status:
        application.status === "psv_in_progress"
          ? ("in_progress" as const)
          : ["documents_pending", "not_started", "extraction_in_progress", "documents_received"].includes(
              application.status,
            )
          ? ("pending" as const)
          : ("completed" as const),
    },
    {
      id: "sanctions_screening",
      label: "Sanctions Screening",
      date: null,
      status:
        application.status === "sanctions_screening"
          ? ("in_progress" as const)
          : ["documents_pending", "not_started", "extraction_in_progress", "documents_received", "psv_in_progress"].includes(
              application.status,
            )
          ? ("pending" as const)
          : ("completed" as const),
    },
    {
      id: "committee_review",
      label: "Committee Review",
      date: null,
      status:
        application.status === "committee_review"
          ? ("in_progress" as const)
          : ["approved", "denied", "conditional_approval"].includes(application.status)
          ? ("completed" as const)
          : ("pending" as const),
    },
    {
      id: "final_decision",
      label: "Final Decision",
      date: application.actualCompletionDate,
      status: ["approved", "denied", "conditional_approval"].includes(application.status)
        ? ("completed" as const)
        : ("pending" as const),
    },
  ]

  const getStepIcon = (status: "completed" | "in_progress" | "pending") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "in_progress":
        return <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
      case "pending":
        return <Clock className="w-6 h-6 text-gray-400" />
    }
  }

  const getStepColor = (status: "completed" | "in_progress" | "pending") => {
    switch (status) {
      case "completed":
        return "border-green-600 bg-green-50"
      case "in_progress":
        return "border-blue-600 bg-blue-50"
      case "pending":
        return "border-gray-300 bg-gray-50"
    }
  }

  const [noteText, setNoteText] = useState("")

  const handleAddNote = () => {
    const text = noteText.trim()
    if (!text) return
    const updated = { ...application, notes: [...application.notes, text] }
    onUpdate(updated)
    setNoteText("")
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-medium text-gray-500 uppercase">Application Date</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {new Date(application.applicationDate).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-500 uppercase">Progress</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{application.progressPercentage}%</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-gray-500 uppercase">Days Remaining</span>
          </div>
          <p className={`text-xl font-bold ${
            application.daysRemaining < 30 ? "text-red-600" : application.daysRemaining < 60 ? "text-amber-600" : "text-gray-900"
          }`}>
            {application.daysRemaining > 0 ? application.daysRemaining : "—"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-500 uppercase">Assigned To</span>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">{application.assignedTo.split(",")[0]}</p>
        </div>
      </div>

      {/* Workflow Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Workflow Timeline</h3>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const isLast = index === workflowSteps.length - 1
            return (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`absolute left-3 top-10 w-0.5 h-8 ${
                      step.status === "completed" ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 border-2 rounded-full flex items-center justify-center ${getStepColor(
                      step.status,
                    )}`}
                  >
                    {getStepIcon(step.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`font-medium ${
                          step.status === "completed"
                            ? "text-gray-900"
                            : step.status === "in_progress"
                            ? "text-blue-900"
                            : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </h4>
                      {step.date && (
                        <span className="text-xs text-gray-500">
                          {new Date(step.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {step.status === "in_progress" && (
                      <p className="text-sm text-blue-600 font-medium">Currently in progress...</p>
                    )}
                    {step.status === "completed" && (
                      <p className="text-sm text-green-600">✓ Completed</p>
                    )}
                    {step.status === "pending" && (
                      <p className="text-sm text-gray-500">Pending...</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Alerts */}
      {application.alerts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Active Alerts ({application.alerts.length})
          </h3>
          <div className="space-y-3">
            {application.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === "error"
                    ? "bg-red-50 border-red-500"
                    : alert.type === "warning"
                    ? "bg-amber-50 border-amber-500"
                    : alert.type === "info"
                    ? "bg-blue-50 border-blue-500"
                    : "bg-green-50 border-green-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          alert.priority === "urgent"
                            ? "bg-red-600 text-white"
                            : alert.priority === "high"
                            ? "bg-orange-600 text-white"
                            : alert.priority === "medium"
                            ? "bg-amber-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {alert.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-600">
                        {alert.category.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!alert.resolvedAt && (
                    <button className="ml-4 px-3 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded border border-violet-200 transition-colors">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          Application Notes
        </h3>
        {application.notes.length > 0 ? (
          <div className="space-y-2">
            {application.notes.map((note, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-700 p-3 bg-gray-50 rounded">
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No notes available</p>
        )}

        <div className="mt-4">
          <textarea
            placeholder="Add a new note..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button
            onClick={handleAddNote}
            disabled={!noteText.trim()}
            className={`mt-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              noteText.trim() ? "bg-violet-600 hover:bg-violet-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  )
}
