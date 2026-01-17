"use client"

import type { Address, HealthPlan } from "@/lib/provider-types"
import type { ProviderEditState } from "../types"
import { SELECT_OPTIONS } from "../types"
import { EditableField, HighlightedText } from "../editable-field"
import { CollapsibleSection, FieldGrid } from "../collapsible-section"
import { RecordCard, AddRecordButton, EmptyRecordsState, StatusBadge, getStatusVariant } from "../record-card"
import { TabSearchBar, useFilteredRecords } from "../tab-search-bar"
import { getNestedValue } from "@/lib/utils/deep-utils"
import { useState, useMemo } from "react"

interface LocationsTabProps {
  editState: ProviderEditState
  validationErrors: Record<string, string>
  onAddRecord: (type: string, parentPath?: string) => void
  onDeleteRecord: (path: string, index: number, name: string) => void
}

export function LocationsTab({
  editState,
  validationErrors,
  onAddRecord,
  onDeleteRecord,
}: LocationsTabProps) {
  const { editedProvider, updateField, revertField, isFieldModified, getOriginalValue } = editState
  const [searchTerm, setSearchTerm] = useState("")

  const addresses = editedProvider.address || []

  // Filter addresses based on search
  const filteredAddresses = useMemo(() => {
    if (!searchTerm) return addresses

    const search = searchTerm.toLowerCase()
    return addresses.filter((addr) => {
      const addressText = `${addr.addressLineFirst} ${addr.addressLineSecond} ${addr.city} ${addr.county} ${addr.zipCode}`.toLowerCase()
      const healthPlanNames = addr.healthPlan?.map((hp) => hp.name.toLowerCase()).join(" ") || ""
      return addressText.includes(search) || healthPlanNames.includes(search)
    })
  }, [addresses, searchTerm])

  const renderField = (
    basePath: string,
    field: string,
    label: string,
    type: "text" | "number" | "date" | "select" | "checkbox" = "text",
    options?: { required?: boolean; placeholder?: string; options?: { value: string | number; label: string }[]; disabled?: boolean }
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
        disabled={options?.disabled}
      />
    )
  }

  if (addresses.length === 0) {
    return (
      <div className="max-w-3xl">
        <EmptyRecordsState
          title="No locations found"
          description="Add a practice location for this provider"
          actionLabel="Add Location"
          onAction={() => onAddRecord("address")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header with count and add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Locations ({addresses.length})
          {isFieldModified("address") && (
            <span className="ml-2 text-xs text-amber-600">(modified)</span>
          )}
        </h3>
        <AddRecordButton
          label="Add Location"
          onClick={() => onAddRecord("address")}
          variant="compact"
        />
      </div>

      {/* Search */}
      <TabSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search locations by address, city, or health plan..."
        recordCount={addresses.length}
        filteredCount={filteredAddresses.length}
      />

      {/* Location Cards */}
      {filteredAddresses.map((address, index) => {
        const actualIndex = addresses.indexOf(address)
        const basePath = `address.${actualIndex}`
        const isAddressModified = isFieldModified(basePath)

        return (
          <RecordCard
            key={address.id || actualIndex}
            title={`Location ${actualIndex + 1}`}
            subtitle={`${address.city}, ${address.stateId === 33 ? "NY" : `State ${address.stateId}`} ${address.zipCode}`}
            onDelete={() =>
              onDeleteRecord("address", actualIndex, `${address.addressLineFirst}, ${address.city}`)
            }
            isModified={isAddressModified}
          >
            <div className="space-y-4">
              {/* Address Fields */}
              <FieldGrid columns={2}>
                <div className="col-span-2">
                  {renderField(basePath, "addressLineFirst", "Address Line 1", "text", { required: true })}
                </div>
                <div className="col-span-2">
                  {renderField(basePath, "addressLineSecond", "Address Line 2", "text")}
                </div>
                {renderField(basePath, "city", "City", "text", { required: true })}
                {renderField(basePath, "stateId", "State", "select", {
                  options: SELECT_OPTIONS.states,
                  required: true,
                })}
                {renderField(basePath, "zipCode", "ZIP Code", "text", { required: true })}
                {renderField(basePath, "county", "County", "text")}
              </FieldGrid>

              {/* Additional Fields */}
              <FieldGrid columns={2}>
                {renderField(basePath, "pcp_panel", "PCP Panel", "text")}
                {renderField(basePath, "payerDirectory", "Payer Directory", "text")}
                {renderField(basePath, "wheelChairAccess", "Wheelchair Access", "checkbox")}
                {renderField(basePath, "externalID", "External ID", "text")}
              </FieldGrid>

              {/* Health Plans Section */}
              <CollapsibleSection
                sectionKey={`${basePath}-healthplans`}
                title="Health Plans"
                badge={address.healthPlan?.length || 0}
                defaultExpanded={false}
                variant="nested"
                actions={
                  <AddRecordButton
                    label="Add Plan"
                    onClick={() => onAddRecord("healthPlan", basePath)}
                    variant="compact"
                  />
                }
              >
                {address.healthPlan && address.healthPlan.length > 0 ? (
                  <div className="space-y-3">
                    {address.healthPlan.map((hp, hpIndex) => {
                      const hpPath = `${basePath}.healthPlan.${hpIndex}`
                      const isHpModified = isFieldModified(hpPath)

                      return (
                        <RecordCard
                          key={hp.id || hpIndex}
                          title={
                            searchTerm ? (
                              <HighlightedText text={hp.name || "Unnamed Plan"} search={searchTerm} />
                            ) : (
                              hp.name || "Unnamed Plan"
                            )
                          }
                          variant="nested"
                          onDelete={() =>
                            onDeleteRecord(`${basePath}.healthPlan`, hpIndex, hp.name)
                          }
                          isModified={isHpModified}
                          badge={
                            <StatusBadge
                              status={hp.plan_par_status}
                              variant={getStatusVariant(hp.plan_par_status)}
                            />
                          }
                        >
                          <FieldGrid columns={2}>
                            {renderField(hpPath, "name", "Plan Name", "text", { required: true })}
                            {renderField(hpPath, "plan_par_status", "PAR Status", "select", {
                              options: SELECT_OPTIONS.parStatus,
                            })}
                            {renderField(hpPath, "startDate", "Start Date", "date")}
                            {renderField(hpPath, "endDate", "End Date", "date")}
                            {renderField(hpPath, "plan_tier", "Plan Tier", "text")}
                            {renderField(hpPath, "plan_type_code", "Plan Type Code", "text")}
                            {renderField(hpPath, "plan_assigned_id", "Assigned ID", "text")}
                            {renderField(hpPath, "externalID", "External ID", "text")}
                          </FieldGrid>
                        </RecordCard>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No health plans at this location
                  </p>
                )}
              </CollapsibleSection>
            </div>
          </RecordCard>
        )
      })}

      {/* Add Location Button at bottom */}
      <AddRecordButton label="Add Another Location" onClick={() => onAddRecord("address")} />
    </div>
  )
}
