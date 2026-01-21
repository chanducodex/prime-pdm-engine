"use client"

import { useState } from "react"
import type { CredentialingApplication, RecredentialingCycle } from "@/lib/credentialing-types"
import { mockRecredentialingCycles } from "@/lib/credentialing-mock-data"
import {
  RefreshCcw,
  Calendar,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  FileText,
} from "lucide-react"
import type { UserContext } from "@/lib/credentialing-rbac"

interface RecredentialingCycleTabProps {
  application: CredentialingApplication
  onUpdate: (application: CredentialingApplication) => void
  currentUser: UserContext
}

export function RecredentialingCycleTab({ application }: RecredentialingCycleTabProps) {
  const [cycle] = useState<RecredentialingCycle | undefined>(
    mockRecredentialingCycles.find((c) => c.providerId === application.providerId)
  )

  if (!cycle) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
          <RefreshCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Re-credentialing Cycle Active</h3>
          <p className="text-sm text-gray-600 mb-4">
            This is an initial credentialing application. Re-credentialing will be required in 3 years.
          </p>
          {application.expirationDate && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Next Re-credentialing Due: {new Date(application.expirationDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const getStatusColor = () => {
    switch (cycle.status) {
      case "completed":
        return "from-green-500 to-emerald-600"
      case "overdue":
        return "from-red-500 to-rose-600"
      case "awaiting_submission":
        return "from-amber-500 to-orange-600"
      case "submitted":
      case "in_review":
        return "from-blue-500 to-indigo-600"
      default:
        return "from-violet-500 to-purple-600"
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      not_due: { icon: Clock, label: "Not Due", className: "bg-gray-100 text-gray-700" },
      notice_sent: { icon: Send, label: "Notice Sent", className: "bg-blue-100 text-blue-700" },
      awaiting_submission: { icon: Clock, label: "Awaiting Submission", className: "bg-amber-100 text-amber-700" },
      submitted: { icon: CheckCircle, label: "Submitted", className: "bg-green-100 text-green-700" },
      in_review: { icon: RefreshCcw, label: "In Review", className: "bg-purple-100 text-purple-700" },
      completed: { icon: CheckCircle, label: "Completed", className: "bg-green-100 text-green-700" },
      overdue: { icon: AlertTriangle, label: "Overdue", className: "bg-red-100 text-red-700" },
    }

    const statusConfig = config[status as keyof typeof config] || config.not_due
    const Icon = statusConfig.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${statusConfig.className}`}>
        <Icon className="w-4 h-4" />
        {statusConfig.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cycle Summary */}
      <div className={`bg-gradient-to-r ${getStatusColor()} text-white rounded-lg p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">Re-credentialing Cycle {cycle.cycleNumber}</h3>
            <div className="space-y-1">
              <p className="text-white/90 text-sm">
                Prior Approval: {new Date(cycle.priorApprovalDate).toLocaleDateString()}
              </p>
              <p className="text-white/90 text-sm">
                Expiration: {new Date(cycle.expirationDate).toLocaleDateString()}
              </p>
              <p className="text-white/90 text-sm font-semibold">
                {cycle.daysUntilExpiration} days until expiration
              </p>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(cycle.status)}
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/90">Progress to Expiration:</span>
            <span className="text-white font-semibold">
              {cycle.daysSinceNotice} days since notice
            </span>
          </div>
          <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, ((1095 - cycle.daysUntilExpiration) / 1095) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* NCQA Requirement */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">NCQA 3-Year Re-credentialing Cycle</h4>
            <p className="text-sm text-blue-800">
              Per NCQA and CMS requirements, all providers must be re-credentialed every 3 years. Notices are sent 90 days before expiration to ensure timely submission.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Re-credentialing Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 border-2 border-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">90-Day Notice Sent</h4>
                <span className="text-xs text-gray-500">
                  {new Date(cycle.noticeDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Re-credentialing notice sent to provider with pre-populated application
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                cycle.status === "submitted" || cycle.status === "in_review" || cycle.status === "completed"
                  ? "bg-green-100 border-2 border-green-600"
                  : "bg-gray-100 border-2 border-gray-300"
              }`}
            >
              {cycle.status === "submitted" || cycle.status === "in_review" || cycle.status === "completed" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">Provider Submission Deadline</h4>
                <span className="text-xs text-gray-500">
                  {new Date(cycle.submissionDeadline).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Provider must submit updated application by this date
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                cycle.status === "completed"
                  ? "bg-green-100 border-2 border-green-600"
                  : "bg-gray-100 border-2 border-gray-300"
              }`}
            >
              {cycle.status === "completed" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">Credentialing Expiration</h4>
                <span className="text-xs text-gray-500">
                  {new Date(cycle.expirationDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Current credentialing expires if not renewed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fast Track Eligibility */}
      {cycle.fastTrackEligible && !cycle.changesReported && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">Fast Track Eligible</h4>
              <p className="text-sm text-green-800 mb-2">
                Provider reported no material changes. Fast track re-credentialing (30-day cycle) available.
              </p>
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors">
                Initiate Fast Track
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Changes */}
      {cycle.changesReported && cycle.materialChanges.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">Material Changes Reported</h4>
              <ul className="space-y-1">
                {cycle.materialChanges.map((change, idx) => (
                  <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-700 mt-2">
                Standard 90-day re-credentialing cycle required due to material changes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Outreach History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Outreach History</h3>
        <div className="space-y-3">
          {cycle.outreachHistory.map((outreach) => (
            <div key={outreach.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              {outreach.method === "email" ? (
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : outreach.method === "phone" ? (
                <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 capitalize">{outreach.method.replace(/_/g, " ")}</h4>
                  <span className="text-xs text-gray-500">{new Date(outreach.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600">Contacted by: {outreach.contactedBy}</p>
                {outreach.response && (
                  <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs text-gray-700">
                    <span className="font-medium">Response:</span> {outreach.response}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Send className="w-4 h-4 inline mr-2" />
          Send Reminder
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors">
          <FileText className="w-4 h-4 inline mr-2" />
          Generate Re-Cred Notice
        </button>
      </div>
    </div>
  )
}
