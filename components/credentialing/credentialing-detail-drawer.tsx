"use client"

import { useState, useEffect } from "react"
import type { CredentialingApplication } from "@/lib/credentialing-types"
import {
  X,
  FileText,
  AlertTriangle,
  Clock,
  Building2,
  Award,
  Stethoscope,
  ExternalLink,
  User,
} from "lucide-react"
import { CredentialingStatusTab } from "./credentialing-status-tab"
import { DocumentsUploadTab } from "./documents-upload-tab"
import { PSVResultsTab } from "./psv-results-tab"
import { SanctionsScreeningTab } from "./sanctions-screening-tab"
import { CommitteeReviewTab } from "./committee-review-tab"
import { RecredentialingCycleTab } from "./recredentialing-cycle-tab"
import { WorkflowActionBar } from "./workflow-action-bar"
import { getMockUser, getRoleDisplayName, type UserContext } from "@/lib/credentialing-rbac"
import {
  getDrawerViewMode,
  getDrawerConfig,
  getVisibleTabs,
  type TabId,
  type DrawerViewMode,
} from "./drawer-tab-config"

interface CredentialingDetailDrawerProps {
  application: CredentialingApplication
  onClose: () => void
  onUpdate?: (application: CredentialingApplication) => void
  /** Override the user context (useful for provider portal) */
  userOverride?: UserContext
  /** Force a specific view mode (useful for testing) */
  viewModeOverride?: DrawerViewMode
}

