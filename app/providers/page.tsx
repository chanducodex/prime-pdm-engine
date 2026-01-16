"use client"

import { useState, useMemo } from "react"
import { ProviderList } from "@/components/providers/provider-list"
import { ProviderFilterSidebar } from "@/components/providers/provider-filter-sidebar"
import { ProviderDetailPanel } from "@/components/providers/provider-detail-panel"
import { mockProviderData, mockFilterConfig, mockFieldConfig } from "@/lib/provider-mock-data"
import type { Provider, FilterState, FieldConfig } from "@/lib/provider-types"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ProvidersPage() {
  const [providers] = useState<Provider[]>(mockProviderData)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [filterState, setFilterState] = useState<FilterState>({
    search: "",
    healthPlanIds: [],
    specialtyIds: [],
    genderTypeIds: [],
    stateIds: [],
    locationStatus: [],
    wheelChairAccess: [],
  })
  const [fieldConfig] = useState<FieldConfig[]>(mockFieldConfig)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      // Search filter
      if (filterState.search) {
        const search = filterState.search.toLowerCase()
        const fullName = `${provider.firstName} ${provider.middleName} ${provider.lastName}`.toLowerCase()
        const npiMatch = provider.npi.toString().includes(search)
        if (!fullName.includes(search) && !npiMatch) return false
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

      // Location status filter
      if (filterState.locationStatus.length > 0) {
        // Assuming Active means they have addresses
        if (filterState.locationStatus.includes("Active") && provider.address.length === 0) return false
        if (filterState.locationStatus.includes("Inactive") && provider.address.length > 0) return false
      }

      // Wheelchair access filter
      if (filterState.wheelChairAccess.length > 0) {
        const hasAccessibleLocation = provider.address.some((addr) => addr.wheelChairAccess)
        if (filterState.wheelChairAccess.includes("Yes") && !hasAccessibleLocation) return false
        if (filterState.wheelChairAccess.includes("No") && hasAccessibleLocation) return false
      }

      return true
    })
  }, [providers, filterState])

  const totalPages = Math.ceil(filteredProviders.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedProviders = filteredProviders.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [filterState])

  const handleProviderUpdate = (updatedProvider: Provider) => {
    console.log("[v0] Provider updated:", updatedProvider)
    setSelectedProvider(updatedProvider)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Filter Sidebar */}
      <ProviderFilterSidebar
        filterState={filterState}
        onFilterChange={setFilterState}
        filterConfig={mockFilterConfig}
        resultCount={filteredProviders.length}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">Provider Data Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and update provider information across all health plans
          </p>
        </header>

        {/* Provider List */}
        <div className="flex-1 overflow-auto">
          <ProviderList
            providers={paginatedProviders}
            onSelectProvider={setSelectedProvider}
            selectedProviderId={selectedProvider?.provider_Id}
            fieldConfig={fieldConfig}
          />
        </div>

        {filteredProviders.length > 0 && (
          <div className="border-t bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredProviders.length)} of {filteredProviders.length}{" "}
                providers
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)

                    if (!showPage) {
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        )
                      }
                      return null
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === page ? "bg-violet-600 text-white" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedProvider && (
        <ProviderDetailPanel
          provider={selectedProvider}
          fieldConfig={fieldConfig}
          onClose={() => setSelectedProvider(null)}
          onUpdate={handleProviderUpdate}
        />
      )}
    </div>
  )
}
