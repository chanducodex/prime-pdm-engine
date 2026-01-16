"use client"

import { useEffect, useRef } from "react"
import type { FilterState, FilterConfig } from "@/lib/provider-types"
import { X, RotateCcw } from "lucide-react"

interface FilterPopupProps {
  filterState: FilterState
  onFilterChange: (state: FilterState) => void
  filterConfig: FilterConfig[]
  onClose: () => void
}

export function FilterPopup({ filterState, onFilterChange, filterConfig, onClose }: FilterPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

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

  const activeFilterCount =
    filterState.healthPlanIds.length +
    filterState.specialtyIds.length +
    filterState.genderTypeIds.length +
    filterState.stateIds.length +
    filterState.locationStatus.length +
    filterState.wheelChairAccess.length

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
      <div className="p-4 max-h-[400px] overflow-y-auto">
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
                        : "wheelChairAccess"

            const currentValues = filterState[stateKey as keyof FilterState] as (number | string)[]

            return (
              <div key={category.category}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {category.category}
                </h4>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-2">
                  {category.filter_columns[0].filter_data.map((option) => {
                    const isChecked = currentValues.includes(option.id)

                    return (
                      <label
                        key={option.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(filterKey, option.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700 truncate">{option.name || "N/A"}</span>
                      </label>
                    )
                  })}
                </div>
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
