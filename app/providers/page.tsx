"use client"

import { useState, useMemo, useCallback } from "react"
import { mockFilterConfig, mockFieldConfig } from "@/lib/provider-mock-data"
import { mockProviderData } from "@/lib/mock-provider-data"
import type { Provider, FilterState, FieldConfig } from "@/lib/provider-types"
import { useGlobalSearch, HighlightText } from "@/components/layout/app-shell"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Plus,
  Search,
  X,
  SlidersHorizontal,
  Edit,
  Trash2,
  Check,
  Filter,
} from "lucide-react"
import { ProviderEditDrawer } from "@/components/providers/provider-edit-drawer"
import { FilterPopup } from "@/components/providers/filter-popup"
import { AddProviderModal } from "@/components/providers/add-provider-modal"
import { AdvancedFilterBuilder, applyFilterRules, type FilterRule } from "@/components/providers/advanced-filter-builder"
import { DeleteConfirmation } from "@/components/providers/provider-edit-drawer/confirmation-dialog"

export default function ProvidersPage() {
  const { globalSearch } = useGlobalSearch()
  const [providers, setProviders] = useState<Provider[]>(mockProviderData)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState("")
  const [filterState, setFilterState] = useState<FilterState>({
    search: "",
    healthPlanIds: [],
    specialtyIds: [],
    genderTypeIds: [],
    stateIds: [],
    schoolNames: [],
    locationStatus: false,
    wheelChairAccess: false,
  })
  const [advancedFilterRules, setAdvancedFilterRules] = useState<FilterRule[]>([])
  const [fieldConfig] = useState<FieldConfig[]>(mockFieldConfig)
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    provider: Provider | null
  }>({ isOpen: false, provider: null })

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Combine global and local search
  const searchTerm = globalSearch || localSearch

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      // Search filter (combined)
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const fullName = `${provider.firstName} ${provider.middleName} ${provider.lastName}`.toLowerCase()
        const npiMatch = provider.npi.toString().includes(search)
        const departmentMatch = provider.basicInfo.cumc_department?.toLowerCase().includes(search)
        const specialtyMatch = provider.specialties.some((s) => s.name.toLowerCase().includes(search))
        if (!fullName.includes(search) && !npiMatch && !departmentMatch && !specialtyMatch) return false
      }

      // Health plan filter
      if (filterState.healthPlanIds.length > 0) {
        const hasHealthPlan = provider.address.some((addr) =>
          addr.healthPlan?.some((hp) => filterState.healthPlanIds.includes(hp.master_id)),
        )
        if (!hasHealthPlan) return false
      }

      // Specialty filter
      if (filterState.specialtyIds.length > 0) {
        const hasSpecialty = provider.specialties.some((spec) => filterState.specialtyIds.includes(spec.master_id))
        if (!hasSpecialty) return false
      }

      // Gender filter
      if (filterState.genderTypeIds.length > 0) {
        if (!filterState.genderTypeIds.includes(provider.basicInfo.genderTypeId)) return false
      }

      // State filter
      if (filterState.stateIds.length > 0) {
        const hasState = provider.address.some((addr) => filterState.stateIds.includes(addr.stateId))
        if (!hasState) return false
      }

      // School name filter
      if (filterState.schoolNames.length > 0) {
        const hasSchool = provider.educations.some((edu) => filterState.schoolNames.includes(edu.schoolName))
        if (!hasSchool) return false
      }

      // Location status filter
      if (filterState.locationStatus) {
        const hasActiveLocation = provider.address.some((addr) => (addr.locationStatus || ["Active"]).includes("Active"))
        if (!hasActiveLocation) return false
      }

      // Wheelchair access filter
      if (filterState.wheelChairAccess) {
        if (!provider.wheelChairAccess) return false
      }

      return true
    })
  }, [providers, searchTerm, filterState])

  const totalPages = Math.ceil(filteredProviders.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedProviders = filteredProviders.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [filterState, searchTerm])

  const handleProviderUpdate = useCallback((updatedProvider: Provider) => {
    setProviders((prev) =>
      prev.map((p) => (p.provider_Id === updatedProvider.provider_Id ? updatedProvider : p))
    )
    setSelectedProvider(null)
    setIsDrawerOpen(false)
  }, [])

  const handleEditProvider = useCallback((provider: Provider) => {
    setSelectedProvider(provider)
    setIsDrawerOpen(true)
  }, [])

  const handleAddProvider = useCallback((newProvider: Provider) => {
    setProviders((prev) => [newProvider, ...prev])
  }, [])

  const handleDeleteProvider = useCallback((provider: Provider) => {
    setDeleteConfirm({ isOpen: true, provider })
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirm.provider) {
      setProviders((prev) =>
        prev.filter((p) => p.provider_Id !== deleteConfirm.provider!.provider_Id)
      )
      setSelectedRows((prev) =>
        prev.filter((id) => id !== deleteConfirm.provider!.provider_Id)
      )
    }
    setDeleteConfirm({ isOpen: false, provider: null })
  }, [deleteConfirm.provider])

  const handleRowSelect = useCallback((providerId: number) => {
    setSelectedRows((prev) =>
      prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId],
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedRows.length === paginatedProviders.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedProviders.map((p) => p.provider_Id))
    }
  }, [selectedRows.length, paginatedProviders])

  const handleBulkDelete = useCallback(() => {
    if (selectedRows.length > 0 && window.confirm(`Delete ${selectedRows.length} selected providers?`)) {
      setProviders((prev) => prev.filter((p) => !selectedRows.includes(p.provider_Id)))
      setSelectedRows([])
    }
  }, [selectedRows])

  const activeFilterCount =
    filterState.healthPlanIds.length +
    filterState.specialtyIds.length +
    filterState.genderTypeIds.length +
    filterState.stateIds.length +
    filterState.schoolNames.length +
    (filterState.locationStatus ? 1 : 0) +
    (filterState.wheelChairAccess ? 1 : 0)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Provider Data Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and update provider information across all health plans
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Provider
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, NPI, department, specialty..."
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

            {isFilterOpen && (
              <FilterPopup
                filterState={filterState}
                onFilterChange={setFilterState}
                filterConfig={mockFilterConfig}
                onClose={() => setIsFilterOpen(false)}
              />
            )}
          </div>

          {selectedRows.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedRows.length})
            </button>
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
              <option value={100}>100</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </header>

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
                      checked={selectedRows.length === paginatedProviders.length && paginatedProviders.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    NPI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Degree
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Specialties
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Locations
                  </th>
                  <th className="w-20 px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProviders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium">No providers found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProviders.map((provider) => {
                    const fullName = `${provider.firstName} ${provider.middleName} ${provider.lastName}`.trim()
                    const isSelected = selectedRows.includes(provider.provider_Id)

                    return (
                      <tr
                        key={provider.provider_Id}
                        className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-violet-50" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelect(provider.provider_Id)}
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-violet-700">
                                {provider.firstName[0]}
                                {provider.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                <HighlightText text={fullName} search={searchTerm} />
                              </p>
                              <p className="text-xs text-gray-500">ID: {provider.provider_Id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900 font-mono">
                            <HighlightText text={provider.npi.toString()} search={searchTerm} />
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                            {provider.providerType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{provider.basicInfo.degree || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                          <HighlightText text={provider.basicInfo.cumc_department || "-"} search={searchTerm} />
                        </td>
                        <td className="px-4 py-3">
                          {provider.basicInfo.cred_approval_status ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                provider.basicInfo.cred_approval_status.toLowerCase().includes("approved")
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {provider.basicInfo.cred_approval_status.toLowerCase().includes("approved") && (
                                <Check className="w-3 h-3" />
                              )}
                              {provider.basicInfo.cred_approval_status}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {provider.specialties.slice(0, 2).map((spec) => (
                              <span
                                key={spec.id}
                                className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-purple-50 text-purple-700 truncate max-w-[100px]"
                                title={spec.name}
                              >
                                <HighlightText text={spec.name} search={searchTerm} />
                              </span>
                            ))}
                            {provider.specialties.length > 2 && (
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                                +{provider.specialties.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                            {provider.address.length}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditProvider(provider)}
                              className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                              title="Edit provider"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(provider)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete provider"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          {filteredProviders.length > 0 && (
            <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredProviders.length)}</span> of{" "}
                <span className="font-medium">{filteredProviders.length.toLocaleString()}</span> providers
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
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-gray-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
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

      {/* Full-screen Edit Drawer */}
      {isDrawerOpen && selectedProvider && (
        <ProviderEditDrawer
          provider={selectedProvider}
          fieldConfig={fieldConfig}
          onClose={() => {
            setIsDrawerOpen(false)
            setSelectedProvider(null)
          }}
          onSave={handleProviderUpdate}
        />
      )}

      {/* Add Provider Modal */}
      <AddProviderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProvider}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, provider: null })}
        onConfirm={handleConfirmDelete}
        itemType="Provider"
        itemName={
          deleteConfirm.provider
            ? `${deleteConfirm.provider.firstName} ${deleteConfirm.provider.lastName}`
            : ""
        }
      />
    </div>
  )
}
