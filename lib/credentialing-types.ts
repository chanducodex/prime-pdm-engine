/**
 * Credentialing-as-a-Service (CaaS) Type Definitions
 * Atlas PRIME - Provider Credentialing Module
 *
 * This module integrates with the Provider Data Management system to enable
 * comprehensive credentialing workflows aligned with NCQA standards.
 */

// Note: Provider types are imported in credentialing-mock-data.ts for data generation
// This module defines standalone credentialing types that reference provider IDs

// ============================================================================
// Credentialing Status & Workflow
// ============================================================================

export type CredentialingStatus =
  | "not_started"
  | "documents_pending"
  | "documents_received"
  | "extraction_in_progress"
  | "psv_in_progress"
  | "sanctions_screening"
  | "committee_review"
  | "approved"
  | "denied"
  | "conditional_approval"
  | "deferred"
  | "expired"
  | "recredentialing_due"

export type CredentialingCycleType = "initial" | "recredentialing"

export type RiskLevel = "low" | "medium" | "high"

export type CredentialingPriority = "routine" | "expedited" | "urgent"

// ============================================================================
// Provider Snapshot - Captured at application time for audit trail
// ============================================================================

export interface ProviderSnapshot {
  provider_Id: number
  npi: number
  firstName: string
  lastName: string
  middleName: string
  degree: string
  specialty: string
  department: string
  providerType: string
  affiliationStatus: string
  currentCredStatus: string
  currentExpDate: string
  initialApprovalDate: string
}

export interface CredentialingApplication {
  id: string
  providerId: number
  providerName: string
  providerNPI: number
  // Enhanced provider context
  providerSnapshot: ProviderSnapshot
  providerDegree: string
  providerSpecialty: string
  providerDepartment: string
  affiliationStatus: string
  // Application details
  cycleType: CredentialingCycleType
  status: CredentialingStatus
  currentStep: string
  applicationDate: string
  targetCompletionDate: string
  actualCompletionDate: string | null
  expirationDate: string | null
  nextRecredentialingDate: string | null
  daysRemaining: number
  progressPercentage: number
  assignedTo: string
  // Priority & SLA tracking
  priority: CredentialingPriority
  slaDeadline: string
  ncqaDeadline: string // 120-day NCQA timeline
  // Risk assessment
  riskScore: number
  riskLevel: RiskLevel
  riskFactorSummary: string[]
  // Workflow tracking
  alerts: CredentialingAlert[]
  notes: string[]
  auditLog: AuditLogEntry[]
  createdAt: string
  updatedAt: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  performedBy: string
  details: string
  previousValue?: string
  newValue?: string
}

export interface CredentialingAlert {
  id: string
  type: "warning" | "error" | "info" | "success"
  category: "expiration" | "psv_delay" | "sanction_match" | "missing_document" | "discrepancy"
  message: string
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  resolvedAt: string | null
}

// ============================================================================
// Document Management
// ============================================================================

export type DocumentType =
  | "state_license"
  | "dea_registration"
  | "board_certification"
  | "cv_resume"
  | "medical_school_diploma"
  | "residency_certificate"
  | "fellowship_certificate"
  | "malpractice_insurance"
  | "work_verification"
  | "other"

export type DocumentStatus = "pending_upload" | "uploaded" | "extracted" | "verified" | "expired" | "rejected"

export interface CredentialingDocument {
  id: string
  applicationId: string
  type: DocumentType
  name: string
  fileName: string
  fileSize: number
  uploadDate: string
  status: DocumentStatus
  extractedData: ExtractedCredentialData | null
  verificationStatus: "not_verified" | "verified" | "discrepancy"
  uploadedBy: string
  notes: string
}

export interface ExtractedCredentialData {
  documentType: DocumentType
  extractionDate: string
  confidence: number
  fields: Record<string, any>
  alerts: string[]
  // Specific extracted data based on document type
  license?: {
    number: string
    state: string
    issueDate: string
    expirationDate: string
    status: string
    specialty: string
  }
  dea?: {
    number: string
    issueDate: string
    expirationDate: string
    status: string
    schedules: string[]
  }
  boardCertification?: {
    board: string
    specialty: string
    certificationDate: string
    expirationDate: string
    status: "board_certified" | "board_eligible" | "not_certified"
  }
  education?: {
    type: "medical_school" | "residency" | "fellowship"
    institution: string
    graduationYear: number
    specialty?: string
  }
  workHistory?: {
    employer: string
    title: string
    startDate: string
    endDate: string | "present"
  }[]
  malpracticeInsurance?: {
    carrier: string
    policyNumber: string
    coverageAmount: string
    issueDate: string
    expirationDate: string
    coverageType: "claims_made" | "occurrence"
  }
}

// ============================================================================
// Primary Source Verification (PSV)
// ============================================================================

