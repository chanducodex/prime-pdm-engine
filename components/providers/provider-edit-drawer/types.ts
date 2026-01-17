import type { Provider } from "@/lib/provider-types"

/**
 * Tab configuration for the edit drawer
 */
export interface TabConfig {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * Field configuration for editable fields
 */
export interface FieldDefinition {
  path: string
  label: string
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox"
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
  colSpan?: 1 | 2 | 3
  disabled?: boolean
  validation?: ValidationRule[]
}

/**
 * Section configuration for collapsible sections
 */
export interface SectionConfig {
  key: string
  title: string
  fields?: FieldDefinition[]
  columns?: 1 | 2 | 3
  defaultExpanded?: boolean
}

/**
 * Validation rule definition
 */
export interface ValidationRule {
  type: "required" | "minLength" | "maxLength" | "pattern" | "custom"
  message: string
  value?: string | number | RegExp
  validator?: (value: unknown) => boolean
}

/**
 * Field change tracking
 */
export interface FieldChange {
  path: string
  originalValue: unknown
  currentValue: unknown
  timestamp: Date
}

/**
 * Edit drawer state
 */
export interface EditDrawerState {
  activeTab: string
  tabSearchTerms: Record<string, string>
  validationErrors: Record<string, string>
  isSaving: boolean
  pendingDelete: {
    type: string
    path: string
    name: string
  } | null
  addRecordModal: {
    isOpen: boolean
    recordType: string
    parentPath?: string
  } | null
}

/**
 * Provider edit state from hook
 */
export interface ProviderEditState {
  editedProvider: Provider
  originalProvider: Provider
  modifiedFields: Set<string>
  updateField: (path: string, value: unknown) => void
  revertField: (path: string) => void
  revertAll: () => void
  isFieldModified: (path: string) => boolean
  getOriginalValue: <T = unknown>(path: string) => T | undefined
  isDirty: boolean
  addArrayItem: (path: string, item: unknown) => void
  removeArrayItem: (path: string, index: number) => void
}

/**
 * Record type configurations for add modal
 */
export interface RecordTypeConfig {
  label: string
  fields: FieldDefinition[]
  columns: 1 | 2 | 3
  defaultValue: Record<string, unknown>
}

/**
 * Default values for new records
 */
export const DEFAULT_RECORD_VALUES: Record<string, Record<string, unknown>> = {
  address: {
    id: 0,
    addressLineFirst: "",
    addressLineSecond: "",
    city: "",
    stateId: 33,
    zipCode: "",
    county: "",
    pcp_panel: null,
    payerDirectory: null,
    wheelChairAccess: false,
    externalID: "",
    healthPlan: [],
  },
  healthPlan: {
    id: 0,
    plan_par_status: "PAR",
    plan_action_date: "",
    startDate: "",
    endDate: "",
    plan_tier: "",
    plan_assigned_id: "",
    externalID: "",
    plan_type_code: "",
    name: "",
    master_id: 0,
  },
  specialty: {
    id: 0,
    name: "",
    board_status: "",
    certificateIssuerName: "",
    issueDate: "",
    expiryDate: "",
    not_cert_reason: null,
    antic_exam_date: null,
    ispracticing: null,
    master_id: 0,
    specialtyName: "",
  },
  education: {
    id: 0,
    type: null,
    country: null,
    schoolName: "",
    degreeName: "",
    degreeStartDate: "",
    degreeEndDate: "",
    status: null,
  },
  medicare: {
    id: 0,
    medicareType: "Physician",
    medicarePtan: "",
    effectiveDate: "",
    terminationDate: "",
    medicareStateId: 33,
  },
  "license.DEA": {
    id: 0,
    licenseNumber: "",
    licenseExpiryDate: "",
    category: 3,
  },
  "license.CDS": {
    id: 0,
    licenseNumber: "",
    licenseExpiryDate: "",
    category: 2,
  },
  affiliation: {
    id: 0,
    affiliationName: "",
    startDate: "",
    endDate: "",
    code: "",
    category: "",
  },
  malpractice: {
    insurance_carrier: "",
    insurance_policy_num: "",
    ins_Cov_From: "",
    ins_Cov_To: "",
    ins_Cov_Limit_From: "",
    ins_Cov_Limit_To: "",
    ins_Cov_Type: "Claims Made",
  },
}

/**
 * Select options
 */
export const SELECT_OPTIONS = {
  providerType: [
    { value: "Specialist", label: "Specialist" },
    { value: "Primary Care", label: "Primary Care" },
    { value: "Individual", label: "Individual" },
    { value: "Organization", label: "Organization" },
  ],
  approvalStatus: [
    { value: "APPROVED", label: "Approved" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
    { value: "EXPIRED", label: "Expired" },
  ],
  boardStatus: [
    { value: "Certified", label: "Certified" },
    { value: "Not Certified", label: "Not Certified" },
    { value: "Pending", label: "Pending" },
    { value: "Expired", label: "Expired" },
  ],
  parStatus: [
    { value: "PAR", label: "PAR (Participating)" },
    { value: "NON-PAR", label: "NON-PAR (Non-Participating)" },
  ],
  medicareType: [
    { value: "Physician", label: "Physician" },
    { value: "Non-Physician Practitioner", label: "Non-Physician Practitioner" },
  ],
  affiliationCategory: [
    { value: "Appointed", label: "Appointed" },
    { value: "Provisional", label: "Provisional" },
    { value: "Consulting", label: "Consulting" },
    { value: "Honorary", label: "Honorary" },
  ],
  insuranceCoverageType: [
    { value: "Claims Made", label: "Claims Made" },
    { value: "Occurrence", label: "Occurrence" },
  ],
  genderType: [
    { value: 1, label: "Male" },
    { value: 2, label: "Female" },
    { value: 3, label: "Other" },
    { value: 4, label: "Non-conforming" },
    { value: 5, label: "Non-Binary" },
  ],
  states: [
    { value: 1, label: "Alabama" },
    { value: 2, label: "Alaska" },
    { value: 3, label: "Arizona" },
    { value: 4, label: "Arkansas" },
    { value: 5, label: "California" },
    { value: 6, label: "Colorado" },
    { value: 7, label: "Connecticut" },
    { value: 8, label: "Delaware" },
    { value: 9, label: "Florida" },
    { value: 10, label: "Georgia" },
    { value: 19, label: "Louisiana" },
    { value: 31, label: "Massachusetts" },
    { value: 33, label: "New York" },
    { value: 34, label: "New Jersey" },
    { value: 39, label: "Pennsylvania" },
    { value: 44, label: "Texas" },
  ],
  educationStatus: [
    { value: "Completed", label: "Completed" },
    { value: "In Progress", label: "In Progress" },
    { value: "Withdrawn", label: "Withdrawn" },
  ],
}
