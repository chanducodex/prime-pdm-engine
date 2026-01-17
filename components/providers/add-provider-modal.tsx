"use client"

import { X, Plus, ChevronDown, ChevronRight, AlertCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import type { Provider } from "@/lib/provider-types"
import { generateId } from "@/lib/utils/deep-utils"

interface AddProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (provider: Provider) => void
}

const SELECT_OPTIONS = {
  providerType: [
    { value: "Specialist", label: "Specialist" },
    { value: "Primary Care", label: "Primary Care" },
    { value: "Individual", label: "Individual" },
    { value: "Organization", label: "Organization" },
  ],
  genderType: [
    { value: 1, label: "Male" },
    { value: 2, label: "Female" },
    { value: 3, label: "Other" },
    { value: 4, label: "Non-conforming" },
    { value: 5, label: "Non-Binary" },
  ],
}

const getDefaultProvider = (): Partial<Provider> => ({
  provider_Id: generateId(),
  firstName: "",
  lastName: "",
  middleName: "",
  npi: 0,
  providerType: "Specialist",
  groupEntity: "",
  basicInfo: {
    affiliation_status: "",
    cumc_division: "",
    initial_appr_date: "",
    degree_description: "",
    cred_approval_status: "",
    prior_appr_date: "",
    current_appr_date: "",
    date_hire: "",
    dateOfBirth: "",
    current_exp_date: "",
    fellow_y_n: "N",
    genderTypeId: 1,
    caqhId: 0,
    degree: "",
    cumc_department: "",
    uni: "",
    id: generateId(),
  },
  medicare: [],
  license: { DEA: [], CDS: [] },
  specialties: [],
  affiliations: [],
  malpractice: [],
  educations: [],
  groupcollab: [],
  languages: [],
  billingAddress: [],
  address: [],
})

export function AddProviderModal({ isOpen, onClose, onAdd }: AddProviderModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<Partial<Provider>>(getDefaultProvider())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showOptional, setShowOptional] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(getDefaultProvider())
      setErrors({})
      setShowOptional(false)
    }
  }, [isOpen])

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

  const updateField = (path: string, value: unknown) => {
    setFormData((prev) => {
      if (path.startsWith("basicInfo.")) {
        const field = path.replace("basicInfo.", "")
        return {
          ...prev,
          basicInfo: {
            ...prev.basicInfo!,
            [field]: value,
          },
        }
      }
      return { ...prev, [path]: value }
    })

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

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.npi) {
      newErrors.npi = "NPI is required"
    } else if (String(formData.npi).length !== 10) {
      newErrors.npi = "NPI must be exactly 10 digits"
    }
    if (!formData.providerType) {
      newErrors.providerType = "Provider type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    // Create full provider object
    const newProvider: Provider = {
      ...getDefaultProvider(),
      ...formData,
      provider_Id: generateId(),
    } as Provider

    onAdd(newProvider)
    onClose()
  }

  if (!isOpen) return null

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                Add New Provider
              </h2>
              <p className="text-sm text-gray-500">Enter provider information to create a new record</p>
            </div>
          </div>
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
          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              Required Information
              <span className="text-xs text-red-500 font-normal">* Required fields</span>
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName || ""}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Enter first name"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    errors.firstName ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName || ""}
                  onChange={(e) => updateField("middleName", e.target.value)}
                  placeholder="Enter middle name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName || ""}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Enter last name"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    errors.lastName ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* NPI */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  NPI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.npi || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                    updateField("npi", value ? Number(value) : 0)
                  }}
                  placeholder="Enter 10-digit NPI"
                  maxLength={10}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono ${
                    errors.npi ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.npi && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.npi}
                  </p>
                )}
              </div>

              {/* Provider Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Provider Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.providerType || ""}
                  onChange={(e) => updateField("providerType", e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                    errors.providerType ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select type</option>
                  {SELECT_OPTIONS.providerType.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.providerType && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.providerType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Optional Fields (Collapsible) */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {showOptional ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Optional Information
            </button>

            {showOptional && (
              <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-100">
                {/* Group Entity */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Group Entity
                  </label>
                  <input
                    type="text"
                    value={formData.groupEntity || ""}
                    onChange={(e) => updateField("groupEntity", e.target.value)}
                    placeholder="Enter group entity name"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Degree */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Degree</label>
                    <input
                      type="text"
                      value={formData.basicInfo?.degree || ""}
                      onChange={(e) => updateField("basicInfo.degree", e.target.value)}
                      placeholder="e.g., MD, DO"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Gender</label>
                    <select
                      value={formData.basicInfo?.genderTypeId || ""}
                      onChange={(e) => updateField("basicInfo.genderTypeId", Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    >
                      <option value="">Select gender</option>
                      {SELECT_OPTIONS.genderType.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.basicInfo?.cumc_department || ""}
                      onChange={(e) => updateField("basicInfo.cumc_department", e.target.value)}
                      placeholder="Enter department"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {/* Division */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Division
                    </label>
                    <input
                      type="text"
                      value={formData.basicInfo?.cumc_division || ""}
                      onChange={(e) => updateField("basicInfo.cumc_division", e.target.value)}
                      placeholder="Enter division"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Date Hired */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Date Hired
                    </label>
                    <input
                      type="date"
                      value={formData.basicInfo?.date_hire || ""}
                      onChange={(e) => updateField("basicInfo.date_hire", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Additional information can be added after creating the provider
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
