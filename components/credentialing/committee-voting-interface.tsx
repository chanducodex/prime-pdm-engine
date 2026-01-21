"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  Users,
  Lock,
  Unlock,
  Eye,
  Download,
} from "lucide-react"
import type { CommitteeReview, CommitteeMember, CommitteeDecision } from "@/lib/credentialing-types"
import type { VotingSession, CommitteeVote } from "@/lib/credentialing-committee-types"
import { hasPermission, CredentialingAction, CredentialingRole } from "@/lib/credentialing-rbac"

interface CommitteeVotingInterfaceProps {
  applicationId: string
  applicationProvider: string
  review: CommitteeReview
  currentUser: { userId: string; name: string; email: string; role: CredentialingRole }
  onVoteSubmit: (vote: CommitteeDecision, comments?: string) => void
  onSessionClose?: () => void
  onViewDetails?: () => void
}

export function CommitteeVotingInterface({
  applicationId,
  applicationProvider,
  review,
  currentUser,
  onVoteSubmit,
  onSessionClose,
  onViewDetails,
}: CommitteeVotingInterfaceProps) {
  const [selectedVote, setSelectedVote] = useState<CommitteeDecision | null>(null)
  const [comments, setComments] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<CommitteeDecision | null>(null)
  const [sessionClosed, setSessionClosed] = useState(false)
  const [showComments, setShowComments] = useState(false)

  // Check if user has already voted
  useEffect(() => {
    const existingVote = review.votingMembers.find((m) => m.name === currentUser.name)
    if (existingVote && existingVote.vote && existingVote.vote !== "abstain") {
      setHasVoted(true)
      setUserVote(existingVote.vote as CommitteeDecision)
      setSelectedVote(existingVote.vote as CommitteeDecision)
    }
  }, [review.votingMembers, currentUser.name])

  const canVote = hasPermission(currentUser, CredentialingAction.VOTE_ON_APPLICATION)
  const canCloseSession = hasPermission(currentUser, CredentialingAction.FINAL_APPROVE) ||
    hasPermission(currentUser, CredentialingAction.FINAL_DENY)

  const handleVote = () => {
    if (!selectedVote) return

    onVoteSubmit(selectedVote, comments || undefined)
    setHasVoted(true)
    setUserVote(selectedVote)
    setShowComments(false)
  }

  const handleCloseSession = () => {
    setSessionClosed(true)
    onSessionClose?.()
  }

  const getVoteIcon = (vote: CommitteeDecision) => {
    const icons = {
      approve: CheckCircle,
      deny: XCircle,
      defer: Clock,
      conditional_approval: AlertCircle,
    }
    return icons[vote]
  }

  const getVoteLabel = (vote: CommitteeDecision) => {
    const labels = {
      approve: "Approve",
      deny: "Deny",
      defer: "Defer",
      conditional_approval: "Conditional",
    }
    return labels[vote]
  }

  // Calculate voting progress
  const totalMembers = review.votingMembers.length
  const votedMembers = review.votingMembers.filter((m) => m.vote !== null).length
  const progressPercentage = totalMembers > 0 ? (votedMembers / totalMembers) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">Committee Voting Session</h2>
              {sessionClosed ? (
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Closed
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  Open
                </span>
              )}
            </div>
            <p className="text-white/90 text-lg">{applicationProvider}</p>
            <p className="text-white/80 text-sm mt-2">
              Application ID: {applicationId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Voting Progress</p>
            <p className="text-3xl font-bold">
              {votedMembers}/{totalMembers}
            </p>
            <p className="text-white/80 text-sm">
              {Math.round(progressPercentage)}% Complete
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Voting Options */}
      {!hasVoted && !sessionClosed && canVote ? (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 border border-gray-200 rounded-2xl p-6 shadow-xl">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-100/40 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="text-center mb-6 relative">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-md shadow-violet-200 mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1.5">Cast Your Vote</h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Select your decision for this application. Your vote will be recorded anonymously.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {(["approve", "deny", "defer", "conditional_approval"] as CommitteeDecision[]).map(
              (vote) => {
                const Icon = getVoteIcon(vote)
                const isSelected = selectedVote === vote

                // Color themes for each vote type
                const colorThemes = {
                  approve: {
                    bg: "from-green-500 to-emerald-600",
                    bgLight: "from-green-50 to-emerald-50",
                    border: "border-green-200",
                    borderHover: "hover:border-green-400",
                    shadow: "shadow-green-200",
                    text: "text-green-700",
                    iconBg: "bg-green-500",
                  },
                  deny: {
                    bg: "from-red-500 to-rose-600",
                    bgLight: "from-red-50 to-rose-50",
                    border: "border-red-200",
                    borderHover: "hover:border-red-400",
                    shadow: "shadow-red-200",
                    text: "text-red-700",
                    iconBg: "bg-red-500",
                  },
                  defer: {
                    bg: "from-amber-500 to-yellow-600",
                    bgLight: "from-amber-50 to-yellow-50",
                    border: "border-amber-200",
                    borderHover: "hover:border-amber-400",
                    shadow: "shadow-amber-200",
                    text: "text-amber-700",
                    iconBg: "bg-amber-500",
                  },
                  conditional_approval: {
                    bg: "from-blue-500 to-indigo-600",
                    bgLight: "from-blue-50 to-indigo-50",
                    border: "border-blue-200",
                    borderHover: "hover:border-blue-400",
                    shadow: "shadow-blue-200",
                    text: "text-blue-700",
                    iconBg: "bg-blue-500",
                  },
                }

                const theme = colorThemes[vote]

                return (
                  <button
                    key={vote}
                    onClick={() => setSelectedVote(vote)}
                    className={`
                      relative flex-1 flex flex-col items-center gap-2 p-3 rounded-xl
                      transition-all duration-300 ease-out
                      ${isSelected
                        ? `bg-gradient-to-br ${theme.bgLight} border-2 shadow-lg ${theme.shadow} scale-105`
                        : `bg-white border-2 ${theme.border} ${theme.borderHover} hover:shadow-md hover:${theme.shadow} hover:-translate-y-0.5`
                      }
                      group
                    `}
                  >
                    {/* Selection Badge */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className={`bg-gradient-to-br ${theme.bg} w-6 h-6 rounded-full flex items-center justify-center shadow-md`}>
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Icon Container with Enhanced Design */}
                    <div className={`
                      relative w-11 h-11 rounded-xl flex items-center justify-center
                      transition-all duration-300
                      ${isSelected
                        ? `${theme.iconBg} shadow-md scale-105`
                        : "bg-gray-100 group-hover:bg-gray-200"
                      }
                    `}>
                      {/* Decorative ring behind icon */}
                      {isSelected && (
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${theme.bg} opacity-20 animate-ping`} />
                      )}

                      <Icon className={`w-6 h-6 transition-colors ${
                        isSelected ? "text-white" : "text-gray-600 group-hover:text-gray-700"
                      }`} />

                      {/* Shine effect for selected state */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/40 to-transparent" />
                      )}
                    </div>

                    {/* Vote Label */}
                    <span className={`font-bold text-sm ${isSelected ? theme.text : "text-gray-700"}`}>
                      {getVoteLabel(vote)}
                    </span>

                    {/* Animated Selection Ring */}
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 rounded-xl border-2 border-dashed animate-spin-slow"
                          style={{
                            borderColor: vote === "approve"
                              ? "#22c55e"
                              : vote === "deny"
                              ? "#ef4444"
                              : vote === "defer"
                              ? "#f59e0b"
                              : "#3b82f6",
                            animationDuration: "8s",
                          }}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
                      </>
                    )}

                    {/* Hover Glow Effect */}
                    {!isSelected && (
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${theme.bgLight} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`} />
                    )}
                  </button>
                )
              }
            )}
          </div>

          {/* Voting Info Banner */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-violet-900 mb-1">Voting Guidelines</h4>
                <ul className="text-sm text-violet-800 space-y-1">
                  <li>• Your vote will be recorded along with any optional comments</li>
                  <li>• You can change your vote before submitting by selecting another option</li>
                  <li>• All votes are confidential and only visible to committee members</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-3 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                showComments
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                  : "bg-violet-100 text-violet-600"
              }`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <span>{showComments ? "Hide Comments" : "Add Comments (Optional)"}</span>
            </button>
            {showComments && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl blur-lg opacity-50" />
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any comments or rationale for your vote..."
                  rows={3}
                  className="relative w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/80 backdrop-blur-sm transition-all placeholder:text-gray-400"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {comments.length} characters
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200/80">
            <button
              onClick={() => setSelectedVote(null)}
              disabled={!selectedVote}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Clear Selection
            </button>
            <button
              onClick={handleVote}
              disabled={!selectedVote}
              className="group px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-violet-200 hover:shadow-2xl hover:shadow-violet-300 flex items-center gap-2"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Submit Vote
            </button>
          </div>
        </div>
      ) : hasVoted ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Vote Submitted</h3>
              <p className="text-green-800">
                You voted: <span className="font-bold uppercase">{userVote}</span>
              </p>
            </div>
          </div>
        </div>
      ) : sessionClosed ? (
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Lock className="w-8 h-8 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Voting Session Closed</h3>
              <p className="text-gray-700">The voting session has been closed by the committee chair.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Voting Restricted</h3>
              <p className="text-amber-800">You do not have permission to vote on this application.</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Vote Results */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <Users className="w-5 h-5 inline mr-2 text-violet-600" />
            Live Vote Results
          </h3>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View Full Details
            </button>
          )}
        </div>

        {/* Vote Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{review.voteSummary.approve}</div>
            <div className="text-sm text-green-700 font-medium">Approve</div>
          </div>
          <div className="text-center p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{review.voteSummary.deny}</div>
            <div className="text-sm text-red-700 font-medium">Deny</div>
          </div>
          <div className="text-center p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <div className="text-3xl font-bold text-amber-600">{review.voteSummary.defer}</div>
            <div className="text-sm text-amber-700 font-medium">Defer</div>
          </div>
          <div className="text-center p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-gray-600">{review.voteSummary.abstain}</div>
            <div className="text-sm text-gray-700 font-medium">Abstain</div>
          </div>
        </div>

        {/* Individual Votes */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-3">Individual Votes:</h4>
          {review.votingMembers.map((member) => {
            const isCurrentUser = member.name === currentUser.name
            return (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                  isCurrentUser
                    ? "bg-violet-50 border-violet-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.name}
                      {isCurrentUser && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-violet-600 text-white rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{member.title}</p>
                  </div>
                </div>
                {member.vote ? (
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      member.vote === "approve"
                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                        : member.vote === "deny"
                        ? "bg-red-100 text-red-700 border-2 border-red-300"
                        : member.vote === "defer"
                        ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-300"
                    }`}
                  >
                    {member.vote.toUpperCase()}
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 border-2 border-gray-200">
                    Pending
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Chair Actions */}
      {canCloseSession && !sessionClosed && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chair Actions</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCloseSession}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Close Voting Session
            </button>
            <p className="text-sm text-gray-600">
              Close the session to finalize votes and generate the committee decision
            </p>
          </div>
        </div>
      )}

      {/* Risk Assessment Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Risk Assessment Reference</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-800">Overall Risk Score</p>
            <p className="text-2xl font-bold text-blue-900">
              {review.riskScore.toFixed(1)}/10
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-800">Risk Level</p>
            <p className="text-2xl font-bold text-blue-900 uppercase">
              {review.riskLevel}
            </p>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Vote Record
        </button>
      </div>
    </div>
  )
}
