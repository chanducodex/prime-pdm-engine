"use client"

import { useState } from "react"
import type { CredentialingApplication } from "@/lib/credentialing-types"
import { getAvailableWorkflowActions, getStatusDisplayInfo } from "@/lib/credentialing-workflow"
import type { UserContext } from "@/lib/credentialing-rbac"
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react"

interface WorkflowActionBarProps {
  application: CredentialingApplication
  user: UserContext
  onStatusChange: (newStatus: string, actionId: string) => void
}

export function WorkflowActionBar({ application, user, onStatusChange }: WorkflowActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const availableActions = getAvailableWorkflowActions(application, user)

  if (availableActions.length === 0) {
    return null
  }

  const handleAction = async (actionId: string, nextStatus: string, confirmMessage?: string) => {
    if (confirmMessage && !confirm(confirmMessage)) {
      return
    }

    setIsProcessing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    onStatusChange(nextStatus, actionId)
    setIsProcessing(false)
  }

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "primary":
        return "bg-violet-600 hover:bg-violet-700 text-white"
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white"
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white"
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white"
      case "secondary":
        return "bg-gray-600 hover:bg-gray-700 text-white"
      default:
        return "bg-gray-600 hover:bg-gray-700 text-white"
    }
  }

  const statusInfo = getStatusDisplayInfo(application.status)

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
              Current Status: {statusInfo.label}
            </div>
            {application.progressPercentage < 100 && (
              <span className="text-sm text-gray-600">
                {application.progressPercentage}% Complete
              </span>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-900">Available Actions</p>
            <div className="flex flex-wrap gap-2">
              {availableActions.map((action) => (
                <div key={action.id} className="group relative">
                  <button
                    onClick={() => handleAction(action.id, action.nextStatus, action.confirmMessage)}
                    disabled={isProcessing}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses(
                      action.variant
                    )}`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    {action.label}
                  </button>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap">
                      {action.description}
                      <div className="absolute top-full left-4 w-2 h-2 bg-gray-900 transform rotate-45 -mt-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {application.alerts.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg border border-amber-200">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{application.alerts.length} Alert{application.alerts.length > 1 ? 's' : ''} Require Attention</span>
          </div>
        )}
      </div>
    </div>
  )
}
