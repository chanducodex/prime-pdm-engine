"use client"

import { useState, useEffect } from "react"
import type { Provider, FieldConfig } from "@/lib/provider-types"
import { X, Save, RotateCcw, ChevronDown, ChevronRight, Upload, Trash2, Plus, AlertCircle } from "lucide-react"

interface ProviderEditDrawerProps {
  provider: Provider
  fieldConfig: FieldConfig[]
  onClose: () => void
  onSave: (provider: Provider) => void
}

export function ProviderEditDrawer({ provider, fieldConfig, onClose, onSave }: ProviderEditDrawerProps) {
  const [editedProvider, setEditedProvider] = useState(provider)
  const [activeTab, setActiveTab] = useState("basic")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    professionalInfo: true,
    contactInfo: false,
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [hasUnsavedChanges])

  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(provider) !== JSON.stringify(editedProvider))
  }, [editedProvider, provider])

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const handleSave = () => {
    // Validation
    const errors: Record<string, string> = {}
    if (!editedProvider.firstName) errors.firstName = "First name is required"
    if (!editedProvider.lastName) errors.lastName = "Last name is required"
    if (!editedProvider.npi) errors.npi = "NPI is required"

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    onSave(editedProvider)
  }

  const handleRevert = () => {
    setEditedProvider(provider)
    setValidationErrors({})
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const updateField = (field: string, value: string | number) => {
    setEditedProvider((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const updateBasicInfo = (field: string, value: string) => {
    setEditedProvider((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value },
    }))
  }

  const tabs = [
    { id: "basic", label: "Basic Information" },
    { id: "locations", label: "Locations" },
    { id: "specialties", label: "Specialties" },
    { id: "education", label: "Education" },
    { id: "documents", label: "Documents" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-4xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-violet-700">
                {editedProvider.firstName[0]}
                {editedProvider.lastName[0]}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Provider: {editedProvider.firstName} {editedProvider.lastName}
              </h2>
              <p className="text-sm text-gray-500">
                NPI: {editedProvider.npi} • ID: {editedProvider.provider_Id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Unsaved changes</span>
            )}
            <button
              onClick={handleRevert}
              disabled={!hasUnsavedChanges}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Revert changes"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex px-6 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "text-violet-700 border-violet-600 bg-white"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "basic" && (
            <div className="space-y-6 max-w-3xl">
              {/* Personal Information Section */}
              <section className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("personalInfo")}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
                  {expandedSections.personalInfo ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.personalInfo && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editedProvider.firstName}
                          onChange={(e) => updateField("firstName", e.target.value)}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                            validationErrors.firstName ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {validationErrors.firstName && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Middle Name</label>
                        <input
                          type="text"
                          value={editedProvider.middleName}
                          onChange={(e) => updateField("middleName", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editedProvider.lastName}
                          onChange={(e) => updateField("lastName", e.target.value)}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                            validationErrors.lastName ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {validationErrors.lastName && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          NPI <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editedProvider.npi}
                          onChange={(e) => updateField("npi", Number(e.target.value) || 0)}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono ${
                            validationErrors.npi ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Provider Type</label>
                        <select
                          value={editedProvider.providerType}
                          onChange={(e) => updateField("providerType", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                        >
                          <option value="Individual">Individual</option>
                          <option value="Organization">Organization</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Professional Information Section */}
              <section className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("professionalInfo")}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-900">Professional Information</h3>
                  {expandedSections.professionalInfo ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.professionalInfo && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Degree</label>
                        <input
                          type="text"
                          value={editedProvider.basicInfo.degree || ""}
                          onChange={(e) => updateBasicInfo("degree", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Degree Description</label>
                        <input
                          type="text"
                          value={editedProvider.basicInfo.degree_description || ""}
                          onChange={(e) => updateBasicInfo("degree_description", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Department</label>
                        <input
                          type="text"
                          value={editedProvider.basicInfo.cumc_department || ""}
                          onChange={(e) => updateBasicInfo("cumc_department", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Division</label>
                        <input
                          type="text"
                          value={editedProvider.basicInfo.cumc_division || ""}
                          onChange={(e) => updateBasicInfo("cumc_division", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Approval Status</label>
                        <select
                          value={editedProvider.basicInfo.cred_approval_status || ""}
                          onChange={(e) => updateBasicInfo("cred_approval_status", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                        >
                          <option value="">Select status</option>
                          <option value="Approved">Approved</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">CAQH ID</label>
                        <input
                          type="text"
                          value={editedProvider.basicInfo.caqhId || ""}
                          onChange={(e) => updateBasicInfo("caqhId", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Date Hired</label>
                        <input
                          type="date"
                          value={editedProvider.basicInfo.date_hire || ""}
                          onChange={(e) => updateBasicInfo("date_hire", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Affiliation Status</label>
                        <input
                          type="text"
                          value={editedProvider.basicInfo.affiliation_status || ""}
                          onChange={(e) => updateBasicInfo("affiliation_status", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "locations" && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Locations ({editedProvider.address.length})</h3>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
              </div>
              {editedProvider.address.map((addr, index) => (
                <div key={addr.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Location {index + 1}</h4>
                    <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Address Line 1</label>
                      <input
                        type="text"
                        value={addr.addressLineFirst}
                        readOnly
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                      <input
                        type="text"
                        value={addr.city}
                        readOnly
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">State</label>
                      <input
                        type="text"
                        value={addr.stateId}
                        readOnly
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">ZIP Code</label>
                      <input
                        type="text"
                        value={addr.zipCode}
                        readOnly
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">County</label>
                      <input
                        type="text"
                        value={addr.county || "-"}
                        readOnly
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                  {addr.healthPlan && addr.healthPlan.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-2">Health Plans</p>
                      <div className="flex flex-wrap gap-2">
                        {addr.healthPlan.map((hp) => (
                          <span
                            key={hp.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700"
                          >
                            {hp.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "specialties" && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Specialties ({editedProvider.specialties.length})</h3>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Specialty
                </button>
              </div>
              {editedProvider.specialties.map((specialty) => (
                <div key={specialty.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">{specialty.name}</h4>
                    <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Board Status</p>
                      <p className="text-gray-900">{specialty.board_status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Certificate Issuer</p>
                      <p className="text-gray-900">{specialty.certificateIssuerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Issue Date</p>
                      <p className="text-gray-900">{specialty.issueDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expiry Date</p>
                      <p className="text-gray-900">{specialty.expiryDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "education" && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Education ({editedProvider.educations.length})</h3>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Education
                </button>
              </div>
              {editedProvider.educations.map((edu) => (
                <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">{edu.schoolName}</h4>
                    <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Degree</p>
                      <p className="text-gray-900">{edu.degreeName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Country</p>
                      <p className="text-gray-900">{edu.country || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-gray-900">{edu.degreeStartDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="text-gray-900">{edu.degreeEndDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Documents & Attachments</h3>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Drag and drop files here or click to browse</p>
                <p className="text-xs text-gray-400">Supports PDF, JPG, PNG up to 10MB</p>
                <input type="file" className="hidden" />
                <button className="mt-4 px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors">
                  Browse Files
                </button>
              </div>

              {/* Existing Documents */}
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-medium text-red-600">PDF</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Medical_License.pdf</p>
                      <p className="text-xs text-gray-500">245 KB • Uploaded Jan 10, 2026</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">JPG</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile_Photo.jpg</p>
                      <p className="text-xs text-gray-500">1.2 MB • Uploaded Dec 15, 2025</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRevert}
              disabled={!hasUnsavedChanges}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Revert
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
