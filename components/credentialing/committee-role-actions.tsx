"use client"

import { useState } from "react"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Download,
  RefreshCw,
  Lock,
  Shield,
  Eye,
} from "lucide-react"
import type { CredentialingApplication, CommitteeReview, CommitteeDecision } from "@/lib/credentialing-types"
import type { UserContext } from "@/lib/credentialing-rbac"
import {
  hasPermission,
  CredentialingAction,
  CredentialingRole,
  getRoleDisplayName,
} from "@/lib/credentialing-rbac"

interface CommitteeRoleActionsProps {
  application: CredentialingApplication
  review: CommitteeReview | undefined
  currentUser: UserContext
  onGenerateSummary: () => void
  onSubmitVote: (decision: CommitteeDecision, comments?: string) => void
  onScheduleMeeting?: () => void
  onViewMeetings?: () => void
  onSendToProvider?: () => void
  onExport?: () => void
}

export function CommitteeRoleActions({
  application,
  review,
  currentUser,
  onGenerateSummary,
  onSubmitVote,
  onScheduleMeeting,
  onViewMeetings,
  onSendToProvider,
  onExport,
}: CommitteeRoleActionsProps) {
  const [showVoteDialog, setShowVoteDialog] = useState(false)
  const [selectedDecision, setSelectedDecision] = useState<CommitteeDecision | null>(null)
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userRole = currentUser.role

  // Role-based action visibility
  const canGenerateSummary = hasPermission(currentUser, CredentialingAction.SUBMIT_TO_COMMITTEE)
  const canVote = hasPermission(currentUser, CredentialingAction.VOTE_ON_APPLICATION)
  const canFinalApprove = hasPermission(currentUser, CredentialingAction.FINAL_APPROVE)
  const canFinalDeny = hasPermission(currentUser, CredentialingAction.FINAL_DENY)
  const canAddConditions = hasPermission(currentUser, CredentialingAction.ADD_CONDITIONS)
  const canViewMeetings = hasPermission(currentUser, CredentialingAction.VIEW_APPLICATIONS)
  const canScheduleMeeting = hasPermission(currentUser, CredentialingAction.SUBMIT_TO_COMMITTEE)

  // Check if user has already voted
  const userVote = review?.votingMembers.find((m) => m.name === currentUser.name)
  const hasVoted = userVote?.vote !== null && userVote?.vote !== undefined

  const handleVoteSubmit = async () => {
    if (!selectedDecision) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSubmitVote(selectedDecision, comments || undefined)
    setIsSubmitting(false)
    setShowVoteDialog(false)
    setSelectedDecision(null)
    setComments("")
  }

  const getRoleSpecificActions = () => {
    switch (userRole) {
      case CredentialingRole.COMMITTEE_CHAIR:
        return [
          {
            label: "Final Approve",
            icon: CheckCircle,
            color: "green",
            action: () => onSubmitVote("approve"),
            show: canFinalApprove && review?.decision !== "approve",
          },
          {
            label: "Final Deny",
            icon: XCircle,
            color: "red",
            action: () => onSubmitVote("deny"),
            show: canFinalDeny && review?.decision !== "deny",
          },
          {
            label: "Add Conditions",
            icon: AlertTriangle,
            color: "amber",
            action: () => onSubmitVote("conditional_approval"),
            show: canAddConditions,
          },
          {
            label: "View Meetings",
            icon: Calendar,
            color: "violet",
            action: onViewMeetings,
            show: canViewMeetings,
          },
          {
            label: "Schedule Meeting",
            icon: Users,
            color: "blue",
            action: onScheduleMeeting,
            show: canScheduleMeeting,
          },
        ]

      case CredentialingRole.COMMITTEE_MEMBER:
        return [
          {
            label: hasVoted ? `Change Vote (${userVote?.vote?.toUpperCase()})` : "Cast Vote",
            icon: hasVoted ? RefreshCw : Send,
            color: hasVoted ? "amber" : "violet",
            action: () => setShowVoteDialog(true),
            show: canVote && review?.decision !== "approve" && review?.decision !== "deny",
          },
          {
            label: "View Meetings",
            icon: Calendar,
            color: "blue",
            action: onViewMeetings,
            show: canViewMeetings,
          },
        ]

      case CredentialingRole.MEDICAL_DIRECTOR:
        return [
          {
            label: "Final Approve",
            icon: CheckCircle,
            color: "green",
            action: () => onSubmitVote("approve"),
            show: canFinalApprove && review?.decision !== "approve",
          },
          {
            label: "Final Deny",
            icon: XCircle,
            color: "red",
            action: () => onSubmitVote("deny"),
            show: canFinalDeny && review?.decision !== "deny",
          },
          {
            label: "View Meetings",
            icon: Calendar,
            color: "violet",
            action: onViewMeetings,
            show: canViewMeetings,
          },
        ]

      case CredentialingRole.SPECIALIST:
        return [
          {
            label: "Generate Summary",
            icon: FileText,
            color: "violet",
            action: onGenerateSummary,
            show: canGenerateSummary && !review,
          },
          {
            label: "Schedule Meeting",
            icon: Users,
            color: "blue",
            action: onScheduleMeeting,
            show: canScheduleMeeting,
          },
        ]

      case CredentialingRole.ANALYST:
        return [
          {
            label: "Generate Summary",
            icon: FileText,
            color: "violet",
            action: onGenerateSummary,
            show: canGenerateSummary && !review,
          },
          {
            label: "View Meetings",
            icon: Calendar,
            color: "blue",
            action: onViewMeetings,
            show: canViewMeetings,
          },
        ]

      case CredentialingRole.COMPLIANCE:
        return [
          {
            label: "View Meetings",
            icon: Calendar,
            color: "violet",
            action: onViewMeetings,
            show: canViewMeetings,
          },
        ]

      case CredentialingRole.COORDINATOR:
        return [
          {
            label: "View Summary",
            icon: Eye,
            color: "violet",
            action: () => {},
            show: !!review,
          },
        ]

      case CredentialingRole.ADMIN:
        return [
          {
            label: "Generate Summary",
            icon: FileText,
            color: "violet",
            action: onGenerateSummary,
            show: canGenerateSummary && !review,
          },
          {
            label: "View Meetings",
            icon: Calendar,
            color: "blue",
            action: onViewMeetings,
            show: canViewMeetings,
          },
          {
            label: "Schedule Meeting",
            icon: Users,
            color: "green",
            action: onScheduleMeeting,
            show: canScheduleMeeting,
          },
        ]

      default:
        return []
    }
  }

  const actions = getRoleSpecificActions().filter((a) => a.show)

  const getColorClasses = (color: string) => {
    const colors = {
      green: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300",
      red: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300",
      amber: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:border-amber-300",
      violet: "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100 hover:border-violet-300",
      blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300",
    }
    return colors[color as keyof typeof colors] || colors.violet
  }

  return (
    <>
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <p className="text-sm text-white/80">Your Role</p>
              <p className="text-lg font-semibold">{getRoleDisplayName(userRole)}</p>
            </div>
          </div>
          {userVote?.vote && (
            <div className="text-right">
              <p className="text-sm text-white/80">Your Vote</p>
              <p className="text-lg font-semibold uppercase">{userVote?.vote}</p>
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Actions */}
      {actions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {actions.map((action, idx) => {
              const Icon = action.icon
              return (
                <button
                  key={idx}
                  onClick={action.action}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${getColorClasses(
                    action.color
                  )} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Common Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Common Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Summary
          </button>
          {review?.approvedBy && onSendToProvider && (
            <button
              onClick={onSendToProvider}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send to Provider
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <FileText className="w-4 h-4" />
            Generate Minutes
          </button>
        </div>
      </div>

      {/* Vote Dialog */}
      {showVoteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cast Your Vote</h3>
              <button
                onClick={() => setShowVoteDialog(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {(["approve", "deny", "defer", "conditional_approval"] as CommitteeDecision[]).map(
                (decision) => {
                  const isSelected = selectedDecision === decision
                  const icons = {
                    approve: CheckCircle,
                    deny: XCircle,
                    defer: Clock,
                    conditional_approval: AlertTriangle,
                  }
                  const Icon = icons[decision]
                  return (
                    <button
                      key={decision}
                      onClick={() => setSelectedDecision(decision)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-300 hover:border-violet-300"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? "text-violet-600" : "text-gray-600"}`} />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-900 capitalize">{decision.replace("_", " ")}</p>
                      </div>
                    </button>
                  )
                }
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any rationale for your vote..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVoteDialog(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVoteSubmit}
                disabled={!selectedDecision || isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Vote
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
