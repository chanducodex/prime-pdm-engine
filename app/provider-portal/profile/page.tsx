"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Award,
  GraduationCap,
  FileCheck,
  Building2,
  Shield,
  CreditCard,
} from "lucide-react"
import { useProviderAuth } from "@/lib/provider-auth-context"
import type { Provider } from "@/lib/provider-types"
import { useProviderEditState } from "@/lib/hooks/use-provider-edit-state"
import { generateId } from "@/lib/utils/deep-utils"

// Import existing tab components from provider-edit-drawer
import { BasicInfoTab } from "@/components/providers/provider-edit-drawer/tabs/basic-info-tab"
import { LicensesTab } from "@/components/providers/provider-edit-drawer/tabs/licenses-tab"
import { EducationTab } from "@/components/providers/provider-edit-drawer/tabs/education-tab"
import { SpecialtiesTab } from "@/components/providers/provider-edit-drawer/tabs/specialties-tab"
import { AffiliationsTab } from "@/components/providers/provider-edit-drawer/tabs/affiliations-tab"
import { MalpracticeTab } from "@/components/providers/provider-edit-drawer/tabs/malpractice-tab"
import { MedicareTab } from "@/components/providers/provider-edit-drawer/tabs/medicare-tab"
import { LocationsTab } from "@/components/providers/provider-edit-drawer/tabs/locations-tab"

const TAB_CONFIG = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "specialties", label: "Specialties", icon: Award },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "licenses", label: "Licenses", icon: FileCheck },
  { id: "affiliations", label: "Affiliations", icon: Building2 },
  { id: "malpractice", label: "Malpractice", icon: Shield },
  { id: "medicare", label: "Medicare", icon: CreditCard },
]

