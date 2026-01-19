"use client"

import type { Malpractice } from "@/lib/provider-types"
import type { ProviderEditState } from "../types"
import { SELECT_OPTIONS } from "../types"
import { EditableField, HighlightedText } from "../editable-field"
import { FieldGrid } from "../collapsible-section"
import { RecordCard, AddRecordButton, EmptyRecordsState, StatusBadge, getStatusVariant } from "../record-card"
import { TabSearchBar } from "../tab-search-bar"
import { getNestedValue } from "@/lib/utils/deep-utils"
import { useState, useMemo } from "react"

interface MalpracticeTabProps {
  editState: ProviderEditState
  validationErrors: Record<string, string>
  onAddRecord: (type: string) => void
  onDeleteRecord: (path: string, index: number, name: string) => void
}

export function MalpracticeTab({
  editState,
  validationErrors,
  onAddRecord,
  onDeleteRecord,
}: MalpracticeTabProps) {
  const { editedProvider, updateField, revertField, isFieldModified, getOriginalValue } = editState
  const [searchTerm, setSearchTerm] = useState("")

  const malpracticeRecords = editedProvider.malpractice || []

  // Filter malpractice based on search
  const filteredMalpractice = useMemo(() => {
    if (!searchTerm) return malpracticeRecords

    const search = searchTerm.toLowerCase()
    return malpracticeRecords.filter((mal) => {
      return (
        mal.insurance_carrier?.toLowerCase().includes(search) ||
        mal.insurance_policy_num?.toLowerCase().includes(search)
      )
    })
  }, [malpracticeRecords, searchTerm])

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

  // Check if coverage is active
  const isCoverageActive = (toDate: string) => {
    if (!toDate) return true
    const end = new Date(toDate)
    return end > new Date()
  }

  if (malpracticeRecords.length === 0) {
    return (
      <div>
        <EmptyRecordsState
          title="No malpractice insurance records found"
          description="Add malpractice insurance information for this provider"
          actionLabel="Add Malpractice Insurance"
          onAction={() => onAddRecord("malpractice")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Malpractice Insurance ({malpracticeRecords.length})
          {isFieldModified("malpractice") && (
            <span className="ml-2 text-xs text-amber-600">(modified)</span>
          )}
        </h3>
        <AddRecordButton
          label="Add Insurance"
          onClick={() => onAddRecord("malpractice")}
          variant="compact"
        />
      </div>

      {/* Search */}
      <TabSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by carrier or policy number..."
        recordCount={malpracticeRecords.length}
        filteredCount={filteredMalpractice.length}
      />

      {/* Malpractice Cards */}
      {filteredMalpractice.map((malpractice, index) => {
        const actualIndex = malpracticeRecords.indexOf(malpractice)
        const basePath = `malpractice.${actualIndex}`
        const isMalModified = isFieldModified(basePath)
        const isActive = isCoverageActive(malpractice.ins_Cov_To)

        return (
          <RecordCard
            key={actualIndex}
            title={
              searchTerm ? (
                <HighlightedText
                  text={malpractice.insurance_carrier || "Unknown Carrier"}
                  search={searchTerm}
                />
              ) : (
                malpractice.insurance_carrier || "Unknown Carrier"
              )
            }
            subtitle={`Policy: ${malpractice.insurance_policy_num || "N/A"}`}
            onDelete={() =>
              onDeleteRecord(
                "malpractice",
                actualIndex,
                `${malpractice.insurance_carrier} - ${malpractice.insurance_policy_num}`
              )
            }
            isModified={isMalModified}
            badge={
              <>
                <StatusBadge
                  status={isActive ? "Active" : "Expired"}
                  variant={isActive ? "success" : "error"}
                />
                {malpractice.ins_Cov_Type && (
                  <StatusBadge status={malpractice.ins_Cov_Type} variant="info" />
                )}
              </>
            }
          >
            <FieldGrid columns={2}>
              {renderField(basePath, "insurance_carrier", "Insurance Carrier", "text", {
                required: true,
              })}
              {renderField(basePath, "insurance_policy_num", "Policy Number", "text", {
                required: true,
              })}
              {renderField(basePath, "ins_Cov_Type", "Coverage Type", "select", {
                options: SELECT_OPTIONS.insuranceCoverageType,
              })}
              {renderField(basePath, "ins_Cov_From", "Coverage From", "date")}
              {renderField(basePath, "ins_Cov_To", "Coverage To", "date")}
              {renderField(basePath, "ins_Cov_Limit_From", "Coverage Limit (From)", "text", {
                placeholder: "e.g., 1,000,000",
              })}
              {renderField(basePath, "ins_Cov_Limit_To", "Coverage Limit (To)", "text", {
                placeholder: "e.g., 3,000,000 or No Aggregate",
              })}
            </FieldGrid>
          </RecordCard>
        )
      })}

      {/* Add button at bottom */}
      <AddRecordButton
        label="Add Another Insurance Policy"
        onClick={() => onAddRecord("malpractice")}
      />
    </div>
  )
}
