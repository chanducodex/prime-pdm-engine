"use client"

import { X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { EditableField } from "./editable-field"
import { FieldGrid } from "./collapsible-section"
import { DEFAULT_RECORD_VALUES, SELECT_OPTIONS } from "./types"
import { generateId } from "@/lib/utils/deep-utils"

interface AddRecordModalProps {
  isOpen: boolean
  onClose: () => void
  recordType: string
  parentPath?: string
  onAdd: (record: Record<string, unknown>) => void
}

interface FieldConfig {
  path: string
  label: string
  type: "text" | "number" | "date" | "select" | "checkbox"
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
}

// Field configurations for each record type
const RECORD_FIELD_CONFIGS: Record<string, { title: string; fields: FieldConfig[]; columns: 1 | 2 }> = {
  address: {
    title: "Add Location",
    columns: 2,
    fields: [
      { path: "addressLineFirst", label: "Address Line 1", type: "text", required: true },
      { path: "addressLineSecond", label: "Address Line 2", type: "text" },
      { path: "city", label: "City", type: "text", required: true },
      { path: "stateId", label: "State", type: "select", required: true, options: SELECT_OPTIONS.states },
      { path: "zipCode", label: "ZIP Code", type: "text", required: true },
      { path: "county", label: "County", type: "text" },
      { path: "pcp_panel", label: "PCP Panel", type: "text" },
      { path: "payerDirectory", label: "Payer Directory", type: "text" },
      { path: "wheelChairAccess", label: "Wheelchair Access", type: "checkbox" },
      { path: "externalID", label: "External ID", type: "text" },
    ],
  },
  healthPlan: {
    title: "Add Health Plan",
    columns: 2,
    fields: [
      { path: "name", label: "Plan Name", type: "text", required: true },
      { path: "plan_par_status", label: "PAR Status", type: "select", options: SELECT_OPTIONS.parStatus },
      { path: "startDate", label: "Start Date", type: "date" },
      { path: "endDate", label: "End Date", type: "date" },
      { path: "plan_tier", label: "Plan Tier", type: "text" },
      { path: "plan_type_code", label: "Plan Type Code", type: "text" },
      { path: "plan_assigned_id", label: "Assigned ID", type: "text" },
      { path: "externalID", label: "External ID", type: "text" },
    ],
  },
  specialty: {
    title: "Add Specialty",
    columns: 2,
    fields: [
      { path: "name", label: "Specialty Name", type: "text", required: true },
      { path: "specialtyName", label: "Display Name", type: "text" },
      { path: "board_status", label: "Board Status", type: "select", options: SELECT_OPTIONS.boardStatus },
      { path: "certificateIssuerName", label: "Certificate Issuer", type: "text" },
      { path: "issueDate", label: "Issue Date", type: "date" },
      { path: "expiryDate", label: "Expiry Date", type: "date" },
      { path: "not_cert_reason", label: "Not Certified Reason", type: "text" },
      { path: "antic_exam_date", label: "Anticipated Exam Date", type: "date" },
    ],
  },
  education: {
    title: "Add Education",
    columns: 2,
    fields: [
      { path: "schoolName", label: "School/Institution", type: "text", required: true },
      { path: "degreeName", label: "Degree/Program", type: "text", required: true },
      { path: "type", label: "Education Type", type: "text" },
      { path: "country", label: "Country", type: "text" },
      { path: "degreeStartDate", label: "Start Date", type: "date" },
      { path: "degreeEndDate", label: "End Date", type: "date" },
      { path: "status", label: "Status", type: "select", options: SELECT_OPTIONS.educationStatus },
    ],
  },
  medicare: {
    title: "Add Medicare Enrollment",
    columns: 2,
    fields: [
      { path: "medicareType", label: "Medicare Type", type: "select", required: true, options: SELECT_OPTIONS.medicareType },
      { path: "medicarePtan", label: "PTAN Number", type: "text", required: true },
      { path: "medicareStateId", label: "State", type: "select", required: true, options: SELECT_OPTIONS.states },
      { path: "effectiveDate", label: "Effective Date", type: "date" },
      { path: "terminationDate", label: "Termination Date", type: "date" },
    ],
  },
  "license.DEA": {
    title: "Add DEA License",
    columns: 2,
    fields: [
      { path: "licenseNumber", label: "License Number", type: "text", required: true },
      { path: "licenseExpiryDate", label: "Expiry Date", type: "date", required: true },
      { path: "category", label: "Category", type: "number" },
    ],
  },
  "license.CDS": {
    title: "Add CDS License",
    columns: 2,
    fields: [
      { path: "licenseNumber", label: "License Number", type: "text", required: true },
      { path: "licenseExpiryDate", label: "Expiry Date", type: "date", required: true },
      { path: "category", label: "Category", type: "number" },
    ],
  },
  affiliation: {
    title: "Add Affiliation",
    columns: 2,
    fields: [
      { path: "affiliationName", label: "Affiliation Name", type: "text", required: true },
      { path: "code", label: "Code", type: "text" },
      { path: "category", label: "Category", type: "select", options: SELECT_OPTIONS.affiliationCategory },
      { path: "startDate", label: "Start Date", type: "date" },
      { path: "endDate", label: "End Date", type: "date" },
    ],
  },
  malpractice: {
    title: "Add Malpractice Insurance",
    columns: 2,
    fields: [
      { path: "insurance_carrier", label: "Insurance Carrier", type: "text", required: true },
      { path: "insurance_policy_num", label: "Policy Number", type: "text", required: true },
      { path: "ins_Cov_Type", label: "Coverage Type", type: "select", options: SELECT_OPTIONS.insuranceCoverageType },
      { path: "ins_Cov_From", label: "Coverage From", type: "date" },
      { path: "ins_Cov_To", label: "Coverage To", type: "date" },
      { path: "ins_Cov_Limit_From", label: "Coverage Limit (From)", type: "text", placeholder: "e.g., 1,000,000" },
      { path: "ins_Cov_Limit_To", label: "Coverage Limit (To)", type: "text", placeholder: "e.g., 3,000,000" },
    ],
  },
}

export function AddRecordModal({
  isOpen,
  onClose,
  recordType,
  parentPath,
  onAdd,
}: AddRecordModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const config = RECORD_FIELD_CONFIGS[recordType]

  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultValues = DEFAULT_RECORD_VALUES[recordType] || {}
      setFormData({ ...defaultValues, id: generateId() })
      setErrors({})
    }
  }, [isOpen, recordType])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const handleFieldChange = (path: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [path]: value }))
    // Clear error when field is edited
    if (errors[path]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[path]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    config?.fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.path]
        if (value === undefined || value === null || value === "") {
          newErrors[field.path] = `${field.label} is required`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    onAdd(formData)
    onClose()
  }

  if (!isOpen || !config) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {config.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <FieldGrid columns={config.columns}>
            {config.fields.map((field) => (
              <EditableField
                key={field.path}
                path={field.path}
                label={field.label}
                type={field.type}
                value={formData[field.path]}
                originalValue={undefined}
                isModified={false}
                onChange={(value) => handleFieldChange(field.path, value)}
                onRevert={() => {}}
                error={errors[field.path]}
                required={field.required}
                placeholder={field.placeholder}
                options={field.options}
              />
            ))}
          </FieldGrid>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Add {recordType.includes(".") ? recordType.split(".")[1] : recordType.charAt(0).toUpperCase() + recordType.slice(1)}
          </button>
        </div>
      </div>
    </div>
  )
}
