"use client"

import type { Affiliation } from "@/lib/provider-types"
import type { ProviderEditState } from "../types"
import { SELECT_OPTIONS } from "../types"
import { EditableField, HighlightedText } from "../editable-field"
import { FieldGrid } from "../collapsible-section"
import { RecordCard, AddRecordButton, EmptyRecordsState, StatusBadge, getStatusVariant } from "../record-card"
import { TabSearchBar } from "../tab-search-bar"
import { getNestedValue } from "@/lib/utils/deep-utils"
import { useState, useMemo } from "react"

interface AffiliationsTabProps {
  editState: ProviderEditState
  validationErrors: Record<string, string>
  onAddRecord: (type: string) => void
  onDeleteRecord: (path: string, index: number, name: string) => void
}

export function AffiliationsTab({
  editState,
  validationErrors,
  onAddRecord,
  onDeleteRecord,
}: AffiliationsTabProps) {
  const { editedProvider, updateField, revertField, isFieldModified, getOriginalValue } = editState
  const [searchTerm, setSearchTerm] = useState("")

  const affiliations = editedProvider.affiliations || []

  // Filter affiliations based on search
  const filteredAffiliations = useMemo(() => {
    if (!searchTerm) return affiliations

    const search = searchTerm.toLowerCase()
    return affiliations.filter((aff) => {
      return (
        aff.affiliationName?.toLowerCase().includes(search) ||
        aff.category?.toLowerCase().includes(search) ||
        aff.code?.toLowerCase().includes(search)
      )
    })
  }, [affiliations, searchTerm])

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

  // Check if affiliation is active
  const isAffiliationActive = (endDate: string) => {
    if (!endDate) return true
    const end = new Date(endDate)
    return end > new Date()
  }

  if (affiliations.length === 0) {
    return (
      <div className="max-w-3xl">
        <EmptyRecordsState
          title="No affiliations found"
          description="Add a hospital or facility affiliation for this provider"
          actionLabel="Add Affiliation"
          onAction={() => onAddRecord("affiliation")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Affiliations ({affiliations.length})
          {isFieldModified("affiliations") && (
            <span className="ml-2 text-xs text-amber-600">(modified)</span>
          )}
        </h3>
        <AddRecordButton
          label="Add Affiliation"
          onClick={() => onAddRecord("affiliation")}
          variant="compact"
        />
      </div>

      {/* Search */}
      <TabSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by name, category, or code..."
        recordCount={affiliations.length}
        filteredCount={filteredAffiliations.length}
      />

      {/* Affiliation Cards */}
      {filteredAffiliations.map((affiliation, index) => {
        const actualIndex = affiliations.indexOf(affiliation)
        const basePath = `affiliations.${actualIndex}`
        const isAffModified = isFieldModified(basePath)
        const isActive = isAffiliationActive(affiliation.endDate)

        return (
          <RecordCard
            key={affiliation.id || actualIndex}
            title={
              searchTerm ? (
                <HighlightedText
                  text={affiliation.affiliationName || "Unnamed Affiliation"}
                  search={searchTerm}
                />
              ) : (
                affiliation.affiliationName || "Unnamed Affiliation"
              )
            }
            subtitle={`Code: ${affiliation.code || "N/A"}`}
            onDelete={() =>
              onDeleteRecord("affiliations", actualIndex, affiliation.affiliationName)
            }
            isModified={isAffModified}
            badge={
              <>
                <StatusBadge
                  status={isActive ? "Active" : "Expired"}
                  variant={isActive ? "success" : "error"}
                />
                {affiliation.category && (
                  <StatusBadge status={affiliation.category} variant="info" />
                )}
              </>
            }
          >
            <FieldGrid columns={2}>
              {renderField(basePath, "affiliationName", "Affiliation Name", "text", {
                required: true,
              })}
              {renderField(basePath, "code", "Code", "text")}
              {renderField(basePath, "category", "Category", "select", {
                options: SELECT_OPTIONS.affiliationCategory,
              })}
              {renderField(basePath, "startDate", "Start Date", "date")}
              {renderField(basePath, "endDate", "End Date", "date")}
            </FieldGrid>
          </RecordCard>
        )
      })}

      {/* Add button at bottom */}
      <AddRecordButton label="Add Another Affiliation" onClick={() => onAddRecord("affiliation")} />
    </div>
  )
}