export function CredentialingDetailDrawer({
  application,
  onClose,
  onUpdate,
  userOverride,
  viewModeOverride,
}: CredentialingDetailDrawerProps) {
  const currentUser = userOverride || getMockUser() // In production, get from auth context
  const viewMode = viewModeOverride || getDrawerViewMode(currentUser.role)
  const drawerConfig = getDrawerConfig(viewMode)
  const visibleTabs = getVisibleTabs(viewMode)

  const [activeTab, setActiveTab] = useState<TabId>(drawerConfig.defaultTab)
  const [localApplication, setLocalApplication] = useState(application)

  const handleApplicationUpdate = (updatedApp: CredentialingApplication) => {
    setLocalApplication(updatedApp)
    onUpdate?.(updatedApp)
  }

  const handleStatusChange = (newStatus: string, actionId: string) => {
    const updated = {
      ...localApplication,
      status: newStatus as any,
      notes: [...localApplication.notes, `Status changed to ${newStatus} by ${currentUser.name} (${actionId})`],
    }
    handleApplicationUpdate(updated)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Use role-based visible tabs with computed badges
  const tabs = visibleTabs.map((tab) => ({
    ...tab,
    badge: tab.getBadge ? tab.getBadge(localApplication) : null,
  }))

  const getStatusBadgeClass = () => {
    switch (localApplication.status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200"
      case "denied":
        return "bg-red-100 text-red-700 border-red-200"
      case "committee_review":
        return "bg-violet-100 text-violet-700 border-violet-200"
      case "psv_in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "sanctions_screening":
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      case "documents_pending":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "recredentialing_due":
        return "bg-orange-100 text-orange-700 border-orange-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusLabel = () => {
    switch (localApplication.status) {
      case "approved":
        return "Approved"
      case "denied":
        return "Denied"
      case "committee_review":
        return "Committee Review"
      case "psv_in_progress":
        return "PSV In Progress"
      case "sanctions_screening":
        return "Sanctions Screening"
      case "documents_pending":
        return "Documents Pending"
      case "extraction_in_progress":
        return "Data Extraction"
      case "recredentialing_due":
        return "Re-credentialing Due"
      case "conditional_approval":
        return "Conditional Approval"
      default:
        return "In Progress"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Main Drawer */}
      <div className="ml-auto relative w-full max-w-7xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="px-6 py-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Provider Avatar */}
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center border-2 border-violet-200">
                  <span className="text-xl font-bold text-violet-700">
                    {localApplication.providerSnapshot.firstName[0]}
                    {localApplication.providerSnapshot.lastName[0]}
                  </span>
                </div>

                {/* Provider Info - Left Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900 truncate">
                      {localApplication.providerSnapshot.firstName}{" "}
                      {localApplication.providerSnapshot.middleName && `${localApplication.providerSnapshot.middleName} `}
                      {localApplication.providerSnapshot.lastName}, {localApplication.providerSnapshot.degree}
                    </h2>
                    {localApplication.alerts.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-medium flex-shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {localApplication.alerts.length}
                      </span>
                    )}
                  </div>

                  {/* Provider Quick Info - 4 columns */}
                  <div className="grid grid-cols-4 gap-x-6 gap-y-2 text-sm mb-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Stethoscope className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{localApplication.providerSnapshot.specialty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{localApplication.providerSnapshot.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-mono">NPI: {localApplication.providerNPI}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{localApplication.providerSnapshot.providerType}</span>
                    </div>
                  </div>

                  {/* Application Metrics Row */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      {localApplication.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium ${
                        localApplication.daysRemaining < 0
                          ? "bg-red-100 text-red-700"
                          : localApplication.daysRemaining < 30
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {localApplication.daysRemaining > 0
                        ? `${localApplication.daysRemaining}d left`
                        : localApplication.daysRemaining < 0
                        ? `${Math.abs(localApplication.daysRemaining)}d overdue`
                        : "Due today"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border-2 ${getStatusBadgeClass()}`}>
                      {getStatusLabel()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Stats & Actions */}
              <div className="flex flex-col items-end gap-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                    title="View full provider profile"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close drawer (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Key Stats Cards */}
                <div className="flex items-center gap-3">
                  <div className="text-center px-4 py-2 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-lg">
                    <div className="text-xs font-medium text-violet-600 mb-0.5">Progress</div>
                    <div className="text-xl font-bold text-violet-900">{localApplication.progressPercentage}%</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 mb-0.5">Risk</div>
                    <div className={`text-xl font-bold ${
                      localApplication.riskLevel === "high"
                        ? "text-red-700"
                        : localApplication.riskLevel === "medium"
                        ? "text-amber-700"
                        : "text-green-700"
                    }`}>
                      {localApplication.riskLevel.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-center px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                    <div className="text-xs font-medium text-blue-600 mb-0.5">Type</div>
                    <div className="text-sm font-bold text-blue-900">{localApplication.cycleType === "initial" ? "Initial" : "Re-Cred"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    localApplication.progressPercentage === 100
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : "bg-gradient-to-r from-violet-500 to-purple-600"
                  }`}
                  style={{ width: `${localApplication.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-violet-600 text-violet-600 bg-violet-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        isActive ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {typeof tab.badge === "number" ? `${tab.badge}%` : tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {/* Workflow Action Bar - Shows available next actions (hidden for providers) */}
            {drawerConfig.showWorkflowActions && (
              <WorkflowActionBar
                application={localApplication}
                user={currentUser}
                onStatusChange={handleStatusChange}
              />
            )}

            {activeTab === "status" && (
              <CredentialingStatusTab
                application={localApplication}
                onUpdate={handleApplicationUpdate}
                currentUser={currentUser}
              />
            )}
            {activeTab === "documents" && (
              <DocumentsUploadTab
                application={localApplication}
                onUpdate={handleApplicationUpdate}
                currentUser={currentUser}
              />
            )}
            {activeTab === "psv" && (
              <PSVResultsTab
                application={localApplication}
                onUpdate={handleApplicationUpdate}
                currentUser={currentUser}
              />
            )}
            {activeTab === "sanctions" && (
              <SanctionsScreeningTab
                application={localApplication}
                onUpdate={handleApplicationUpdate}
                currentUser={currentUser}
              />
            )}
            {activeTab === "committee" && (
              <CommitteeReviewTab
                application={localApplication}
                onUpdate={handleApplicationUpdate}
                currentUser={currentUser}
              />
            )}
            {activeTab === "recredentialing" && (
              <RecredentialingCycleTab
                application={localApplication}
                onUpdate={handleApplicationUpdate}
                currentUser={currentUser}
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Show assignment info only for staff views */}
              {drawerConfig.showAssignment && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Assigned to:</span> {localApplication.assignedTo.split(",")[0]}
                </div>
              )}
              <div className="text-xs text-gray-500">
                <span className="font-medium">Your role:</span> {getRoleDisplayName(currentUser.role)}
              </div>
              <div className="text-xs text-gray-500">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Esc</kbd> to close
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {/* Export button - hidden from providers */}
              {drawerConfig.showExport && (
                <button className="px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors">
                  Export Report
                </button>
              )}
              {/* Update button - only for admin/staff views */}
              {viewMode === "admin" && (
                <button className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors shadow-sm">
                  Update Application
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
