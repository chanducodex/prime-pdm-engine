"use client"

import { useState, useMemo, useCallback } from "react"
import { useGlobalSearch, HighlightText } from "@/components/layout/app-shell"
import {
  Search,
  X,
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  AlertCircle,
  Download,
  Upload,
  Plus,
  RefreshCw,
  Users,
  Trash2,
  MoreVertical,
  Zap,
  Activity,
} from "lucide-react"
import {
  mockCredentialingApplications,
  mockCredentialingMetrics,
  credentialingFilterOptions,
} from "@/lib/credentialing-mock-data"
import type { CredentialingApplication, CredentialingStatus, RiskLevel, CredentialingPriority } from "@/lib/credentialing-types"
import { CredentialingDetailDrawer } from "@/components/credentialing/credentialing-detail-drawer"
import { getMockUser } from "@/lib/credentialing-rbac"

interface FilterState {
  statuses: CredentialingStatus[]
  cycleTypes: string[]
  riskLevels: RiskLevel[]
  priorities: CredentialingPriority[]
  hasAlerts: boolean | null
  overdueOnly: boolean
}

export default function CredentialingPage() {
  const { globalSearch } = useGlobalSearch()
  const [applications, setApplications] = useState<CredentialingApplication[]>(mockCredentialingApplications)
  const [selectedApplication, setSelectedApplication] = useState<CredentialingApplication | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({
    statuses: [],
    cycleTypes: [],
    riskLevels: [],
    priorities: [],
    hasAlerts: null,
    overdueOnly: false,
  })
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignmentTarget, setAssignmentTarget] = useState<string[]>([]) // IDs to assign

  const searchTerm = globalSearch || localSearch

  // Calculate real-time metrics from current data
  const metrics = useMemo(() => {
    const byStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const inProgressCount =
      (byStatus.documents_pending || 0) +
      (byStatus.documents_received || 0) +
      (byStatus.extraction_in_progress || 0) +
      (byStatus.psv_in_progress || 0) +
      (byStatus.sanctions_screening || 0)

    const overdueCount = applications.filter((app) => app.daysRemaining < 0).length
    const urgentCount = applications.filter((app) => app.priority === "urgent").length
    const alertsCount = applications.reduce((sum, app) => sum + app.alerts.length, 0)

    return {
      total: applications.length,
      approved: byStatus.approved || 0,
      inProgress: inProgressCount,
      committeeReview: byStatus.committee_review || 0,
      overdue: overdueCount,
      urgent: urgentCount,
      alerts: alertsCount,
      denied: byStatus.denied || 0,
    }
  }, [applications])

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const nameMatch = app.providerName.toLowerCase().includes(search)
        const npiMatch = app.providerNPI.toString().includes(search)
        const idMatch = app.id.toLowerCase().includes(search)
        const specialtyMatch = app.providerSpecialty?.toLowerCase().includes(search)
        const deptMatch = app.providerDepartment?.toLowerCase().includes(search)
        const assigneeMatch = app.assignedTo?.toLowerCase().includes(search)
        if (!nameMatch && !npiMatch && !idMatch && !specialtyMatch && !deptMatch && !assigneeMatch) return false
      }

      // Status filter
      if (filterState.statuses.length > 0 && !filterState.statuses.includes(app.status)) {
        return false
      }

      // Cycle type filter
      if (filterState.cycleTypes.length > 0 && !filterState.cycleTypes.includes(app.cycleType)) {
        return false
      }

      // Risk level filter
      if (filterState.riskLevels.length > 0 && !filterState.riskLevels.includes(app.riskLevel)) {
        return false
      }

      // Priority filter
      if (filterState.priorities.length > 0 && !filterState.priorities.includes(app.priority)) {
        return false
      }

      // Has alerts filter
      if (filterState.hasAlerts === true && app.alerts.length === 0) return false
      if (filterState.hasAlerts === false && app.alerts.length > 0) return false

      // Overdue only
      if (filterState.overdueOnly && app.daysRemaining >= 0) return false

      return true
    })
  }, [applications, searchTerm, filterState])

  const totalPages = Math.ceil(filteredApplications.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [filterState, searchTerm])

  const handleViewDetails = useCallback((application: CredentialingApplication) => {
    setSelectedApplication(application)
    setIsDetailDrawerOpen(true)
  }, [])

  const handleRowSelect = useCallback((appId: string) => {
    setSelectedRows((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedRows.length === paginatedApplications.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedApplications.map((app) => app.id))
    }
  }, [selectedRows.length, paginatedApplications])

  const handleClearFilters = useCallback(() => {
    setFilterState({
      statuses: [],
      cycleTypes: [],
      riskLevels: [],
      priorities: [],
      hasAlerts: null,
      overdueOnly: false,
    })
  }, [])

  const activeFilterCount =
    filterState.statuses.length +
    filterState.cycleTypes.length +
    filterState.riskLevels.length +
    filterState.priorities.length +
    (filterState.hasAlerts !== null ? 1 : 0) +
    (filterState.overdueOnly ? 1 : 0)

  const getStatusBadge = (status: CredentialingStatus) => {
    const statusConfig = {
      not_started: { label: "Not Started", className: "bg-gray-100 text-gray-700", icon: Clock },
      documents_pending: { label: "Docs Pending", className: "bg-amber-100 text-amber-700", icon: FileText },
      documents_received: { label: "Docs Received", className: "bg-blue-100 text-blue-700", icon: FileText },
      extraction_in_progress: { label: "Extracting", className: "bg-blue-100 text-blue-700", icon: Activity },
      psv_in_progress: { label: "PSV", className: "bg-purple-100 text-purple-700", icon: Clock },
      sanctions_screening: { label: "Sanctions", className: "bg-indigo-100 text-indigo-700", icon: ShieldCheck },
      committee_review: { label: "Committee", className: "bg-violet-100 text-violet-700", icon: Users },
      approved: { label: "Approved", className: "bg-green-100 text-green-700", icon: CheckCircle },
      denied: { label: "Denied", className: "bg-red-100 text-red-700", icon: X },
      conditional_approval: { label: "Conditional", className: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
      deferred: { label: "Deferred", className: "bg-gray-100 text-gray-700", icon: Clock },
      expired: { label: "Expired", className: "bg-red-100 text-red-700", icon: AlertCircle },
      recredentialing_due: { label: "Re-Cred Due", className: "bg-orange-100 text-orange-700", icon: RefreshCw },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const getRiskBadge = (riskLevel: RiskLevel) => {
    const riskConfig = {
      low: { label: "Low", className: "bg-green-50 text-green-700 border-green-200" },
      medium: { label: "Medium", className: "bg-amber-50 text-amber-700 border-amber-200" },
      high: { label: "High", className: "bg-red-50 text-red-700 border-red-200" },
    }

    const config = riskConfig[riskLevel]
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded border ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getPriorityBadge = (priority: CredentialingPriority) => {
    const config = {
      routine: { label: "Routine", className: "text-gray-600" },
      expedited: { label: "Expedited", className: "text-blue-600" },
      urgent: { label: "Urgent", className: "text-red-600 font-semibold" },
    }
    return <span className={`text-xs ${config[priority].className}`}>{config[priority].label}</span>
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Credentialing-as-a-Service (CaaS)</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Provider credentialing, verification, and NCQA compliance management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </div>

        {/* Metrics Summary - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
          <div className="rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-violet-50 to-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-600/10 to-transparent rounded-bl-full"></div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium text-gray-700">Total</div>
              <div className="p-2 bg-violet-100 rounded-lg">
                <FileText className="h-4 w-4 text-violet-600" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-violet-900">{metrics.total}</div>
            </div>
          </div>
          <div className="rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-600/10 to-transparent rounded-bl-full"></div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium text-gray-700">Approved</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-green-900">{metrics.approved}</div>
            </div>
          </div>
          <div className="rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-600/10 to-transparent rounded-bl-full"></div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium text-gray-700">In Progress</div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-blue-900">{metrics.inProgress}</div>
            </div>
          </div>
          <div className="rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-600/10 to-transparent rounded-bl-full"></div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium text-gray-700">Committee</div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-purple-900">{metrics.committeeReview}</div>
            </div>
          </div>
          <div className="rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 to-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-600/10 to-transparent rounded-bl-full"></div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium text-gray-700">Overdue</div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-red-900">{metrics.overdue}</div>
            </div>
          </div>
          <div className="rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-600/10 to-transparent rounded-bl-full"></div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium text-gray-700">Urgent</div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-orange-900">{metrics.urgent}</div>
            </div>
          </div>
          <div className="rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-600/10 to-transparent rounded-bl-full"></div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium text-gray-700">Alerts</div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-amber-900">{metrics.alerts}</div>
            </div>
          </div>
          <div className="rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-600/10 to-transparent rounded-bl-full"></div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium text-gray-700">Denied</div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <X className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-gray-900">{metrics.denied}</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by provider, NPI, specialty, application ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
                activeFilterCount > 0
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-violet-600 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-violet-600 hover:text-violet-700"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {credentialingFilterOptions.statuses.slice(0, 8).map((status) => (
                        <button
                          key={status.id}
                          onClick={() =>
                            setFilterState((prev) => ({
                              ...prev,
                              statuses: prev.statuses.includes(status.id as CredentialingStatus)
                                ? prev.statuses.filter((s) => s !== status.id)
                                : [...prev.statuses, status.id as CredentialingStatus],
                            }))
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
                            filterState.statuses.includes(status.id as CredentialingStatus)
                              ? "bg-violet-100 text-violet-700 border-violet-300"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Risk Level Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Risk Level</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {credentialingFilterOptions.riskLevels.map((risk) => (
                        <button
                          key={risk.id}
                          onClick={() =>
                            setFilterState((prev) => ({
                              ...prev,
                              riskLevels: prev.riskLevels.includes(risk.id as RiskLevel)
                                ? prev.riskLevels.filter((r) => r !== risk.id)
                                : [...prev.riskLevels, risk.id as RiskLevel],
                            }))
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
                            filterState.riskLevels.includes(risk.id as RiskLevel)
                              ? "bg-violet-100 text-violet-700 border-violet-300"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {risk.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Priority</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {credentialingFilterOptions.priorities.map((priority) => (
                        <button
                          key={priority.id}
                          onClick={() =>
                            setFilterState((prev) => ({
                              ...prev,
                              priorities: prev.priorities.includes(priority.id as CredentialingPriority)
                                ? prev.priorities.filter((p) => p !== priority.id)
                                : [...prev.priorities, priority.id as CredentialingPriority],
                            }))
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
                            filterState.priorities.includes(priority.id as CredentialingPriority)
                              ? "bg-violet-100 text-violet-700 border-violet-300"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cycle Type Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Cycle Type</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {credentialingFilterOptions.cycleTypes.map((cycle) => (
                        <button
                          key={cycle.id}
                          onClick={() =>
                            setFilterState((prev) => ({
                              ...prev,
                              cycleTypes: prev.cycleTypes.includes(cycle.id)
                                ? prev.cycleTypes.filter((c) => c !== cycle.id)
                                : [...prev.cycleTypes, cycle.id],
                            }))
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
                            filterState.cycleTypes.includes(cycle.id)
                              ? "bg-violet-100 text-violet-700 border-violet-300"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {cycle.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Quick Filters</label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterState.hasAlerts === true}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              hasAlerts: e.target.checked ? true : null,
                            }))
                          }
                          className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Has alerts</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterState.overdueOnly}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              overdueOnly: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Overdue only</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedRows.length} selected</span>
              <button
                onClick={() => {
                  setAssignmentTarget(selectedRows)
                  setIsAssignModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
              >
                <Users className="w-4 h-4" />
                Assign
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedRows.length} selected applications?`)) {
                    setApplications((prev) => prev.filter((app) => !selectedRows.includes(app.id)))
                    setSelectedRows([])
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto text-sm text-gray-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </header>

      {/* Click outside to close filter */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
      )}

      {/* Data Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === paginatedApplications.length && paginatedApplications.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="w-20 px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium">No applications found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map((application) => {
                    const isSelected = selectedRows.includes(application.id)
                    return (
                      <tr
                        key={application.id}
                        className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-violet-50" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelect(application.id)}
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-sm font-mono font-medium text-violet-600">
                              <HighlightText text={application.id} search={searchTerm} />
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {getPriorityBadge(application.priority)}
                              {application.alerts.length > 0 && (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  {application.alerts.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-violet-700">
                                {application.providerName.split(" ").pop()?.[0] || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                <HighlightText text={application.providerName} search={searchTerm} />
                              </p>
                              <p className="text-xs text-gray-500">
                                NPI: <HighlightText text={application.providerNPI.toString()} search={searchTerm} /> •{" "}
                                <HighlightText text={application.providerSpecialty || "—"} search={searchTerm} />
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              application.cycleType === "initial"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {application.cycleType === "initial" ? "Initial" : "Re-Cred"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(application.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  application.progressPercentage === 100
                                    ? "bg-green-500"
                                    : "bg-gradient-to-r from-violet-500 to-purple-600"
                                }`}
                                style={{ width: `${application.progressPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 min-w-[2.5rem] text-right">
                              {application.progressPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getRiskBadge(application.riskLevel)}</td>
                        <td className="px-4 py-3">
                          <div>
                            <span
                              className={`text-sm font-medium ${
                                application.daysRemaining < 0
                                  ? "text-red-600"
                                  : application.daysRemaining < 30
                                  ? "text-amber-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {application.daysRemaining < 0
                                ? `${Math.abs(application.daysRemaining)}d overdue`
                                : application.daysRemaining > 0
                                ? `${application.daysRemaining}d left`
                                : "Due today"}
                            </span>
                            <p className="text-xs text-gray-500">
                              NCQA: {new Date(application.ncqaDeadline).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setAssignmentTarget([application.id])
                              setIsAssignModalOpen(true)
                            }}
                            className="text-sm text-gray-700 hover:text-violet-600 truncate max-w-[150px] text-left transition-colors"
                            title={`Reassign from ${application.assignedTo}`}
                          >
                            {application.assignedTo.split(",")[0]}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewDetails(application)}
                              className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveDropdown(activeDropdown === application.id ? null : application.id)
                                }
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="More actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {activeDropdown === application.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setActiveDropdown(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                    <button
                                      onClick={() => {
                                        setAssignmentTarget([application.id])
                                        setIsAssignModalOpen(true)
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Users className="w-4 h-4" />
                                      Reassign
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleViewDetails(application)
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(application.id)
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <FileText className="w-4 h-4" />
                                      Copy ID
                                    </button>
                                    <button
                                      onClick={() => {
                                        alert(`Export functionality for ${application.id}`)
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Download className="w-4 h-4" />
                                      Export Report
                                    </button>
                                    <div className="border-t border-gray-100 my-1" />
                                    <button
                                      onClick={() => {
                                        if (confirm(`Delete application ${application.id}?`)) {
                                          setApplications((prev) => prev.filter((app) => app.id !== application.id))
                                        }
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredApplications.length > 0 && (
            <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredApplications.length)}</span> of{" "}
                <span className="font-medium">{filteredApplications.length}</span> applications
                {selectedRows.length > 0 && (
                  <span className="ml-3 text-violet-600">({selectedRows.length} selected)</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number
                    if (totalPages <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-violet-600 text-white"
                            : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Detail Drawer with All 6 Tabs */}
      {isDetailDrawerOpen && selectedApplication && (
        <CredentialingDetailDrawer
          application={selectedApplication}
          onClose={() => {
            setIsDetailDrawerOpen(false)
            setSelectedApplication(null)
          }}
          onUpdate={(updatedApp) => {
            setApplications((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)))
            setSelectedApplication(updatedApp)
          }}
        />
      )}

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAssignModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assign Applications ({assignmentTarget.length})
                </h3>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign to</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">Select assignee...</option>
                <option value="jane">Jane Smith, Senior Credentialing Specialist</option>
                <option value="mike">Mike Chen, Credentialing Coordinator</option>
                <option value="sarah">Sarah Lee, Senior Credentialing Analyst</option>
                <option value="tom">Tom Wilson, Credentialing Associate</option>
                <option value="lisa">Lisa Anderson, Re-credentialing Coordinator</option>
                <option value="jennifer">Jennifer Martinez, Credentialing Analyst</option>
              </select>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Assigned ${assignmentTarget.length} applications`)
                  setIsAssignModalOpen(false)
                  setSelectedRows([])
                  setAssignmentTarget([])
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
