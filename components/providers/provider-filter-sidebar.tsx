"use client"

import type { FilterState, FilterConfig } from "@/lib/provider-types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Download } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface ProviderFilterSidebarProps {
  filterState: FilterState
  onFilterChange: (state: FilterState) => void
  filterConfig: FilterConfig[]
  resultCount: number
}

export function ProviderFilterSidebar({
  filterState,
  onFilterChange,
  filterConfig,
  resultCount,
}: ProviderFilterSidebarProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filterState, search: value })
  }

  const handleCheckboxChange = (filterKey: string, optionId: number | string, checked: boolean) => {
    const stateKey =
      filterKey === "healthPlanId"
        ? "healthPlanIds"
        : filterKey === "splId"
          ? "specialtyIds"
          : filterKey === "genderTypeId"
            ? "genderTypeIds"
            : filterKey === "stateId"
              ? "stateIds"
              : filterKey === "locationStatus"
                ? "locationStatus"
                : "wheelChairAccess"

    const currentValues = filterState[stateKey as keyof FilterState] as (number | string)[]
    const newValues = checked ? [...currentValues, optionId] : currentValues.filter((v) => v !== optionId)

    onFilterChange({ ...filterState, [stateKey]: newValues })
  }

  const clearAllFilters = () => {
    onFilterChange({
      search: "",
      healthPlanIds: [],
      specialtyIds: [],
      genderTypeIds: [],
      stateIds: [],
      locationStatus: [],
      wheelChairAccess: [],
    })
  }

  const hasActiveFilters =
    filterState.search ||
    filterState.healthPlanIds.length > 0 ||
    filterState.specialtyIds.length > 0 ||
    filterState.genderTypeIds.length > 0 ||
    filterState.stateIds.length > 0 ||
    filterState.locationStatus.length > 0 ||
    filterState.wheelChairAccess.length > 0

  return (
    <aside className="w-80 border-r bg-background flex flex-col" role="search">
      {/* Search Header */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search providers by name or NPI..."
            value={filterState.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {filterState.search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filterConfig.map((category) => (
          <div key={category.category}>
            <h3 className="text-sm font-semibold text-foreground mb-3">{category.category}</h3>
            <div className="space-y-2">
              {category.filter_columns[0].filter_data.map((option) => {
                const filterKey = category.filter_columns[0].filter_key
                const stateKey =
                  filterKey === "healthPlanId"
                    ? "healthPlanIds"
                    : filterKey === "splId"
                      ? "specialtyIds"
                      : filterKey === "genderTypeId"
                        ? "genderTypeIds"
                        : filterKey === "stateId"
                          ? "stateIds"
                          : filterKey === "locationStatus"
                            ? "locationStatus"
                            : "wheelChairAccess"

                const currentValues = filterState[stateKey as keyof FilterState] as (number | string)[]
                const isChecked = currentValues.includes(option.id)

                return (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCheckboxChange(filterKey, option.id, checked as boolean)}
                    />
                    <span className="text-sm text-foreground flex-1">{option.name || "N/A"}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <div className="text-sm text-muted-foreground mb-3" role="status" aria-live="polite">
          Showing {resultCount} provider{resultCount !== 1 ? "s" : ""}
        </div>

        {hasActiveFilters && (
          <Button variant="outline" className="w-full bg-transparent" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}

        <Button variant="default" className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>
    </aside>
  )
}
