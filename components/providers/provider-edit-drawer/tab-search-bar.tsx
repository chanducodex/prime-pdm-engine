"use client"

import { Search, X } from "lucide-react"

interface TabSearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
  recordCount: number
  filteredCount?: number
  threshold?: number
}

export function TabSearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  recordCount,
  filteredCount,
  threshold = 5,
}: TabSearchBarProps) {
  // Don't show search bar if records are below threshold
  if (recordCount <= threshold) return null

  return (
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {searchTerm && filteredCount !== undefined && (
        <p className="mt-1.5 text-xs text-gray-500">
          Showing {filteredCount} of {recordCount} records
        </p>
      )}
    </div>
  )
}

/**
 * Hook to filter records based on search term
 */
export function useFilteredRecords<T extends Record<string, unknown>>(
  records: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm) return records

  const lowerSearch = searchTerm.toLowerCase()

  return records.filter((record) => {
    return searchFields.some((field) => {
      const value = record[field]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(lowerSearch)
    })
  })
}