export type PSVStatus =
  | "not_started"
  | "requested"
  | "in_progress"
  | "verified"
  | "discrepancy"
  | "unable_to_verify"
  | "expired"

export type PSVSourceType =
  | "state_medical_board"
  | "dea"
  | "abms_certifacts"
  | "medical_school"
  | "employer"
  | "insurance_carrier"
  | "hospital"

export interface PSVRequest {
  id: string
  applicationId: string
  credentialType: DocumentType
  sourceType: PSVSourceType
  sourceName: string
  contactEmail: string
  status: PSVStatus
  requestDate: string
  expectedResponseDate: string
  actualResponseDate: string | null
  verificationResult: PSVVerificationResult | null
  followUpCount: number
  lastFollowUpDate: string | null
  notes: string[]
  priority: "normal" | "high" | "urgent"
}

export interface PSVVerificationResult {
  verified: boolean
  verificationDate: string
  verifiedBy: string
  dataMatches: boolean
  discrepancies: string[]
  verifiedData: Record<string, any>
  confidenceLevel: number
  documentation: string[]
}

// ============================================================================
// Sanctions & Exclusions Screening
// ============================================================================

export type SanctionDatabase =
  | "oig_leie"
  | "sam_gov"
  | "npdb"
  | "state_medicaid"
  | "state_medical_board"

export type SanctionMatchConfidence = "high" | "medium" | "low"

export interface SanctionsScreening {
  id: string
  applicationId: string
  providerId: number
  screeningDate: string
  databases: SanctionDatabase[]
  matchesFound: SanctionMatch[]
  status: "clear" | "matches_found" | "under_review" | "resolved"
  screenedBy: string
  notes: string[]
}

export interface SanctionMatch {
  id: string
  database: SanctionDatabase
  matchType: "name" | "npi" | "ssn" | "license"
  confidence: SanctionMatchConfidence
  matchedEntity: {
    name: string
    npi?: string
    license?: string
    exclusionType: string
    exclusionDate: string
    reason: string
  }
  isFalsePositive: boolean
  investigationStatus: "pending" | "investigating" | "confirmed" | "false_positive"
  resolution: string | null
  resolvedDate: string | null
  resolvedBy: string | null
}

// ============================================================================
// Committee Review & Decision
// ============================================================================

export type CommitteeDecision = "approve" | "deny" | "defer" | "conditional_approval"

export interface CommitteeReview {
  id: string
  applicationId: string
  committeeId: string
  committeeName: string
  meetingDate: string
  reviewDate: string
  decision: CommitteeDecision
  riskScore: number
  riskLevel: RiskLevel
  riskFactors: RiskFactor[]
  recommendation: string
  conditions: string[]
  votingMembers: CommitteeMember[]
  voteSummary: {
    approve: number
    deny: number
    defer: number
    abstain: number
  }
  executiveSummary: string
  detailedNotes: string
  approvedBy: string | null
  approvalDate: string | null
}

export interface RiskFactor {
  category: string
  description: string
  score: number
  weight: number
  weightedScore: number
  severity: "low" | "medium" | "high"
}

export interface CommitteeMember {
  id: string
  name: string
  title: string
  role: string
  vote: "approve" | "deny" | "defer" | "abstain" | null
}

// ============================================================================
// Re-Credentialing Cycle
// ============================================================================

export type RecredentialingStatus =
  | "not_due"
  | "notice_sent"
  | "awaiting_submission"
  | "submitted"
  | "in_review"
  | "completed"
  | "overdue"

export interface RecredentialingCycle {
  id: string
  providerId: number
  priorApplicationId: string
  currentApplicationId: string | null
  cycleNumber: number
  priorApprovalDate: string
  expirationDate: string
  noticeDate: string
  submissionDeadline: string
  status: RecredentialingStatus
  daysSinceNotice: number
  daysUntilExpiration: number
  isOverdue: boolean
  fastTrackEligible: boolean
  changesReported: boolean
  materialChanges: string[]
  outreachHistory: OutreachAttempt[]
}

export interface OutreachAttempt {
  id: string
  date: string
  method: "email" | "phone" | "mail" | "portal_notification"
  contactedBy: string
  response: string | null
  responseDate: string | null
}

// ============================================================================
// Dashboard & Analytics
// ============================================================================

export interface CredentialingMetrics {
  totalApplications: number
  byStatus: Record<CredentialingStatus, number>
  avgTimeToApproval: number
  approvalRate: number
  psvCompletionRate: number
  sanctionsMatches: number
  overdueRecredentialing: number
  upcomingExpirations: number
  committeeBacklog: number
}

export interface CredentialingTimeline {
  applicationReceived: string
  documentsUploaded: string | null
  extractionCompleted: string | null
  psvInitiated: string | null
  psvCompleted: string | null
  sanctionsCleared: string | null
  committeeReview: string | null
  decision: string | null
  providerNotified: string | null
}
