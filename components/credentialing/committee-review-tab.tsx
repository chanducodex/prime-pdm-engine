"use client"

import { useState } from "react"
import type { CredentialingApplication, CommitteeReview, RiskFactor, RiskLevel, CommitteeDecision, CommitteeMember } from "@/lib/credentialing-types"
import { mockCommitteeReviews } from "@/lib/credentialing-mock-data"
import {
  Users,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  Calendar,
} from "lucide-react"
import type { UserContext } from "@/lib/credentialing-rbac"
import { CommitteeMeetingScheduler } from "./committee-meeting-scheduler"
import { CommitteeVotingInterface } from "./committee-voting-interface"
import { CommitteeRoleActions } from "./committee-role-actions"
import { CommitteeMeetingManager } from "./committee-meeting-manager"

interface CommitteeReviewTabProps {
  application: CredentialingApplication
  onUpdate: (application: CredentialingApplication) => void
  currentUser: UserContext
}

type ViewMode = "overview" | "voting" | "schedule_meeting" | "meetings"

export function CommitteeReviewTab({ application, currentUser }: CommitteeReviewTabProps) {
  const [review, setReview] = useState<CommitteeReview | undefined>(
    mockCommitteeReviews.find((r) => r.applicationId === application.id)
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("overview")

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "from-emerald-600 to-emerald-700"
      case "medium":
        return "from-amber-600 to-orange-600"
      case "high":
        return "from-red-600 to-rose-700"
      default:
        return "from-gray-500 to-slate-600"
    }
  }

  const getDecisionBadge = (decision: string) => {
    const config = {
      approve: { icon: CheckCircle, label: "Approved", className: "bg-green-100 text-green-700 border-green-200" },
      deny: { icon: XCircle, label: "Denied", className: "bg-red-100 text-red-700 border-red-200" },
      defer: { icon: Clock, label: "Deferred", className: "bg-gray-100 text-gray-700 border-gray-200" },
      conditional_approval: { icon: AlertTriangle, label: "Conditional Approval", className: "bg-amber-100 text-amber-700 border-amber-200" },
    }

    const decisionConfig = config[decision as keyof typeof config] || config.defer
    const Icon = decisionConfig.icon

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-2 ${decisionConfig.className}`}>
        <Icon className="w-5 h-5" />
        {decisionConfig.label}
      </span>
    )
  }

  const handleVoteSubmit = (decision: CommitteeDecision, comments?: string) => {
    if (!review) return

    // Convert decision to vote type (conditional_approval becomes defer for voting)
    const voteValue = decision === "conditional_approval" ? "defer" : decision

    // Update voting members
    const updatedMembers = review.votingMembers.map((m) =>
      m.name === currentUser.name
        ? { ...m, vote: voteValue as CommitteeMember["vote"] }
        : m
    )

    // Recalculate vote summary
    const voteSummary = {
      approve: updatedMembers.filter((m) => m.vote === "approve").length,
      deny: updatedMembers.filter((m) => m.vote === "deny").length,
      defer: updatedMembers.filter((m) => m.vote === "defer").length,
      abstain: updatedMembers.filter((m) => m.vote === "abstain").length,
    }

    // Update review
    const updatedReview = {
      ...review,
      votingMembers: updatedMembers,
      voteSummary,
      detailedNotes: comments
        ? `${review.detailedNotes}\n\n${currentUser.name} comments: ${comments}`
        : review.detailedNotes,
    }

    setReview(updatedReview)
  }

  const generateCommitteeSummary = () => {
    setIsGenerating(true)

    // Simulate API call delay
    setTimeout(() => {
      // Calculate risk factors based on application data
      const riskFactors: RiskFactor[] = []
      let totalWeightedScore = 0

      // Factor 1: License & Certification Status
      const licenseFactor: RiskFactor = {
        category: "License & Certification Verification",
        description: "State medical license, DEA registration, and board certification verified through primary sources. All credentials are current and in good standing.",
        score: 9.2,
        weight: 0.25,
        weightedScore: 2.3,
        severity: "low"
      }
      riskFactors.push(licenseFactor)
      totalWeightedScore += licenseFactor.weightedScore

      // Factor 2: Education & Training
      const educationFactor: RiskFactor = {
        category: "Education & Training",
        description: `Medical school diploma from accredited institution verified. Residency training in ${application.providerSpecialty} completed at reputable program. No gaps in training timeline.`,
        score: 8.8,
        weight: 0.15,
        weightedScore: 1.32,
        severity: "low"
      }
      riskFactors.push(educationFactor)
      totalWeightedScore += educationFactor.weightedScore

      // Factor 3: Work History & References
      const workHistoryFactor: RiskFactor = {
        category: "Work History & References",
        description: "Continuous employment history with positive references from previous employers. No gaps or concerns identified during verification process.",
        score: 9.0,
        weight: 0.20,
        weightedScore: 1.8,
        severity: "low"
      }
      riskFactors.push(workHistoryFactor)
      totalWeightedScore += workHistoryFactor.weightedScore

      // Factor 4: Sanctions & Exclusions Screening
      const sanctionsFactor: RiskFactor = {
        category: "Sanctions & Exclusions Screening",
        description: application.riskLevel === "high"
          ? "One potential match found in OIG-LEIE database requiring further investigation. Match under review by compliance team."
          : "No matches found in OIG-LEIE, SAM.gov, NPDB, or state exclusion databases. Provider cleared for all federal and state healthcare programs.",
        score: application.riskLevel === "high" ? 6.5 : 9.5,
        weight: 0.30,
        weightedScore: application.riskLevel === "high" ? 1.95 : 2.85,
        severity: application.riskLevel === "high" ? "medium" : "low"
      }
      riskFactors.push(sanctionsFactor)
      totalWeightedScore += sanctionsFactor.weightedScore

      // Factor 5: Malpractice History
      const malpracticeFactor: RiskFactor = {
        category: "Malpractice Claims History",
        description: application.riskLevel === "high"
          ? "Two malpractice claims in past 5 years. Both cases settled with modest payouts. NPDB report shows claims were related to clinical judgment issues."
          : "No malpractice claims history. Current professional liability insurance verified with adequate coverage limits ($1M/$3M).",
        score: application.riskLevel === "high" ? 7.0 : 9.2,
        weight: 0.10,
        weightedScore: application.riskLevel === "high" ? 0.7 : 0.92,
        severity: application.riskLevel === "high" ? "medium" : "low"
      }
      riskFactors.push(malpracticeFactor)
      totalWeightedScore += malpracticeFactor.weightedScore

      const finalRiskScore = totalWeightedScore
      const finalRiskLevel: RiskLevel = finalRiskScore >= 8.5 ? "low" : finalRiskScore >= 7.0 ? "medium" : "high"

      // Determine decision based on risk level
      let decision: CommitteeDecision = "approve"
      let conditions: string[] = []
      let recommendation = ""

      if (finalRiskLevel === "low") {
        decision = "approve"
        recommendation = "Committee recommends full approval without conditions. Provider meets all credentialing criteria with no areas of concern identified."
      } else if (finalRiskLevel === "medium") {
        decision = "conditional_approval"
        conditions = [
          "Focused Professional Practice Evaluation (FPPE) for initial 6 months with quarterly reviews",
          "Concurrent review of first 10 cases within specialty area",
          "Mandatory attendance at patient safety and quality improvement workshops"
        ]
        recommendation = "Committee recommends conditional approval subject to enhanced monitoring. Provider demonstrates adequate qualifications but requires additional oversight during initial practice period."
      } else {
        decision = "defer"
        recommendation = "Committee recommends deferral pending resolution of identified concerns. Additional documentation and investigation required before final determination."
      }

      // Generate voting members
      const votingMembers: CommitteeMember[] = [
        {
          id: "cm-001",
          name: "Dr. Michael Chen",
          title: "Chief Medical Officer",
          role: "Committee Chair",
          vote: decision === "defer" ? "defer" : "approve"
        },
        {
          id: "cm-002",
          name: "Dr. Sarah Martinez",
          title: "Director of Quality & Safety",
          role: "Committee Member",
          vote: finalRiskLevel === "high" ? "defer" : "approve"
        },
        {
          id: "cm-003",
          name: "Dr. James Thompson",
          title: `Department Chief - ${application.providerDepartment}`,
          role: "Committee Member",
          vote: "approve"
        },
        {
          id: "cm-004",
          name: "Nancy Williams, RN",
          title: "VP of Clinical Operations",
          role: "Committee Member",
          vote: decision === "defer" ? "defer" : "approve"
        },
        {
          id: "cm-005",
          name: "Robert Johnson, JD",
          title: "Chief Compliance Officer",
          role: "Committee Member",
          vote: finalRiskLevel === "high" ? "defer" : "approve"
        }
      ]

      const voteSummary = {
        approve: votingMembers.filter(m => m.vote === "approve").length,
        deny: votingMembers.filter(m => m.vote === "deny").length,
        defer: votingMembers.filter(m => m.vote === "defer").length,
        abstain: votingMembers.filter(m => m.vote === "abstain").length
      }

      // Generate executive summary
      const executiveSummary = `CREDENTIALING COMMITTEE EXECUTIVE SUMMARY

Provider: ${application.providerName}, ${application.providerDegree}
NPI: ${application.providerNPI}
Specialty: ${application.providerSpecialty}
Department: ${application.providerDepartment}
Application Type: ${application.cycleType === "initial" ? "Initial Credentialing" : "Re-Credentialing"}
Application Date: ${new Date(application.applicationDate).toLocaleDateString()}
Committee Meeting Date: ${new Date().toLocaleDateString()}

SUMMARY OF QUALIFICATIONS:
${application.providerName} is a ${application.providerSpecialty} specialist seeking ${application.cycleType === "initial" ? "initial" : "re-"}credentialing. The credentialing verification process has been completed in accordance with NCQA standards and institutional policy.

PRIMARY SOURCE VERIFICATION:
✓ Medical Education: Verified through ECFMG/medical school registrar
✓ Postgraduate Training: Verified through residency/fellowship program directors
✓ Board Certification: Verified through ABMS Certification Matters database
✓ State License: Verified through state medical board (expires: check documents)
✓ DEA Registration: Verified through DEA online verification
✓ Work History: Verified through previous employers and references
✓ Malpractice Insurance: Current coverage verified with carrier

SANCTIONS & EXCLUSIONS SCREENING:
${sanctionsFactor.severity === "low"
  ? "No adverse findings in OIG-LEIE, SAM.gov, NPDB, or state exclusion lists."
  : "Potential match identified requiring additional investigation. Compliance review in progress."}

RISK ASSESSMENT:
Overall Risk Score: ${finalRiskScore.toFixed(1)}/10 (${finalRiskLevel.toUpperCase()} risk)
The risk assessment considers licensure status, education verification, work history, sanctions screening, and malpractice history. ${finalRiskLevel === "low" ? "All factors indicate low risk profile." : finalRiskLevel === "medium" ? "Some factors warrant enhanced monitoring during initial practice period." : "Multiple factors require additional investigation before final determination."}

COMMITTEE RECOMMENDATION:
${recommendation}

${conditions.length > 0 ? `CONDITIONS OF APPROVAL:\n${conditions.map((c, i) => `${i + 1}. ${c}`).join("\n")}` : ""}

COMMITTEE VOTE:
Approve: ${voteSummary.approve} | Deny: ${voteSummary.deny} | Defer: ${voteSummary.defer} | Abstain: ${voteSummary.abstain}

${decision === "approve" ? `FINAL DETERMINATION: APPROVED
Effective Date: ${new Date().toLocaleDateString()}
Approval Authority: Credentialing Committee
Next Re-credentialing Due: ${new Date(new Date().setMonth(new Date().getMonth() + 24)).toLocaleDateString()}` : decision === "conditional_approval" ? `FINAL DETERMINATION: CONDITIONAL APPROVAL
Conditions must be satisfied before full privileges are granted.
Enhanced monitoring period: 6 months from start date
Next review: 6 months` : `FINAL DETERMINATION: DEFERRED
Additional information/investigation required before final decision.
Target review date: 30 days from committee meeting`}`

      const generatedReview: CommitteeReview = {
        id: `review-${application.id}`,
        applicationId: application.id,
        committeeId: "cred-comm-001",
        committeeName: "Hospital Credentialing Committee",
        meetingDate: new Date().toISOString(),
        reviewDate: new Date().toISOString(),
        decision,
        riskScore: finalRiskScore,
        riskLevel: finalRiskLevel,
        riskFactors,
        recommendation,
        conditions,
        votingMembers,
        voteSummary,
        executiveSummary,
        detailedNotes: "Comprehensive credentialing review completed. All required documents verified through primary sources. Application meets institutional standards.",
        approvedBy: decision === "approve" ? "Dr. Michael Chen, Chief Medical Officer" : null,
        approvalDate: decision === "approve" ? new Date().toISOString() : null
      }

      setReview(generatedReview)
      setIsGenerating(false)
    }, 1500)
  }

  // View mode rendering
  if (viewMode === "voting" && review) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setViewMode("overview")}
            className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            ← Back to Overview
          </button>
        </div>
        <CommitteeVotingInterface
          applicationId={application.id}
          applicationProvider={application.providerName}
          review={review}
          currentUser={currentUser}
          onVoteSubmit={handleVoteSubmit}
          onViewDetails={() => setViewMode("overview")}
        />
      </div>
    )
  }

  if (viewMode === "schedule_meeting") {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setViewMode("overview")}
            className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            ← Back to Overview
          </button>
        </div>
        <CommitteeMeetingScheduler
          application={application}
          onSave={(meeting) => {
            console.log("Meeting saved:", meeting)
            setViewMode("overview")
          }}
          onCancel={() => setViewMode("overview")}
          currentUser={currentUser}
        />
      </div>
    )
  }

  if (viewMode === "meetings") {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setViewMode("overview")}
            className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            ← Back to Overview
          </button>
        </div>
        <CommitteeMeetingManager currentUser={currentUser} />
      </div>
    )
  }

  if (!review) {
    return (
      <div className="space-y-6">
        <CommitteeRoleActions
          application={application}
          review={review}
          currentUser={currentUser}
          onGenerateSummary={generateCommitteeSummary}
          onSubmitVote={handleVoteSubmit}
          onScheduleMeeting={() => setViewMode("schedule_meeting")}
        />
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Awaiting Committee Review</h3>
          <p className="text-sm text-gray-600 mb-4">
            This application will be reviewed by the credentialing committee once PSV and sanctions screening are complete.
          </p>
          <button
            onClick={generateCommitteeSummary}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 inline mr-2" />
                Generate Committee Summary
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Role-Based Actions */}
      <CommitteeRoleActions
        application={application}
        review={review}
        currentUser={currentUser}
        onGenerateSummary={generateCommitteeSummary}
        onSubmitVote={handleVoteSubmit}
        onScheduleMeeting={() => setViewMode("schedule_meeting")}
        onViewMeetings={() => setViewMode("meetings")}
        onExport={() => console.log("Exporting summary...")}
        onSendToProvider={() => console.log("Sending to provider...")}
      />

      {/* View Mode Toggle */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
        <button
          onClick={() => setViewMode("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "overview"
              ? "bg-violet-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          Overview
        </button>
        {review && (
          <button
            onClick={() => setViewMode("voting")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "voting"
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Voting Session
          </button>
        )}
        <button
          onClick={() => setViewMode("schedule_meeting")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            (viewMode as string) === "schedule_meeting"
              ? "bg-violet-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Schedule Meeting
        </button>
        <button
          onClick={() => setViewMode("meetings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            (viewMode as string) === "meetings"
              ? "bg-violet-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          All Meetings
        </button>
      </div>

      {/* Review Summary */}
      <div className={`bg-gradient-to-r ${getRiskColor(review.riskLevel)} text-white rounded-lg p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">Risk Score: {review.riskScore.toFixed(1)} / 10</h3>
            <p className="text-white/90 text-lg font-semibold mb-1">Risk Level: {review.riskLevel.toUpperCase()}</p>
            <p className="text-white/80 text-sm">
              Committee Meeting: {new Date(review.meetingDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            {getDecisionBadge(review.decision)}
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white/90 text-sm font-medium mb-1">Recommendation:</p>
          <p className="text-white text-base">{review.recommendation}</p>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          Risk Assessment Breakdown
        </h3>
        <div className="space-y-3">
          {review.riskFactors.map((factor, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{factor.category}</h4>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    factor.severity === "high"
                      ? "bg-red-100 text-red-700"
                      : factor.severity === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {factor.severity.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    Score: {factor.weightedScore.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Base Score: {factor.score}/10</span>
                <span>Weight: {(factor.weight * 100).toFixed(0)}%</span>
                <span>Weighted: {factor.weightedScore.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          Executive Summary
        </h3>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {review.executiveSummary}
          </pre>
        </div>
      </div>

      {/* Voting Results */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Committee Vote</h3>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{review.voteSummary.approve}</div>
            <div className="text-sm text-green-700 font-medium">Approve</div>
          </div>
          <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{review.voteSummary.deny}</div>
            <div className="text-sm text-red-700 font-medium">Deny</div>
          </div>
          <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-3xl font-bold text-amber-600">{review.voteSummary.defer}</div>
            <div className="text-sm text-amber-700 font-medium">Defer</div>
          </div>
          <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-gray-600">{review.voteSummary.abstain}</div>
            <div className="text-sm text-gray-700 font-medium">Abstain</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-2">Voting Members:</h4>
          {review.votingMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-600">{member.title}</p>
              </div>
              {member.vote && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  member.vote === "approve"
                    ? "bg-green-100 text-green-700"
                    : member.vote === "deny"
                    ? "bg-red-100 text-red-700"
                    : member.vote === "defer"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {member.vote.toUpperCase()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conditions (if any) */}
      {review.conditions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Approval Conditions
          </h3>
          <ul className="space-y-2">
            {review.conditions.map((condition, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="font-bold">{idx + 1}.</span>
                <span>{condition}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Approval Information */}
      {review.approvedBy && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Final Approval</h3>
              <p className="text-sm text-green-800">
                <span className="font-medium">Approved by:</span> {review.approvedBy}
              </p>
              <p className="text-sm text-green-800">
                <span className="font-medium">Date:</span> {review.approvalDate ? new Date(review.approvalDate).toLocaleDateString() : ""}
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-green-600 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
              <Download className="w-4 h-4 inline mr-2" />
              Download Decision Letter
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <FileText className="w-4 h-4 inline mr-2" />
          Generate Minutes
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors">
          <Download className="w-4 h-4 inline mr-2" />
          Export Summary
        </button>
      </div>
    </div>
  )
}
