export interface Provider {
  provider_Id: number
  npi: number
  firstName: string
  lastName: string
  middleName: string
  providerType: string
  groupEntity: string
  basicInfo: BasicInfo
  medicare: Medicare[]
  license: License
  specialties: Specialty[]
  affiliations: Affiliation[]
  malpractice: Malpractice[]
  educations: Education[]
  groupcollab: any[]
  languages: any[]
  billingAddress: Address[]
  address: Address[]
  wheelChairAccess: boolean
}

export interface BasicInfo {
  affiliation_status: string
  cumc_division: string
  initial_appr_date: string
  degree_description: string
  cred_approval_status: string
  prior_appr_date: string
  current_appr_date: string
  date_hire: string
  dateOfBirth: string
  current_exp_date: string
  fellow_y_n: string
  genderTypeId: number
  caqhId: number
  degree: string
  cumc_department: string
  uni: string
  id: number
}

export interface Medicare {
  medicareType: string
  medicarePtan: string
  effectiveDate: string
  terminationDate: string
  id: number
  medicareStateId: number
}

export interface License {
  DEA?: LicenseDetail[]
  CDS?: LicenseDetail[]
}

export interface LicenseDetail {
  licenseExpiryDate: string
  licenseNumber: string
  id: number
  category: number
}

export interface Specialty {
  name: string
  board_status: string
  certificateIssuerName: string
  issueDate: string
  expiryDate: string
  not_cert_reason: string | null
  antic_exam_date: string | null
  ispracticing: string | null
  master_id: number
  id: number
  specialtyName: string
}

export interface Affiliation {
  affiliationName: string
  startDate: string
  endDate: string
  code: string
  category: string
  id: number
}

export interface Malpractice {
  insurance_carrier: string
  insurance_policy_num: string
  ins_Cov_From: string
  ins_Cov_To: string
  ins_Cov_Limit_From: string
  ins_Cov_Limit_To: string
  ins_Cov_Type: string
}

export interface Education {
  type: string | null
  country: string | null
  schoolName: string
  degreeName: string
  degreeStartDate: string
  degreeEndDate: string
  status: string | null
  id: number
}

export interface Address {
  addressLineFirst: string
  addressLineSecond: string
  city: string
  stateId: number
  zipCode: string
  county: string
  pcp_panel: string | null
  payerDirectory: string | null
  wheelChairAccess: boolean
  locationStatus: string[]
  externalID: string
  id: number
  fullAddress?: string
  healthPlan?: HealthPlan[]
}

export interface HealthPlan {
  plan_par_status: string
  plan_action_date: string
  startDate: string
  endDate: string
  plan_tier: string
  plan_assigned_id: string
  externalID: string
  plan_type_code: string
  name: string
  id: number
  master_id: number
}

export interface FilterState {
  search: string
  healthPlanIds: number[]
  specialtyIds: number[]
  genderTypeIds: number[]
  stateIds: number[]
  schoolNames: string[]
  locationStatus: boolean
  wheelChairAccess: boolean
}

export interface FilterConfig {
  category: string
  control_type?: "checkbox" | "dropdown" // UI control type
  is_required?: boolean // Indicate if filter is required
  filter_columns: FilterColumn[]
}

export interface FilterColumn {
  filter_key: string
  filter_display_name: string
  filter_data: FilterOption[]
  filter_value: string
}

export interface FilterOption {
  id: number | string
  name: string
}

export interface FieldConfig {
  name: string
  type: string
  label: string
  section: string
  isHidden: boolean
  required: boolean
  validation?: ValidationRule[]
  placeholder?: string
  format?: string
}

export interface ValidationRule {
  Type: string
  Message: string
  ErrorCode?: string
  Pattern?: string
  ExactLength?: string
}

export interface DialogConfig {
  title: string
  fields: FieldConfig[]
  layout: {
    sections: LayoutSection[]
  }
  actions: {
    add: boolean
    delete: boolean
    revert: boolean
  }
  multiRow: boolean
  openModal: boolean
  tableName: string
  categoryId: number
}

export interface LayoutSection {
  key: string
  title: string
  columns: number
}