// Mock provider data - in production, load from API based on logged-in user
const getMockProvider = (user?: { firstName?: string; lastName?: string; email?: string }): Provider => ({
  provider_Id: 1,
  npi: 1234567890,
  firstName: user?.firstName || "John",
  lastName: user?.lastName || "Doe",
  middleName: "",
  providerType: "Individual",
  groupEntity: "",
  basicInfo: {
    affiliation_status: "",
    cumc_division: "",
    initial_appr_date: "",
    degree_description: "",
    cred_approval_status: "PENDING",
    prior_appr_date: "",
    current_appr_date: "",
    date_hire: "",
    dateOfBirth: "",
    current_exp_date: "",
    fellow_y_n: "N",
    genderTypeId: 1,
    caqhId: 0,
    degree: "MD",
    cumc_department: "",
    uni: "",
    id: 1,
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
  wheelChairAccess: false,
})

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useProviderAuth()
  const [activeTab, setActiveTab] = useState("basic")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Initialize provider data
  const [provider, setProvider] = useState<Provider>(() => getMockProvider(user ?? undefined))

  // Use the existing edit state hook - pass provider as initial value
  const editState = useProviderEditState(provider)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (editState.isDirty) handleSave()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [editState.isDirty])

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editState.isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [editState.isDirty])

  const handleSave = useCallback(async () => {
    // Validate required fields
    const errors: Record<string, string> = {}

    if (!editState.editedProvider.firstName?.trim()) {
      errors.firstName = "First name is required"
    }
    if (!editState.editedProvider.lastName?.trim()) {
      errors.lastName = "Last name is required"
    }
    if (!editState.editedProvider.npi) {
      errors.npi = "NPI is required"
    } else if (String(editState.editedProvider.npi).length !== 10) {
      errors.npi = "NPI must be 10 digits"
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setActiveTab("basic")
      return
    }

    setIsSaving(true)
    setValidationErrors({})

    try {
      // Simulate API call - in production, call actual API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mark current state as saved - this clears the dirty flag
      editState.markAsSaved()

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }, [editState])

  const handleRevertAll = useCallback(() => {
    editState.revertAll()
    setValidationErrors({})
    setSaveSuccess(false)
  }, [editState])

  const handleTabChange = useCallback((tabId: string) => {
    if (editState.isDirty && activeTab !== tabId) {
      setPendingNavigation(tabId)
      setShowUnsavedDialog(true)
    } else {
      setActiveTab(tabId)
    }
  }, [editState.isDirty, activeTab])

  const handleConfirmNavigation = useCallback(() => {
    setShowUnsavedDialog(false)
    if (pendingNavigation) {
      setActiveTab(pendingNavigation)
      setPendingNavigation(null)
    }
  }, [pendingNavigation])

  const handleDiscardAndNavigate = useCallback(() => {
    editState.revertAll()
    setShowUnsavedDialog(false)
    if (pendingNavigation) {
      setActiveTab(pendingNavigation)
      setPendingNavigation(null)
    }
  }, [editState, pendingNavigation])

  const handleAddRecord = useCallback((recordType: string, parentPath?: string) => {
    const { addArrayItem } = editState

    // Use existing default values from the types file
    switch (recordType) {
      case "license.DEA":
        addArrayItem("license.DEA", {
          id: Date.now(),
          licenseNumber: "",
          licenseExpiryDate: "",
          category: 3,
        })
        break
      case "license.CDS":
        addArrayItem("license.CDS", {
          id: Date.now(),
          licenseNumber: "",
          licenseExpiryDate: "",
          category: 2,
        })
        break
      case "education":
        addArrayItem("educations", {
          id: Date.now(),
          type: null,
          country: null,
          schoolName: "",
          degreeName: "",
          degreeStartDate: "",
          degreeEndDate: "",
          status: null,
        })
        break
      case "specialty":
        addArrayItem("specialties", {
          id: Date.now(),
          name: "",
          board_status: "",
          certificateIssuerName: "",
          issueDate: "",
          expiryDate: "",
          not_cert_reason: null,
          antic_exam_date: null,
          ispracticing: null,
          master_id: 0,
          specialtyName: "",
        })
        break
      case "affiliation":
        addArrayItem("affiliations", {
          id: Date.now(),
          affiliationName: "",
          startDate: "",
          endDate: "",
          code: "",
          category: "",
        })
        break
      case "malpractice":
        addArrayItem("malpractice", {
          insurance_carrier: "",
          insurance_policy_num: "",
          ins_Cov_From: "",
          ins_Cov_To: "",
          ins_Cov_Limit_From: "",
          ins_Cov_Limit_To: "",
          ins_Cov_Type: "Claims Made",
        })
        break
      case "medicare":
        addArrayItem("medicare", {
          id: Date.now(),
          medicareType: "Physician",
          medicarePtan: "",
          effectiveDate: "",
          terminationDate: "",
          medicareStateId: 33,
        })
        break
      case "address":
        addArrayItem("address", {
          id: Date.now(),
          addressLineFirst: "",
          addressLineSecond: "",
          city: "",
          stateId: 33,
          zipCode: "",
          county: "",
          pcp_panel: null,
          payerDirectory: null,
          wheelChairAccess: false,
          externalID: "",
          healthPlan: [],
        })
        break
      case "healthPlan":
        if (parentPath) {
          addArrayItem(`${parentPath}.healthPlan`, {
            id: Date.now(),
            plan_par_status: "PAR",
            plan_action_date: "",
            startDate: "",
            endDate: "",
            plan_tier: "",
            plan_assigned_id: "",
            externalID: "",
            plan_type_code: "",
            name: "",
            master_id: 0,
          })
        }
        break
    }
  }, [editState])

  const handleDeleteRecord = useCallback((path: string, index: number, name: string) => {
    editState.removeArrayItem(path, index)
  }, [editState])

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return <BasicInfoTab editState={editState} validationErrors={validationErrors} />

      case "locations":
        return (
          <LocationsTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )

      case "specialties":
        return (
          <SpecialtiesTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )

      case "education":
        return (
          <EducationTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )

      case "licenses":
        return (
          <LicensesTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )

      case "affiliations":
        return (
          <AffiliationsTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )

      case "malpractice":
        return (
          <MalpracticeTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )

      case "medicare":
        return (
          <MedicareTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
            <User className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">Update your professional information</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editState.isDirty && (
            <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {editState.modifiedFields.size} unsaved changes
            </span>
          )}

          <button
            onClick={handleRevertAll}
            disabled={!editState.isDirty}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Revert all changes"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleSave}
            disabled={!editState.isDirty || isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warning banner */}
      {editState.isDirty && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          You have unsaved changes. Press Ctrl+S to save or click the Save button.
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-gray-50/50 rounded-t-xl border border-gray-200 border-b-0">
        <nav className="flex gap-0.5 overflow-hidden px-1">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors rounded-t-lg flex-1 min-w-0 ${
                  isActive
                    ? "text-violet-700 border-violet-600 bg-white"
                    : "text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-white/50"
                }`}
                title={tab.label}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                <span className="hidden md:inline truncate">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-white rounded-b-xl border border-gray-200 p-6">
        {renderTabContent()}
      </div>

      {/* Unsaved Changes Dialog */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUnsavedDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
            <p className="text-gray-600 mb-4">
              You have {editState.modifiedFields.size} unsaved change{editState.modifiedFields.size > 1 ? "s" : ""}.
              Do you want to save before switching tabs?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDiscardAndNavigate}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowUnsavedDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Stay Here
              </button>
              <button
                onClick={handleConfirmNavigation}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
              >
                Keep Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
