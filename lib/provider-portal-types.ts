/**
 * Provider Credentialing Portal Types
 * Handles provider-side credentialing workflows, authentication, and document management
 */

export enum ProviderCredentialStatus {
  NOT_STARTED = "not_started",
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  DOCUMENTS_REQUESTED = "documents_requested",
  COMMITTEE_REVIEW = "committee_review",
  APPROVED = "approved",
  DENIED = "denied",
  CONDITIONAL_APPROVAL = "conditional_approval",
  DEFERRED = "deferred",
  EXPIRED = "expired",
}

export enum ProviderRole {
  PROVIDER = "provider",
  COMMITTEE_MEMBER = "committee_member",
  COMMITTEE_CHAIR = "committee_chair",
  ADMIN = "admin",
}

export interface ProviderUser {
  id: string
  providerId: number
  email: string
  tempPassword?: string
  hasSetPassword: boolean
  firstName: string
  lastName: string
  role: ProviderRole
  department?: string
  lastLogin?: string
  createdAt: string
}

export interface ProviderCredentialingApplication {
  id: string
  providerId: number
  providerName: string
  providerEmail: string
  status: ProviderCredentialStatus
  applicationType: "initial" | "recredentialing" | "update"
  submittedDate?: string
  lastUpdated: string
  documents: ProviderDocument[]
  pendingActions: PendingAction[]
  committeeReview?: CommitteeReviewInfo
  expirationDate?: string
}

export interface ProviderDocument {
  id: string
  documentType: string
  fileName: string
  uploadedDate: string
  status: "approved" | "rejected" | "pending" | "reupload_required"
  rejectionReason?: string
  fileSize: number
  fileUrl: string
}

export interface PendingAction {
  id: string
  type: "document_upload" | "information_update" | "payment_required" | "signature_required"
  description: string
  dueDate?: string
  priority: "low" | "medium" | "high" | "urgent"
  completed: boolean
  documentType?: string
}

export interface CommitteeReviewInfo {
  meetingDate?: string
  decision?: "approved" | "denied" | "conditional" | "deferred"
  decisionDate?: string
  conditions?: string[]
  notes?: string
  nextSteps?: string[]
}

// Email Notification Types
export type CredentialingEmailType =
  | "application_initiated"
  | "document_requested"
  | "document_rejected"
  | "committee_review"
  | "approval"
  | "denial"
  | "conditional_approval"
  | "expiration_reminder"

export interface CredentialingEmail {
  to: string
  providerName: string
  applicationId: string
  type: CredentialingEmailType
  tempPassword?: string
  tempCredentials?: {
    username: string
    password: string
    portalUrl: string
    setPasswordUrl: string
  }
  documentsRequested?: string[]
  dueDate?: string
  meetingDetails?: {
    date: string
    time: string
    location: string
  }
  customMessage?: string
  // Document rejection specific fields
  documentName?: string
  documentType?: string
  rejectionReason?: string
  reuploadDeadline?: string
}

// Portal Configuration
export interface PortalConfig {
  allowTempPassword: boolean
  requirePasswordChange: boolean
  passwordExpiryDays: number
  allowDocumentUpload: boolean
  maxDocumentSize: number // in MB
  allowedDocumentTypes: string[]
  supportEmail: string
  supportPhone: string
}
