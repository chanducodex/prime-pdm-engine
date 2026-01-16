"use client"

import type React from "react"

import { useState } from "react"
import { Search, X, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { categoryLabels, categoryColors } from "@/lib/category-config"
import type { ChangeCategory, FilterState } from "@/lib/types"

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  resultCount: number
  onExport: () => void
}

export function FilterSidebar({ filters, onFiltersChange, resultCount, onExport }: FilterSidebarProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery)

  const datePresets = [
    { value: "7days" as const, label: "Last 7 days" },
    { value: "30days" as const, label: "Last 30 days" },
    { value: "90days" as const, label: "Last 90 days" },
    { value: "custom" as const, label: "Custom" },
  ]

  const categories: ChangeCategory[] = [
    "ProviderInformation",
    "ProviderAddress",
    "ProviderLicense",
    "ProviderEducation",
    "ProviderSpecialty",
    "ProviderHealthPlan",
    "ProviderLanguage",
    "ProviderMedicare",
    "Provider",
  ]

  const handleCategoryToggle = (category: ChangeCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const handleDatePresetChange = (preset: FilterState["dateRange"]["preset"]) => {
    onFiltersChange({
      ...filters,
      dateRange: { ...filters.dateRange, preset },
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, searchQuery: searchInput })
  }

  const handleClearFilters = () => {
    setSearchInput("")
    onFiltersChange({
      dateRange: { from: null, to: null, preset: "7days" },
      categories: [],
      actors: [],
      searchQuery: "",
    })
  }

  const activeFilterCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.actors.length > 0 ? 1 : 0) +
    (filters.searchQuery ? 1 : 0) +
    (filters.dateRange.preset !== "7days" ? 1 : 0)

  return (
    <aside className="w-80 border-r border-border bg-background flex flex-col" role="navigation" aria-label="Filters">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <form onSubmit={handleSearchSubmit} role="search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search providers or actors..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8"
              aria-label="Search providers or actors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("")
                  onFiltersChange({ ...filters, searchQuery: "" })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Scrollable Filter Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Date Range Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Date Range</h3>
            </div>
            <div className="space-y-2">
              {datePresets.map((preset) => (
                <label key={preset.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="dateRange"
                    value={preset.value}
                    checked={filters.dateRange.preset === preset.value}
                    onChange={() => handleDatePresetChange(preset.value)}
                    className="h-4 w-4 text-primary border-input focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm group-hover:text-foreground text-muted-foreground">{preset.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Change Categories</h3>
              {filters.categories.length > 0 && (
                <button
                  onClick={() => onFiltersChange({ ...filters, categories: [] })}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              {categories.map((category) => (
                <div key={category} className="flex items-center gap-2.5">
                  <Checkbox
                    id={category}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                    aria-label={`Filter by ${categoryLabels[category]}`}
                  />
                  <Label htmlFor={category} className="flex items-center gap-2 cursor-pointer text-sm flex-1">
                    <span
                      className="w-1 h-4 rounded-full"
                      style={{ backgroundColor: categoryColors[category] }}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{categoryLabels[category]}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Result Count */}
          <div className="pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground" aria-live="polite">
              Showing <span className="font-semibold text-foreground">{resultCount}</span>{" "}
              {resultCount === 1 ? "result" : "results"}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-2">
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="w-full justify-center bg-transparent"
          >
            Clear all filters
            {activeFilterCount > 1 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-muted rounded">{activeFilterCount}</span>
            )}
          </Button>
        )}
        <Button variant="default" size="sm" onClick={onExport} className="w-full justify-center">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </aside>
  )
}
