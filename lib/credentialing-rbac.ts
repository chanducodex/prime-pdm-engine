// Role-Based Access Control for Credentialing Module

export enum CredentialingRole {
  COORDINATOR = "coordinator",
  SPECIALIST = "specialist",
  ANALYST = "analyst",
  COMMITTEE_MEMBER = "committee_member",
  COMMITTEE_CHAIR = "committee_chair",
  COMPLIANCE = "compliance",
  MEDICAL_DIRECTOR = "medical_director",
  ADMIN = "admin",
}

export enum CredentialingAction {
  // View permissions
  VIEW_APPLICATIONS = "view_applications",
  VIEW_DOCUMENTS = "view_documents",
  VIEW_PSV = "view_psv",
  VIEW_SANCTIONS = "view_sanctions",

  // Document actions
  UPLOAD_DOCUMENTS = "upload_documents",
  APPROVE_DOCUMENTS = "approve_documents",
  REJECT_DOCUMENTS = "reject_documents",
  REQUEST_REUPLOAD = "request_reupload",

  // PSV actions
  SEND_PSV_REQUESTS = "send_psv_requests",
  UPDATE_PSV_STATUS = "update_psv_status",
  MARK_PSV_VERIFIED = "mark_psv_verified",
  SEND_PSV_FOLLOWUP = "send_psv_followup",

  // Sanctions actions
  RUN_SANCTIONS_SCREENING = "run_sanctions_screening",
  CLEAR_FALSE_POSITIVE = "clear_false_positive",
  ESCALATE_FINDING = "escalate_finding",

  // Workflow actions
  ADVANCE_STATUS = "advance_status",
  SUBMIT_TO_COMMITTEE = "submit_to_committee",
  REQUEST_MORE_INFO = "request_more_info",

  // Committee actions
  VOTE_ON_APPLICATION = "vote_on_application",
  SUBMIT_REVIEW = "submit_review",
  ADD_CONDITIONS = "add_conditions",
  FINAL_APPROVE = "final_approve",
  FINAL_DENY = "final_deny",

  // Admin actions
  REASSIGN = "reassign",
  DELETE_APPLICATION = "delete_application",
  EDIT_APPLICATION = "edit_application",
  EXPORT_REPORT = "export_report",
}

