"use client"

import type { Provider } from "@/lib/provider-types"
import type { ProviderEditState } from "../types"
import { SELECT_OPTIONS } from "../types"
import { EditableField } from "../editable-field"
import { CollapsibleSection, FieldGrid, ExpansionControls } from "../collapsible-section"
import { useExpandedSections } from "@/lib/hooks/use-local-storage"
import { getNestedValue } from "@/lib/utils/deep-utils"

interface BasicInfoTabProps {
  editState: ProviderEditState
  validationErrors: Record<string, string>
}

export function BasicInfoTab({ editState, validationErrors }: BasicInfoTabProps) {
  const { editedProvider, updateField, revertField, isFieldModified, getOriginalValue } = editState

  const { expandedSections, toggleSection, expandAll, collapseAll } = useExpandedSections(
    "drawer-basic-info-sections",
    {
      personalInfo: true,
      professionalInfo: true,
      credentialDates: false,
      additionalInfo: false,
    }
  )

  const renderField = (
    path: string,
    label: string,
    type: "text" | "number" | "date" | "select" | "checkbox" = "text",
    options?: { required?: boolean; placeholder?: string; options?: { value: string | number; label: string }[]; colSpan?: 1 | 2 | 3 }
  ) => {
    const value = getNestedValue(editedProvider, path)
    const originalValue = getOriginalValue(path)
    const isModified = isFieldModified(path)
    const error = validationErrors[path]

    return (
      <EditableField
        key={path}
        path={path}
        label={label}
        type={type}
        value={value}
        originalValue={originalValue}
        isModified={isModified}
        onChange={(val) => updateField(path, val)}
        onRevert={() => revertField(path)}
        error={error}
        required={options?.required}
        placeholder={options?.placeholder}
        options={options?.options}
        colSpan={options?.colSpan}
      />
    )
  }

  // Count modified fields in each section
  const countModifiedInSection = (paths: string[]) => {
    return paths.filter((path) => isFieldModified(path)).length
  }

  const personalInfoFields = ["firstName", "middleName", "lastName", "npi", "providerType", "groupEntity"]
  const professionalFields = [
    "basicInfo.degree",
    "basicInfo.degree_description",
    "basicInfo.cumc_department",
    "basicInfo.cumc_division",
    "basicInfo.cred_approval_status",
    "basicInfo.caqhId",
    "basicInfo.uni",
    "basicInfo.affiliation_status",
  ]
  const credentialDateFields = [
    "basicInfo.date_hire",
    "basicInfo.initial_appr_date",
    "basicInfo.prior_appr_date",
    "basicInfo.current_appr_date",
    "basicInfo.current_exp_date",
  ]
  const additionalFields = [
    "basicInfo.dateOfBirth",
    "basicInfo.genderTypeId",
    "basicInfo.fellow_y_n",
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Expansion Controls */}
      <div className="flex justify-end">
        <ExpansionControls onExpandAll={expandAll} onCollapseAll={collapseAll} />
      </div>

      {/* Personal Information Section */}
      <CollapsibleSection
        sectionKey="personalInfo"
        title="Personal Information"
        isExpanded={expandedSections.personalInfo}
        onToggle={toggleSection}
        modifiedCount={countModifiedInSection(personalInfoFields)}
      >
        <FieldGrid columns={3}>
          {renderField("firstName", "First Name", "text", { required: true })}
          {renderField("middleName", "Middle Name", "text")}
          {renderField("lastName", "Last Name", "text", { required: true })}
        </FieldGrid>
        <div className="mt-4">
          <FieldGrid columns={2}>
            {renderField("npi", "NPI", "number", { required: true, placeholder: "10-digit NPI" })}
            {renderField("providerType", "Provider Type", "select", {
              options: SELECT_OPTIONS.providerType,
            })}
          </FieldGrid>
        </div>
        <div className="mt-4">
          {renderField("groupEntity", "Group Entity", "text", { colSpan: 3 })}
        </div>
      </CollapsibleSection>

      {/* Professional Information Section */}
      <CollapsibleSection
        sectionKey="professionalInfo"
        title="Professional Information"
        isExpanded={expandedSections.professionalInfo}
        onToggle={toggleSection}
        modifiedCount={countModifiedInSection(professionalFields)}
      >
        <FieldGrid columns={2}>
          {renderField("basicInfo.degree", "Degree", "text", { placeholder: "e.g., MD, DO" })}
          {renderField("basicInfo.degree_description", "Degree Description", "text")}
          {renderField("basicInfo.cumc_department", "Department", "text")}
          {renderField("basicInfo.cumc_division", "Division", "text")}
          {renderField("basicInfo.cred_approval_status", "Approval Status", "select", {
            options: SELECT_OPTIONS.approvalStatus,
          })}
          {renderField("basicInfo.caqhId", "CAQH ID", "number")}
          {renderField("basicInfo.uni", "UNI", "text")}
          {renderField("basicInfo.affiliation_status", "Affiliation Status", "text")}
        </FieldGrid>
      </CollapsibleSection>

      {/* Credential Dates Section */}
      <CollapsibleSection
        sectionKey="credentialDates"
        title="Credential Dates"
        isExpanded={expandedSections.credentialDates}
        onToggle={toggleSection}
        modifiedCount={countModifiedInSection(credentialDateFields)}
      >
        <FieldGrid columns={2}>
          {renderField("basicInfo.date_hire", "Date Hired", "date")}
          {renderField("basicInfo.initial_appr_date", "Initial Approval Date", "date")}
          {renderField("basicInfo.prior_appr_date", "Prior Approval Date", "date")}
          {renderField("basicInfo.current_appr_date", "Current Approval Date", "date")}
          {renderField("basicInfo.current_exp_date", "Current Expiration Date", "date")}
        </FieldGrid>
      </CollapsibleSection>

      {/* Additional Information Section */}
      <CollapsibleSection
        sectionKey="additionalInfo"
        title="Additional Information"
        isExpanded={expandedSections.additionalInfo}
        onToggle={toggleSection}
        modifiedCount={countModifiedInSection(additionalFields)}
      >
        <FieldGrid columns={3}>
          {renderField("basicInfo.dateOfBirth", "Date of Birth", "date")}
          {renderField("basicInfo.genderTypeId", "Gender", "select", {
            options: SELECT_OPTIONS.genderType,
          })}
          {renderField("basicInfo.fellow_y_n", "Fellow", "select", {
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
            ],
          })}
        </FieldGrid>
      </CollapsibleSection>
    </div>
  )
}
