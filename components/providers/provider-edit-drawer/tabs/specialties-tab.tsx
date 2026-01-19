"use client"

import type { Specialty } from "@/lib/provider-types"
import type { ProviderEditState } from "../types"
import { SELECT_OPTIONS } from "../types"
import { EditableField, HighlightedText } from "../editable-field"
import { FieldGrid } from "../collapsible-section"
import { RecordCard, AddRecordButton, EmptyRecordsState, StatusBadge, getStatusVariant } from "../record-card"
import { TabSearchBar } from "../tab-search-bar"
import { getNestedValue } from "@/lib/utils/deep-utils"
import { useState, useMemo } from "react"

interface SpecialtiesTabProps {
  editState: ProviderEditState
  validationErrors: Record<string, string>
  onAddRecord: (type: string) => void
  onDeleteRecord: (path: string, index: number, name: string) => void
}

export function SpecialtiesTab({
  editState,
  validationErrors,
  onAddRecord,
  onDeleteRecord,
}: SpecialtiesTabProps) {
  const { editedProvider, updateField, revertField, isFieldModified, getOriginalValue } = editState
  const [searchTerm, setSearchTerm] = useState("")

  const specialties = editedProvider.specialties || []

  // Filter specialties based on search
  const filteredSpecialties = useMemo(() => {
    if (!searchTerm) return specialties

    const search = searchTerm.toLowerCase()
    return specialties.filter((spec) => {
      return (
        spec.name?.toLowerCase().includes(search) ||
        spec.board_status?.toLowerCase().includes(search) ||
        spec.certificateIssuerName?.toLowerCase().includes(search)
      )
    })
  }, [specialties, searchTerm])

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

  if (specialties.length === 0) {
    return (
      <div >
        <EmptyRecordsState
          title="No specialties found"
          description="Add a specialty for this provider"
          actionLabel="Add Specialty"
          onAction={() => onAddRecord("specialty")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Specialties ({specialties.length})
          {isFieldModified("specialties") && (
            <span className="ml-2 text-xs text-amber-600">(modified)</span>
          )}
        </h3>
        <AddRecordButton
          label="Add Specialty"
          onClick={() => onAddRecord("specialty")}
          variant="compact"
        />
      </div>

      {/* Search */}
      <TabSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by specialty name, board status, or issuer..."
        recordCount={specialties.length}
        filteredCount={filteredSpecialties.length}
      />

      {/* Specialty Cards */}
      {filteredSpecialties.map((specialty, index) => {
        const actualIndex = specialties.indexOf(specialty)
        const basePath = `specialties.${actualIndex}`
        const isSpecModified = isFieldModified(basePath)

        return (
          <RecordCard
            key={specialty.id || actualIndex}
            title={
              (
                searchTerm ? (
                  <HighlightedText text={specialty.name || "Unnamed Specialty"} search={searchTerm} />
                ) : (
                  specialty.name || "Unnamed Specialty"
                )
              ) 
            }
            onDelete={() => onDeleteRecord("specialties", actualIndex, specialty.name)}
            isModified={isSpecModified}
            badge={
              <StatusBadge
                status={specialty.board_status}
                variant={getStatusVariant(specialty.board_status)}
              />
            }
          >
            <FieldGrid columns={2}>
              {renderField(basePath, "name", "Specialty Name", "text", { required: true })}
              {renderField(basePath, "specialtyName", "Display Name", "text")}
              {renderField(basePath, "board_status", "Board Status", "select", {
                options: SELECT_OPTIONS.boardStatus,
              })}
              {renderField(basePath, "certificateIssuerName", "Certificate Issuer", "text")}
              {renderField(basePath, "issueDate", "Issue Date", "date")}
              {renderField(basePath, "expiryDate", "Expiry Date", "date")}
              {renderField(basePath, "not_cert_reason", "Not Certified Reason", "text")}
              {renderField(basePath, "antic_exam_date", "Anticipated Exam Date", "date")}
              {renderField(basePath, "ispracticing", "Is Practicing", "select", {
                options: [
                  { value: "Y", label: "Yes" },
                  { value: "N", label: "No" },
                ],
              })}
            </FieldGrid>
          </RecordCard>
        )
      })}

      {/* Add button at bottom */}
      <AddRecordButton label="Add Another Specialty" onClick={() => onAddRecord("specialty")} />
    </div>
  )
}
