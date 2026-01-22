// Workflow management for credentialing applications

import type { CredentialingApplication, CredentialingStatus } from "./credentialing-types"
import { CredentialingAction, type UserContext, hasPermission } from "./credentialing-rbac"

export interface WorkflowAction {
  id: string
  label: string
  description: string
  nextStatus: CredentialingStatus
  requiredPermission: CredentialingAction
  variant: "primary" | "secondary" | "success" | "danger" | "warning"
  confirmMessage?: string
}

// Define available workflow transitions
export const getAvailableWorkflowActions = (
  application: CredentialingApplication,
  user: UserContext
): WorkflowAction[] => {
  const actions: WorkflowAction[] = []

  switch (application.status) {
    case "not_started":
    case "documents_pending":
      if (hasPermission(user, CredentialingAction.ADVANCE_STATUS)) {
        actions.push({
          id: "start_extraction",
          label: "Start AI Extraction",
          description: "Begin automated data extraction from uploaded documents",
          nextStatus: "extraction_in_progress",
          requiredPermission: CredentialingAction.ADVANCE_STATUS,
          variant: "primary",
        })
      }
      break

    case "documents_received":
    case "extraction_in_progress":
      if (hasPermission(user, CredentialingAction.ADVANCE_STATUS)) {
        actions.push({
          id: "send_to_psv",
          label: "Send to PSV",
          description: "Initiate primary source verification",
          nextStatus: "psv_in_progress",
          requiredPermission: CredentialingAction.SEND_PSV_REQUESTS,
          variant: "primary",
        })
      }
      if (hasPermission(user, CredentialingAction.REQUEST_MORE_INFO)) {
        actions.push({
          id: "request_more_docs",
          label: "Request More Documents",
          description: "Send back to provider for additional documentation",
          nextStatus: "documents_pending",
          requiredPermission: CredentialingAction.REQUEST_MORE_INFO,
          variant: "warning",
        })
      }
      break

    case "psv_in_progress":
      if (hasPermission(user, CredentialingAction.ADVANCE_STATUS)) {
        actions.push({
          id: "psv_complete",
          label: "Mark PSV Complete",
          description: "All verifications received and confirmed",
          nextStatus: "sanctions_screening",
          requiredPermission: CredentialingAction.MARK_PSV_VERIFIED,
          variant: "success",
        })
      }
      break

    case "sanctions_screening":
      if (hasPermission(user, CredentialingAction.SUBMIT_TO_COMMITTEE)) {
        actions.push({
          id: "submit_committee",
          label: "Submit to Committee",
          description: "Ready for committee review and decision",
          nextStatus: "committee_review",
          requiredPermission: CredentialingAction.SUBMIT_TO_COMMITTEE,
          variant: "primary",
        })
      }
      if (hasPermission(user, CredentialingAction.ESCALATE_FINDING)) {
        actions.push({
          id: "escalate_sanctions",
          label: "Escalate to Compliance",
          description: "Sanctions match requires compliance review",
          nextStatus: "sanctions_screening",
          requiredPermission: CredentialingAction.ESCALATE_FINDING,
          variant: "danger",
        })
      }
      break

    case "committee_review":
      if (hasPermission(user, CredentialingAction.FINAL_APPROVE)) {
        actions.push({
          id: "approve",
          label: "Approve",
          description: "Grant credentialing privileges",
          nextStatus: "approved",
          requiredPermission: CredentialingAction.FINAL_APPROVE,
          variant: "success",
          confirmMessage: "Are you sure you want to approve this application?",
        })
        actions.push({
          id: "conditional_approve",
          label: "Conditional Approval",
          description: "Approve with specific conditions",
          nextStatus: "conditional_approval",
          requiredPermission: CredentialingAction.FINAL_APPROVE,
          variant: "warning",
        })
      }
      if (hasPermission(user, CredentialingAction.FINAL_DENY)) {
        actions.push({
          id: "deny",
          label: "Deny",
          description: "Deny credentialing application",
          nextStatus: "denied",
          requiredPermission: CredentialingAction.FINAL_DENY,
          variant: "danger",
          confirmMessage: "Are you sure you want to deny this application? This action requires documentation.",
        })
      }
      if (hasPermission(user, CredentialingAction.REQUEST_MORE_INFO)) {
        actions.push({
          id: "defer",
          label: "Defer Decision",
          description: "Table for future committee meeting",
          nextStatus: "committee_review",
          requiredPermission: CredentialingAction.SUBMIT_REVIEW,
          variant: "secondary",
        })
      }
      break

    case "conditional_approval":
      if (hasPermission(user, CredentialingAction.FINAL_APPROVE)) {
        actions.push({
          id: "full_approve",
          label: "Grant Full Approval",
          description: "Conditions met, grant full privileges",
          nextStatus: "approved",
          requiredPermission: CredentialingAction.FINAL_APPROVE,
          variant: "success",
        })
      }
      break

    case "approved":
    case "denied":
      // Terminal states - no workflow actions
      break

    case "recredentialing_due":
      if (hasPermission(user, CredentialingAction.ADVANCE_STATUS)) {
        actions.push({
          id: "start_recred",
          label: "Start Re-credentialing",
          description: "Begin 3-year re-credentialing cycle",
          nextStatus: "documents_pending",
          requiredPermission: CredentialingAction.ADVANCE_STATUS,
          variant: "primary",
        })
      }
      break
  }

  return actions
}

// Get status display info
export const getStatusDisplayInfo = (status: CredentialingStatus) => {
  const statusInfo: Record<CredentialingStatus, { label: string; color: string; icon: string }> = {
    not_started: { label: "Not Started", color: "gray", icon: "circle" },
    documents_pending: { label: "Documents Pending", color: "amber", icon: "clock" },
    documents_received: { label: "Documents Received", color: "blue", icon: "file" },
    extraction_in_progress: { label: "AI Extraction", color: "purple", icon: "sparkles" },
    psv_in_progress: { label: "PSV In Progress", color: "blue", icon: "search" },
    sanctions_screening: { label: "Sanctions Screening", color: "indigo", icon: "shield" },
    committee_review: { label: "Committee Review", color: "violet", icon: "users" },
    approved: { label: "Approved", color: "green", icon: "check" },
    denied: { label: "Denied", color: "red", icon: "x" },
    conditional_approval: { label: "Conditional Approval", color: "orange", icon: "alert" },
    deferred: { label: "Deferred", color: "yellow", icon: "pause" },
    expired: { label: "Expired", color: "red", icon: "clock-alert" },
    recredentialing_due: { label: "Re-credentialing Due", color: "orange", icon: "refresh" },
  }
  return statusInfo[status] || statusInfo.not_started
}

// Check if application can be edited
export const canEditApplication = (application: CredentialingApplication, user: UserContext): boolean => {
  // Can't edit terminal states
  if (["approved", "denied"].includes(application.status)) {
    return false
  }
  return hasPermission(user, CredentialingAction.EDIT_APPLICATION)
}

// Check if documents can be uploaded
export const canUploadDocuments = (application: CredentialingApplication, user: UserContext): boolean => {
  // Can only upload in early stages
  if (!["not_started", "documents_pending", "documents_received"].includes(application.status)) {
    return false
  }
  return hasPermission(user, CredentialingAction.UPLOAD_DOCUMENTS)
}
