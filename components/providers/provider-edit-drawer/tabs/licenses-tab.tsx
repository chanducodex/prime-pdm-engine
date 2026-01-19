"use client"

import type { LicenseDetail } from "@/lib/provider-types"
import type { ProviderEditState } from "../types"
import { EditableField, HighlightedText } from "../editable-field"
import { CollapsibleSection, FieldGrid } from "../collapsible-section"
import { RecordCard, AddRecordButton, EmptyRecordsState, StatusBadge, getStatusVariant } from "../record-card"
import { TabSearchBar } from "../tab-search-bar"
import { getNestedValue } from "@/lib/utils/deep-utils"
import { useState, useMemo } from "react"
import { useExpandedSections } from "@/lib/hooks/use-local-storage"

interface LicensesTabProps {
  editState: ProviderEditState
  validationErrors: Record<string, string>
  onAddRecord: (type: string) => void
  onDeleteRecord: (path: string, index: number, name: string) => void
}

export function LicensesTab({
  editState,
  validationErrors,
  onAddRecord,
  onDeleteRecord,
}: LicensesTabProps) {
  const { editedProvider, updateField, revertField, isFieldModified, getOriginalValue } = editState
  const [searchTerm, setSearchTerm] = useState("")

  const { expandedSections, toggleSection } = useExpandedSections("drawer-licenses-sections", {
    dea: true,
    cds: true,
  })

  const deaLicenses = editedProvider.license?.DEA || []
  const cdsLicenses = editedProvider.license?.CDS || []
  const totalLicenses = deaLicenses.length + cdsLicenses.length

  // Filter licenses based on search
  const filteredDea = useMemo(() => {
    if (!searchTerm) return deaLicenses
    const search = searchTerm.toLowerCase()
    return deaLicenses.filter((lic) => lic.licenseNumber?.toLowerCase().includes(search))
  }, [deaLicenses, searchTerm])

  const filteredCds = useMemo(() => {
    if (!searchTerm) return cdsLicenses
    const search = searchTerm.toLowerCase()
    return cdsLicenses.filter((lic) => lic.licenseNumber?.toLowerCase().includes(search))
  }, [cdsLicenses, searchTerm])

  const renderField = (
    basePath: string,
    field: string,
    label: string,
    type: "text" | "number" | "date" | "select" = "text",
    options?: { required?: boolean; placeholder?: string }
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
      />
    )
  }

  // Check if license is expired
  const isLicenseExpired = (expiryDate: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    return expiry < new Date()
  }

  const renderLicenseCard = (
    license: LicenseDetail,
    index: number,
    basePath: string,
    type: "DEA" | "CDS"
  ) => {
    const actualLicenses = type === "DEA" ? deaLicenses : cdsLicenses
    const actualIndex = actualLicenses.indexOf(license)
    const fullPath = `license.${type}.${actualIndex}`
    const isModified = isFieldModified(fullPath)
    const expired = isLicenseExpired(license.licenseExpiryDate)

    return (
      <RecordCard
        key={license.id || actualIndex}
        title={
          searchTerm ? (
            <HighlightedText text={license.licenseNumber || "No License Number"} search={searchTerm} />
          ) : (
            license.licenseNumber || "No License Number"
          )
        }
        subtitle={`Expires: ${license.licenseExpiryDate || "N/A"}`}
        onDelete={() =>
          onDeleteRecord(`license.${type}`, actualIndex, `${type} - ${license.licenseNumber}`)
        }
        isModified={isModified}
        badge={
          <StatusBadge
            status={expired ? "Expired" : "Active"}
            variant={expired ? "error" : "success"}
          />
        }
      >
        <FieldGrid columns={2}>
          {renderField(fullPath, "licenseNumber", "License Number", "text", { required: true })}
          {renderField(fullPath, "licenseExpiryDate", "Expiry Date", "date", { required: true })}
          {renderField(fullPath, "category", "Category", "number")}
        </FieldGrid>
      </RecordCard>
    )
  }

  if (totalLicenses === 0) {
    return (
      <div className=" space-y-4">
        <EmptyRecordsState
          title="No licenses found"
          description="Add DEA or CDS licenses for this provider"
          actionLabel="Add DEA License"
          onAction={() => onAddRecord("license.DEA")}
        />
        <AddRecordButton label="Add CDS License" onClick={() => onAddRecord("license.CDS")} />
      </div>
    )
  }

  return (
    <div className="space-y-6 ">
      {/* Search */}
      <TabSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by license number..."
        recordCount={totalLicenses}
        filteredCount={filteredDea.length + filteredCds.length}
      />

      {/* DEA Licenses Section */}
      <CollapsibleSection
        sectionKey="dea"
        title="DEA Licenses"
        badge={deaLicenses.length}
        isExpanded={expandedSections.dea}
        onToggle={toggleSection}
        actions={
          <AddRecordButton
            label="Add DEA"
            onClick={() => onAddRecord("license.DEA")}
            variant="compact"
          />
        }
      >
        {filteredDea.length > 0 ? (
          <div className="space-y-3">
            {filteredDea.map((license, index) =>
              renderLicenseCard(license, index, "license.DEA", "DEA")
            )}
          </div>
        ) : deaLicenses.length > 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No matching DEA licenses</p>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No DEA licenses on file</p>
        )}
      </CollapsibleSection>

      {/* CDS Licenses Section */}
      <CollapsibleSection
        sectionKey="cds"
        title="CDS Licenses"
        badge={cdsLicenses.length}
        isExpanded={expandedSections.cds}
        onToggle={toggleSection}
        actions={
          <AddRecordButton
            label="Add CDS"
            onClick={() => onAddRecord("license.CDS")}
            variant="compact"
          />
        }
      >
        {filteredCds.length > 0 ? (
          <div className="space-y-3">
            {filteredCds.map((license, index) =>
              renderLicenseCard(license, index, "license.CDS", "CDS")
            )}
          </div>
        ) : cdsLicenses.length > 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No matching CDS licenses</p>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No CDS licenses on file</p>
        )}
      </CollapsibleSection>
    </div>
  )
}
