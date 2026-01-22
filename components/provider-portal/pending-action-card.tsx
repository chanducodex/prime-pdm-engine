"use client"

import {
  Upload,
  FileEdit,
  CreditCard,
  PenTool,
  Clock,
  AlertTriangle,
  ChevronRight,
  Calendar
} from "lucide-react"
import type { PendingAction } from "@/lib/provider-portal-types"

interface PendingActionCardProps {
  action: PendingAction
  onAction: (action: PendingAction) => void
}

export function PendingActionCard({ action, onAction }: PendingActionCardProps) {
  const getActionIcon = () => {
    switch (action.type) {
      case "document_upload":
        return Upload
      case "information_update":
        return FileEdit
      case "payment_required":
        return CreditCard
      case "signature_required":
        return PenTool
      default:
        return FileEdit
    }
  }

  const getPriorityConfig = () => {
    switch (action.priority) {
      case "urgent":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          badge: "bg-red-100 text-red-700 border-red-200",
          label: "Urgent",
        }
      case "high":
        return {
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          badge: "bg-amber-100 text-amber-700 border-amber-200",
          label: "High Priority",
        }
      case "medium":
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          badge: "bg-blue-100 text-blue-700 border-blue-200",
          label: "Medium",
        }
      default:
        return {
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          label: "Low",
        }
    }
  }

  const getActionLabel = () => {
    switch (action.type) {
      case "document_upload":
        return "Upload Document"
      case "information_update":
        return "Update Info"
      case "payment_required":
        return "Make Payment"
      case "signature_required":
        return "Sign Document"
      default:
        return "Take Action"
    }
  }

  const getDaysRemaining = () => {
    if (!action.dueDate) return null
    const due = new Date(action.dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const Icon = getActionIcon()
  const config = getPriorityConfig()
  const daysRemaining = getDaysRemaining()

  if (action.completed) {
    return null
  }

  return (
    <div
      className={`group rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-4 hover:shadow-md transition-all cursor-pointer`}
      onClick={() => onAction(action)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-semibold text-gray-900 truncate">
              {action.description}
            </h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.badge}`}>
              {config.label}
            </span>
          </div>

          {/* Due date */}
          {action.dueDate && (
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Due: {new Date(action.dueDate).toLocaleDateString()}
              </span>
              {daysRemaining !== null && (
                <span
                  className={`text-xs font-medium ${
                    daysRemaining < 0
                      ? "text-red-600"
                      : daysRemaining <= 3
                      ? "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {daysRemaining < 0 ? (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {Math.abs(daysRemaining)} days overdue
                    </span>
                  ) : daysRemaining === 0 ? (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due today
                    </span>
                  ) : (
                    `${daysRemaining} days left`
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="flex-shrink-0">
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              action.priority === "urgent" || action.priority === "high"
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {getActionLabel()}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface PendingActionsListProps {
  actions: PendingAction[]
  onAction: (action: PendingAction) => void
  maxItems?: number
}

export function PendingActionsList({ actions, onAction, maxItems }: PendingActionsListProps) {
  const pendingActions = actions.filter((a) => !a.completed)
  const displayActions = maxItems ? pendingActions.slice(0, maxItems) : pendingActions

  if (pendingActions.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-1">All caught up!</h3>
        <p className="text-sm text-green-700">You have no pending actions at this time.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {displayActions.map((action) => (
        <PendingActionCard key={action.id} action={action} onAction={onAction} />
      ))}

      {maxItems && pendingActions.length > maxItems && (
        <div className="text-center pt-2">
          <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            View all {pendingActions.length} pending actions
          </button>
        </div>
      )}
    </div>
  )
}
