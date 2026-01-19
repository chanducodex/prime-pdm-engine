"use client"

import type { Medicare } from "@/lib/provider-types"
import type { ProviderEditState } from "../types"
import { SELECT_OPTIONS } from "../types"
import { EditableField, HighlightedText } from "../editable-field"
import { FieldGrid } from "../collapsible-section"
import { RecordCard, AddRecordButton, EmptyRecordsState, StatusBadge } from "../record-card"
import { TabSearchBar } from "../tab-search-bar"
import { getNestedValue } from "@/lib/utils/deep-utils"
import { useState, useMemo } from "react"

interface MedicareTabProps {
  editState: ProviderEditState
  validationErrors: Record<string, string>
  onAddRecord: (type: string) => void
  onDeleteRecord: (path: string, index: number, name: string) => void
}

export function MedicareTab({
  editState,
  validationErrors,
  onAddRecord,
  onDeleteRecord,
}: MedicareTabProps) {
  const { editedProvider, updateField, revertField, isFieldModified, getOriginalValue } = editState
  const [searchTerm, setSearchTerm] = useState("")

  const medicareRecords = editedProvider.medicare || []

  // Filter medicare records based on search
  const filteredMedicare = useMemo(() => {
    if (!searchTerm) return medicareRecords

    const search = searchTerm.toLowerCase()
    return medicareRecords.filter((med) => {
      return (
        med.medicareType?.toLowerCase().includes(search) ||
        med.medicarePtan?.toLowerCase().includes(search)
      )
    })
  }, [medicareRecords, searchTerm])

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

  // Get state name from ID
  const getStateName = (stateId: number) => {
    const state = SELECT_OPTIONS.states.find((s) => s.value === stateId)
    return state?.label || `State ${stateId}`
  }

  if (medicareRecords.length === 0) {
    return (
      <div >
        <EmptyRecordsState
          title="No Medicare records found"
          description="Add a Medicare enrollment for this provider"
          actionLabel="Add Medicare"
          onAction={() => onAddRecord("medicare")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Medicare Enrollments ({medicareRecords.length})
          {isFieldModified("medicare") && (
            <span className="ml-2 text-xs text-amber-600">(modified)</span>
          )}
        </h3>
        <AddRecordButton
          label="Add Medicare"
          onClick={() => onAddRecord("medicare")}
          variant="compact"
        />
      </div>

      {/* Search */}
      <TabSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by type or PTAN..."
        recordCount={medicareRecords.length}
        filteredCount={filteredMedicare.length}
      />

      {/* Medicare Cards */}
      {filteredMedicare.map((medicare, index) => {
        const actualIndex = medicareRecords.indexOf(medicare)
        const basePath = `medicare.${actualIndex}`
        const isMedModified = isFieldModified(basePath)

        return (
          <RecordCard
            key={medicare.id || actualIndex}
            title={
              searchTerm ? (
                <HighlightedText text={medicare.medicareType || "Medicare"} search={searchTerm} />
              ) : (
                medicare.medicareType || "Medicare"
              )
            }
            subtitle={`PTAN: ${medicare.medicarePtan} | ${getStateName(medicare.medicareStateId)}`}
            onDelete={() =>
              onDeleteRecord("medicare", actualIndex, `${medicare.medicareType} - ${medicare.medicarePtan}`)
            }
            isModified={isMedModified}
            badge={<StatusBadge status={medicare.medicareType} variant="info" />}
          >
            <FieldGrid columns={2}>
              {renderField(basePath, "medicareType", "Medicare Type", "select", {
                options: SELECT_OPTIONS.medicareType,
                required: true,
              })}
              {renderField(basePath, "medicarePtan", "PTAN Number", "text", { required: true })}
              {renderField(basePath, "medicareStateId", "State", "select", {
                options: SELECT_OPTIONS.states,
                required: true,
              })}
              {renderField(basePath, "effectiveDate", "Effective Date", "date")}
              {renderField(basePath, "terminationDate", "Termination Date", "date")}
            </FieldGrid>
          </RecordCard>
        )
      })}

      {/* Add button at bottom */}
      <AddRecordButton label="Add Another Medicare" onClick={() => onAddRecord("medicare")} />
    </div>
  )
}
