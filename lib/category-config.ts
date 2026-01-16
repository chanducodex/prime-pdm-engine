import type { ChangeCategory } from "./types"

export const categoryColors: Record<ChangeCategory, string> = {
  ProviderInformation: "#3B82F6", // blue
  ProviderAddress: "#10B981", // green
  ProviderLicense: "#7C3AED", // purple (primary)
  ProviderEducation: "#F59E0B", // orange
  ProviderSpecialty: "#EC4899", // pink
  ProviderHealthPlan: "#06B6D4", // cyan
  ProviderLanguage: "#8B5CF6", // violet
}

export const categoryLabels: Record<ChangeCategory, string> = {
  ProviderInformation: "Information",
  ProviderAddress: "Address",
  ProviderLicense: "License",
  ProviderEducation: "Education",
  ProviderSpecialty: "Specialty",
  ProviderHealthPlan: "Health Plan",
  ProviderLanguage: "Language",
}
