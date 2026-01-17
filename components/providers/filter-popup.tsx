"use client"

import { useEffect, useRef, useState } from "react"
import type { FilterState, FilterConfig } from "@/lib/provider-types"
import { X, RotateCcw, Search, ChevronDown } from "lucide-react"

interface FilterPopupProps {
  filterState: FilterState
  onFilterChange: (state: FilterState) => void
  filterConfig: FilterConfig[]
  onClose: () => void
}

export function FilterPopup({ filterState, onFilterChange, filterConfig, onClose }: FilterPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Close all dropdowns first, then the popup if no dropdowns are open
        if (Object.values(openDropdowns).some(isOpen => isOpen)) {
          setOpenDropdowns({})
        } else {
          onClose()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose, openDropdowns])

  const toggleDropdown = (category: string) => {
    setOpenDropdowns(prev => {
      // Close all other dropdowns and toggle the current one
      const newState: Record<string, boolean> = {}
      newState[category] = !prev[category]
      return newState
    })
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Check if click is outside any dropdown
      if (!target.closest('.dropdown-container')) {
        setOpenDropdowns({})
      }
    }

    if (Object.values(openDropdowns).some(isOpen => isOpen)) {
      document.addEventListener('mousedown', handleDocumentClick)
      return () => document.removeEventListener('mousedown', handleDocumentClick)
    }
  }, [openDropdowns])

  const handleCheckboxChange = (filterKey: string, optionId: number | string, checked: boolean) => {
    if (filterKey === "wheelChairAccess" || filterKey === "locationStatus") {
      const stateKey = filterKey === "wheelChairAccess" ? "wheelChairAccess" : "locationStatus"
      onFilterChange({ ...filterState, [stateKey]: checked })
      return
    }

    const stateKey =
      filterKey === "healthPlanId"
        ? "healthPlanIds"
        : filterKey === "splId"
          ? "specialtyIds"
          : filterKey === "genderTypeId"
            ? "genderTypeIds"
            : filterKey === "stateId"
              ? "stateIds"
              : filterKey === "schoolName"
                ? "schoolNames"
                : "wheelChairAccess"

    const currentValues = filterState[stateKey as keyof FilterState] as (number | string)[]
    const newValues = checked ? [...currentValues, optionId] : currentValues.filter((v) => v !== optionId)

    onFilterChange({ ...filterState, [stateKey]: newValues })
  }

  const getFilteredOptions = (category: FilterConfig, searchTerm: string) => {
    const options = category.filter_columns[0].filter_data
    if (!searchTerm) return options

    const search = searchTerm.toLowerCase()
    return options.filter((option) => 
      option.name?.toLowerCase().includes(search)
    )
  }

  const clearAllFilters = () => {
    onFilterChange({
      search: "",
      healthPlanIds: [],
      specialtyIds: [],
      genderTypeIds: [],
      stateIds: [],
      schoolNames: [],
      locationStatus: false,
      wheelChairAccess: false,
    })
    setSearchTerms({})
  }

  const activeFilterCount =
    filterState.healthPlanIds.length +
    filterState.specialtyIds.length +
    filterState.genderTypeIds.length +
    filterState.stateIds.length +
    filterState.schoolNames.length +
    (filterState.locationStatus ? 1 : 0) +
    (filterState.wheelChairAccess ? 1 : 0)

  return (
    <div
      ref={popupRef}
      className="absolute top-full left-0 mt-2 w-[480px] bg-white border border-gray-200 rounded-xl shadow-xl z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-violet-700 bg-violet-100 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          )}
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-6">
          {filterConfig.map((category) => {
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
                        : filterKey === "schoolName"
                          ? "schoolNames"
                          : "wheelChairAccess"

            const currentValues = filterState[stateKey as keyof FilterState] as (number | string)[]
            const searchTerm = searchTerms[category.category] || ""
            const filteredOptions = getFilteredOptions(category, searchTerm)
            const totalOptions = category.filter_columns[0].filter_data.length
            const showSearch = totalOptions > 6
            const isOpen = openDropdowns[category.category]

            return (
              <div key={category.category}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  {category.category}
                  {category.is_required && (
                    <span className="text-red-500" title="Required">*</span>
                  )}
                </h4>
                
                {category.control_type === "checkbox" ? (
                  // Single Checkbox for boolean filters
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.category === "Wheelchair Access" ? filterState.wheelChairAccess : filterState.locationStatus}
                      onChange={(e) => handleCheckboxChange(category.category === "Wheelchair Access" ? "wheelChairAccess" : "locationStatus", "Yes", e.target.checked)}
                      className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-700">
                      {category.category === "Wheelchair Access" ? "Wheelchair Accessible" : "Active Locations"}
                    </span>
                  </label>
                ) : (
                  // Custom Multiselect Dropdown
                  <div className="relative dropdown-container">
                    {/* Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => toggleDropdown(category.category)}
                      className="w-full px-3 py-2 text-sm text-left border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white flex items-center justify-between hover:border-gray-300 transition-colors"
                    >
                      <span className={currentValues.length === 0 ? "text-gray-400" : "text-gray-900"}>
                        {currentValues.length === 0 
                          ? `Select ${category.category}` 
                          : `${currentValues.length} selected`}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-hidden flex flex-col">
                        {/* Search for large lists */}
                        {showSearch && (
                          <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerms({ ...searchTerms, [category.category]: e.target.value })}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Options List */}
                        <div className="overflow-y-auto">
                          {filteredOptions
                            .filter(option => option.name && option.name.trim() !== "")
                            .map((option) => (
                              <label
                                key={option.id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={currentValues.includes(option.id)}
                                  onChange={(e) => handleCheckboxChange(filterKey, option.id, e.target.checked)}
                                  className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                                />
                                <span className="text-gray-700">{option.name}</span>
                              </label>
                            ))}
                        </div>
                        
                        {showSearch && (
                          <div className="p-2 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500">
                              {filteredOptions.filter(o => o.name && o.name.trim()).length} of {totalOptions}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Selected Items Tags */}
                    {currentValues.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {currentValues.map((value) => {
                          const option = category.filter_columns[0].filter_data.find(o => o.id === value)
                          if (!option) return null
                          
                          return (
                            <span
                              key={value}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 rounded"
                            >
                              {option.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCheckboxChange(filterKey, value, false)
                                }}
                                className="hover:text-violet-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}
