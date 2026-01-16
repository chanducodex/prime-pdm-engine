export interface ChangeEvent {
  eventId: string
  timestamp: string
  actor: {
    name: string
    id: string
  }
  provider: {
    name: string
    npi: string
    id: string
  }
  category: ChangeCategory
  changes: FieldChange[]
}

export interface FieldChange {
  field: string
  before: string | null
  after: string | null
}

export type ChangeCategory =
  | "ProviderInformation"
  | "ProviderAddress"
  | "ProviderEducation"
  | "ProviderLicense"
  | "ProviderSpecialty"
  | "ProviderHealthPlan"
  | "ProviderLanguage"

export interface FilterState {
  dateRange: {
    from: Date | null
    to: Date | null
    preset: "7days" | "30days" | "90days" | "custom"
  }
  categories: ChangeCategory[]
  actors: string[]
  searchQuery: string
}

export type SortOption = "recent" | "oldest" | "provider-az"

export interface RawChangeEvent {
  summary: {
    name: string
    npi: number
    initials: string
    stats: Array<{
      label: string
      value: string
    }>
  }
  changeHistory: Array<{
    changeDate: string
    summary: string
    added: Array<Array<RawFieldChange>>
    changed: Array<Array<RawFieldChange>>
    terminate: Array<Array<RawFieldChange>>
  }>
}

export interface RawFieldChange {
  changeType: number
  fieldName: string
  oldValue: string
  newValue: string
  changedBy: string
  source: number
  changedOn: string
}
