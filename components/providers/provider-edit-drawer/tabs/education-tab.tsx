"use client"

import type { Education } from "@/lib/provider-types"
import type { ProviderEditState } from "../types"
import { SELECT_OPTIONS } from "../types"
import { EditableField, HighlightedText } from "../editable-field"
import { FieldGrid } from "../collapsible-section"
import { RecordCard, AddRecordButton, EmptyRecordsState, StatusBadge, getStatusVariant } from "../record-card"
import { TabSearchBar } from "../tab-search-bar"
import { getNestedValue } from "@/lib/utils/deep-utils"
import { useState, useMemo } from "react"

interface EducationTabProps {
  editState: ProviderEditState
  validationErrors: Record<string, string>
  onAddRecord: (type: string) => void
  onDeleteRecord: (path: string, index: number, name: string) => void
}

export function EducationTab({
  editState,
  validationErrors,
  onAddRecord,
  onDeleteRecord,
}: EducationTabProps) {
  const { editedProvider, updateField, revertField, isFieldModified, getOriginalValue } = editState
  const [searchTerm, setSearchTerm] = useState("")

  const educations = editedProvider.educations || []

  // Filter educations based on search
  const filteredEducations = useMemo(() => {
    if (!searchTerm) return educations

    const search = searchTerm.toLowerCase()
    return educations.filter((edu) => {
      return (
        edu.schoolName?.toLowerCase().includes(search) ||
        edu.degreeName?.toLowerCase().includes(search) ||
        edu.country?.toLowerCase().includes(search)
      )
    })
  }, [educations, searchTerm])

  const renderField = (
    basePath: string,
    field: string,
    label: string,
    type: "text" | "number" | "date" | "select" = "text",
    options?: { required?: boolean; placeholder?: string; options?: { value: string | number; label: string }[] }
  ) => {
    const path = `${basePath}.${field}`
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
      />
    )
  }

  if (educations.length === 0) {
    return (
      <div >
        <EmptyRecordsState
          title="No education records found"
          description="Add an education record for this provider"
          actionLabel="Add Education"
          onAction={() => onAddRecord("education")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Education ({educations.length})
          {isFieldModified("educations") && (
            <span className="ml-2 text-xs text-amber-600">(modified)</span>
          )}
        </h3>
        <AddRecordButton
          label="Add Education"
          onClick={() => onAddRecord("education")}
          variant="compact"
        />
      </div>

      {/* Search */}
      <TabSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by school name, degree, or country..."
        recordCount={educations.length}
        filteredCount={filteredEducations.length}
      />

      {/* Education Cards */}
      {filteredEducations.map((edu, index) => {
        const actualIndex = educations.indexOf(edu)
        const basePath = `educations.${actualIndex}`
        const isEduModified = isFieldModified(basePath)

        return (
          <RecordCard
            key={edu.id || actualIndex}
            title={
              searchTerm ? (
                <HighlightedText text={edu.schoolName || "Unnamed School"} search={searchTerm} />
              ) : (
                edu.schoolName || "Unnamed School"
              )
            }
            subtitle={edu.degreeName}
            onDelete={() => onDeleteRecord("educations", actualIndex, edu.schoolName)}
            isModified={isEduModified}
            badge={
              edu.status ? (
                <StatusBadge status={edu.status} variant={getStatusVariant(edu.status)} />
              ) : undefined
            }
          >
            <FieldGrid columns={2}>
              {renderField(basePath, "schoolName", "School/Institution", "text", { required: true })}
              {renderField(basePath, "degreeName", "Degree/Program", "text", { required: true })}
              {renderField(basePath, "type", "Education Type", "text")}
              {renderField(basePath, "country", "Country", "text")}
              {renderField(basePath, "degreeStartDate", "Start Date", "date")}
              {renderField(basePath, "degreeEndDate", "End Date", "date")}
              {renderField(basePath, "status", "Status", "select", {
                options: SELECT_OPTIONS.educationStatus,
              })}
            </FieldGrid>
          </RecordCard>
        )
      })}

      {/* Add button at bottom */}
      <AddRecordButton label="Add Another Education" onClick={() => onAddRecord("education")} />
    </div>
  )
}