// Permission matrix: Role -> Allowed Actions
const ROLE_PERMISSIONS: Record<CredentialingRole, CredentialingAction[]> = {
  [CredentialingRole.COORDINATOR]: [
    CredentialingAction.VIEW_APPLICATIONS,
    CredentialingAction.VIEW_DOCUMENTS,
    CredentialingAction.UPLOAD_DOCUMENTS,
    CredentialingAction.EXPORT_REPORT,
  ],

  [CredentialingRole.SPECIALIST]: [
    CredentialingAction.VIEW_APPLICATIONS,
    CredentialingAction.VIEW_DOCUMENTS,
    CredentialingAction.VIEW_PSV,
    CredentialingAction.UPLOAD_DOCUMENTS,
    CredentialingAction.APPROVE_DOCUMENTS,
    CredentialingAction.REJECT_DOCUMENTS,
    CredentialingAction.REQUEST_REUPLOAD,
    CredentialingAction.SEND_PSV_REQUESTS,
    CredentialingAction.UPDATE_PSV_STATUS,
    CredentialingAction.MARK_PSV_VERIFIED,
    CredentialingAction.SEND_PSV_FOLLOWUP,
    CredentialingAction.ADVANCE_STATUS,
    CredentialingAction.SUBMIT_TO_COMMITTEE,
    CredentialingAction.REQUEST_MORE_INFO,
    CredentialingAction.REASSIGN,
    CredentialingAction.EDIT_APPLICATION,
    CredentialingAction.EXPORT_REPORT,
  ],

  [CredentialingRole.ANALYST]: [
    CredentialingAction.VIEW_APPLICATIONS,
    CredentialingAction.VIEW_DOCUMENTS,
    CredentialingAction.VIEW_PSV,
    CredentialingAction.VIEW_SANCTIONS,
    CredentialingAction.APPROVE_DOCUMENTS,
    CredentialingAction.REJECT_DOCUMENTS,
    CredentialingAction.SEND_PSV_REQUESTS,
    CredentialingAction.UPDATE_PSV_STATUS,
    CredentialingAction.RUN_SANCTIONS_SCREENING,
    CredentialingAction.CLEAR_FALSE_POSITIVE,
    CredentialingAction.ADVANCE_STATUS,
    CredentialingAction.SUBMIT_TO_COMMITTEE,
    CredentialingAction.REASSIGN,
    CredentialingAction.EXPORT_REPORT,
  ],

  [CredentialingRole.COMMITTEE_MEMBER]: [
    CredentialingAction.VIEW_APPLICATIONS,
    CredentialingAction.VIEW_DOCUMENTS,
    CredentialingAction.VIEW_PSV,
    CredentialingAction.VIEW_SANCTIONS,
    CredentialingAction.VOTE_ON_APPLICATION,
    CredentialingAction.SUBMIT_REVIEW,
    CredentialingAction.ADD_CONDITIONS,
    CredentialingAction.EXPORT_REPORT,
  ],

  [CredentialingRole.COMMITTEE_CHAIR]: [
    CredentialingAction.VIEW_APPLICATIONS,
    CredentialingAction.VIEW_DOCUMENTS,
    CredentialingAction.VIEW_PSV,
    CredentialingAction.VIEW_SANCTIONS,
    CredentialingAction.VOTE_ON_APPLICATION,
    CredentialingAction.SUBMIT_REVIEW,
    CredentialingAction.ADD_CONDITIONS,
    CredentialingAction.FINAL_APPROVE,
    CredentialingAction.FINAL_DENY,
    CredentialingAction.REASSIGN,
    CredentialingAction.EXPORT_REPORT,
  ],

  [CredentialingRole.COMPLIANCE]: [
    CredentialingAction.VIEW_APPLICATIONS,
    CredentialingAction.VIEW_DOCUMENTS,
    CredentialingAction.VIEW_PSV,
    CredentialingAction.VIEW_SANCTIONS,
    CredentialingAction.RUN_SANCTIONS_SCREENING,
    CredentialingAction.CLEAR_FALSE_POSITIVE,
    CredentialingAction.ESCALATE_FINDING,
    CredentialingAction.EXPORT_REPORT,
  ],

  [CredentialingRole.MEDICAL_DIRECTOR]: [
    CredentialingAction.VIEW_APPLICATIONS,
    CredentialingAction.VIEW_DOCUMENTS,
    CredentialingAction.VIEW_PSV,
    CredentialingAction.VIEW_SANCTIONS,
    CredentialingAction.SUBMIT_REVIEW,
    CredentialingAction.FINAL_APPROVE,
    CredentialingAction.FINAL_DENY,
    CredentialingAction.EXPORT_REPORT,
  ],

  [CredentialingRole.ADMIN]: Object.values(CredentialingAction),
}

export interface UserContext {
  userId: string
  name: string
  email: string
  role: CredentialingRole
  department?: string
}

// Permission check helper
export const hasPermission = (user: UserContext, action: CredentialingAction): boolean => {
  const permissions = ROLE_PERMISSIONS[user.role]
  return permissions.includes(action)
}

// Check multiple permissions (user must have ALL)
export const hasAllPermissions = (user: UserContext, actions: CredentialingAction[]): boolean => {
  return actions.every((action) => hasPermission(user, action))
}

// Check multiple permissions (user must have ANY)
export const hasAnyPermission = (user: UserContext, actions: CredentialingAction[]): boolean => {
  return actions.some((action) => hasPermission(user, action))
}

// Get user's role display name
export const getRoleDisplayName = (role: CredentialingRole): string => {
  const names: Record<CredentialingRole, string> = {
    [CredentialingRole.COORDINATOR]: "Credentialing Coordinator",
    [CredentialingRole.SPECIALIST]: "Credentialing Specialist",
    [CredentialingRole.ANALYST]: "Credentialing Analyst",
    [CredentialingRole.COMMITTEE_MEMBER]: "Committee Member",
    [CredentialingRole.COMMITTEE_CHAIR]: "Committee Chair",
    [CredentialingRole.COMPLIANCE]: "Compliance Officer",
    [CredentialingRole.MEDICAL_DIRECTOR]: "Medical Director",
    [CredentialingRole.ADMIN]: "Administrator",
  }
  return names[role]
}

// Mock user for development (would come from auth context in production)
export const getMockUser = (): UserContext => {
  return {
    userId: "user-001",
    name: "Sarah Lee",
    email: "sarah.lee@hospital.com",
    role: CredentialingRole.COMMITTEE_CHAIR, // Change this to test different roles
    department: "Credentialing Services",
  }
}
