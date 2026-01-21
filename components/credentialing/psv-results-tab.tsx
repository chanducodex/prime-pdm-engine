"use client"

import { useState } from "react"
import type { CredentialingApplication, PSVRequest } from "@/lib/credentialing-types"
import { mockPSVRequests } from "@/lib/credentialing-mock-data"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Send,
  Eye,
  RefreshCw,
  Calendar,
  Mail,
} from "lucide-react"
import type { UserContext } from "@/lib/credentialing-rbac"
import { hasPermission, CredentialingAction } from "@/lib/credentialing-rbac"

interface PSVResultsTabProps {
  application: CredentialingApplication
  onUpdate: (application: CredentialingApplication) => void
  currentUser: UserContext
}

export function PSVResultsTab({ application, currentUser }: PSVResultsTabProps) {
  const [psvRequests, setPsvRequests] = useState<PSVRequest[]>(
    mockPSVRequests.filter((req) => req.applicationId === application.id)
  )

  const getStatusBadge = (status: string) => {
    const config = {
      not_started: { icon: Clock, label: "Not Started", className: "bg-gray-100 text-gray-700" },
      requested: { icon: Send, label: "Requested", className: "bg-blue-100 text-blue-700" },
      in_progress: { icon: RefreshCw, label: "In Progress", className: "bg-purple-100 text-purple-700" },
      verified: { icon: CheckCircle, label: "Verified", className: "bg-green-100 text-green-700" },
      discrepancy: { icon: AlertTriangle, label: "Discrepancy", className: "bg-amber-100 text-amber-700" },
      unable_to_verify: { icon: XCircle, label: "Unable to Verify", className: "bg-red-100 text-red-700" },
      expired: { icon: XCircle, label: "Expired", className: "bg-red-100 text-red-700" },
    }

    const statusConfig = config[status as keyof typeof config] || config.not_started
    const Icon = statusConfig.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {statusConfig.label}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      normal: "bg-gray-100 text-gray-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config[priority as keyof typeof config]}`}>
        {priority.toUpperCase()}
      </span>
    )
  }

  const getCompletionPercentage = () => {
    const verified = psvRequests.filter((r) => r.status === "verified").length
    return psvRequests.length > 0 ? Math.round((verified / psvRequests.length) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* PSV Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Primary Source Verification Status</h3>
            <p className="text-sm text-gray-600">
              NCQA-compliant verification of all claimed credentials from primary sources
            </p>
          </div>
          {hasPermission(currentUser, CredentialingAction.SEND_PSV_REQUESTS) && (
            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-sm">
              <Send className="w-4 h-4 inline mr-2" />
              Send PSV Requests
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Total Requests</div>
            <div className="text-2xl font-bold text-gray-900">{psvRequests.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Verified</div>
            <div className="text-2xl font-bold text-green-600">
              {psvRequests.filter((r) => r.status === "verified").length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {psvRequests.filter((r) => r.status === "in_progress" || r.status === "requested").length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Completion</div>
            <div className="text-2xl font-bold text-violet-600">{getCompletionPercentage()}%</div>
          </div>
        </div>
      </div>

      {/* PSV Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">NCQA 120-Day Timeline</h3>
          <div className="text-sm text-gray-600">
            Deadline: <span className="font-semibold">{new Date(application.targetCompletionDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all"
            style={{ width: `${((120 - application.daysRemaining) / 120) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Application Received: {new Date(application.applicationDate).toLocaleDateString()}</span>
          <span>{application.daysRemaining} days remaining</span>
        </div>
      </div>

      {/* PSV Requests List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Verification Requests</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {psvRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No PSV requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Send PSV Requests" to initiate verification</p>
            </div>
          ) : (
            psvRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-medium text-gray-900">
                        {request.credentialType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h4>
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Source:</span> {request.sourceName}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Requested: {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                      {request.actualResponseDate && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Responded: {new Date(request.actualResponseDate).toLocaleDateString()}
                        </span>
                      )}
                      {!request.actualResponseDate && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Clock className="w-3.5 h-3.5" />
                          Expected: {new Date(request.expectedResponseDate).toLocaleDateString()}
                        </span>
                      )}
                      {request.followUpCount > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Mail className="w-3.5 h-3.5" />
                          {request.followUpCount} Follow-up{request.followUpCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="ml-4 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Verification Result */}
                {request.verificationResult && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-green-900 mb-2">Verification Confirmed</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-green-700">Verified By:</span>
                            <p className="font-medium text-green-900">{request.verificationResult.verifiedBy}</p>
                          </div>
                          <div>
                            <span className="text-green-700">Date:</span>
                            <p className="font-medium text-green-900">
                              {new Date(request.verificationResult.verificationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-green-700">Data Matches:</span>
                            <p className="font-medium text-green-900">
                              {request.verificationResult.dataMatches ? "Yes ✓" : "No (Discrepancies)"}
                            </p>
                          </div>
                          <div>
                            <span className="text-green-700">Confidence:</span>
                            <p className="font-medium text-green-900">
                              {(request.verificationResult.confidenceLevel * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {request.notes.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {request.notes.map((note, idx) => (
                      <p key={idx} className="text-xs text-gray-600 pl-4 border-l-2 border-gray-200">
                        {note}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
