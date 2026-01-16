"use client"

import { useState, useMemo } from "react"
import { mockChangeEvents } from "@/lib/mock-data"
import type { ChangeEvent } from "@/lib/types"
import { useGlobalSearch, HighlightText } from "@/components/layout/app-shell"
import { categoryColors } from "@/lib/category-config"
import {
  Search,
  X,
  SlidersHorizontal,
  Download,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  ArrowRight,
  Calendar,
  User,
  RotateCcw,
} from "lucide-react"

export default function ChangeHistoryPage() {
  const { globalSearch } = useGlobalSearch()
  const [localSearch, setLocalSearch] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<ChangeEvent | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [expandedProviders, setExpandedProviders] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Filter state
  const [dateRange, setDateRange] = useState<string>("all")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const searchTerm = globalSearch || localSearch

  // Get all unique categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    mockChangeEvents.forEach((event) => {
      event.summary.stats.forEach((stat) => {
        const categoryName = stat.label.replace(" Changes", "")
        cats.add(categoryName)
      })
    })
    return Array.from(cats)
  }, [])

  // Filter providers
  const filteredProviders = useMemo(() => {
    return mockChangeEvents.filter((event) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const nameMatch = event.summary.name.toLowerCase().includes(search)
        const npiMatch = event.summary.npi.toString().includes(search)
        if (!nameMatch && !npiMatch) return false
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const providerCategories = event.summary.stats.map((s) => s.label.replace(" Changes", ""))
        const hasSelectedCategory = selectedCategories.some((cat) => providerCategories.includes(cat))
        if (!hasSelectedCategory) return false
      }

      return true
    })
  }, [searchTerm, selectedCategories])

  // Pagination
  const totalPages = Math.ceil(filteredProviders.length / pageSize)
  const paginatedProviders = filteredProviders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleProviderExpand = (npi: number) => {
    setExpandedProviders((prev) => (prev.includes(npi) ? prev.filter((n) => n !== npi) : [...prev, npi]))
  }

  const handleViewFullHistory = (provider: ChangeEvent) => {
    setSelectedProvider(provider)
    setFilterCategory(null)
  }

  const handleViewCategoryHistory = (provider: ChangeEvent, category: string) => {
    setSelectedProvider(provider)
    setFilterCategory(category)
  }

  const clearFilters = () => {
    setDateRange("all")
    setSelectedCategories([])
  }

  const activeFilterCount = (dateRange !== "all" ? 1 : 0) + selectedCategories.length

  // Get filtered history based on category
  const getFilteredHistory = (provider: ChangeEvent) => {
    if (!filterCategory) return provider.changeHistory

    return provider.changeHistory.filter((history) => {
      const categoryMatch = history.summary.match(/\d+\s+(\w+)\s+(added|changed|terminate)/)
      const category = categoryMatch ? categoryMatch[1] : ""
      return category === filterCategory
    })
  }

  const formatFieldName = (field: string) => {
    return field.replace(/([A-Z])/g, " $1").trim()
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${selectedProvider ? "max-w-[calc(100%-480px)]" : ""}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Provider Change History</h1>
              <p className="text-sm text-gray-500 mt-0.5">Track and audit all provider information modifications</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by provider name or NPI..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value)
                  setCurrentPage(1)
                }}
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

            {/* Filter Popup Button */}
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

              {/* Filter Popup */}
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Date Range */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Date Range
                      </label>
                      <div className="space-y-1.5">
                        {[
                          { value: "all", label: "All Time" },
                          { value: "7d", label: "Last 7 Days" },
                          { value: "30d", label: "Last 30 Days" },
                          { value: "90d", label: "Last 90 Days" },
                        ].map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="dateRange"
                              value={option.value}
                              checked={dateRange === option.value}
                              onChange={(e) => setDateRange(e.target.value)}
                              className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Change Categories
                      </label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {allCategories.map((category) => {
                          const color =
                            categoryColors[category as keyof typeof categoryColors] || categoryColors.Information
                          return (
                            <label key={category} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategories((prev) => [...prev, category])
                                  } else {
                                    setSelectedCategories((prev) => prev.filter((c) => c !== category))
                                  }
                                  setCurrentPage(1)
                                }}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                              <span className="text-sm text-gray-700">{category}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-gray-100">
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

            <div className="ml-auto text-sm text-gray-500">
              {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </header>

        {/* Provider List */}
        <div className="flex-1 overflow-auto p-6">
          {paginatedProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No providers found</h3>
              <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedProviders.map((provider) => {
                const isExpanded = expandedProviders.includes(provider.summary.npi)
                const isSelected = selectedProvider?.summary.npi === provider.summary.npi
                const totalChanges = provider.summary.stats.reduce((acc, stat) => acc + Number.parseInt(stat.value), 0)

                return (
                  <div
                    key={provider.summary.npi}
                    className={`bg-white border rounded-xl overflow-hidden transition-all ${
                      isSelected
                        ? "border-violet-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {/* Provider Header */}
                    <div
                      className="p-4 flex items-center gap-4 cursor-pointer"
                      onClick={() => toggleProviderExpand(provider.summary.npi)}
                    >
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {provider.summary.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            <HighlightText text={provider.summary.name} search={searchTerm} />
                          </h3>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono">
                            NPI: <HighlightText text={provider.summary.npi.toString()} search={searchTerm} />
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {totalChanges} changes across {provider.summary.stats.length} categories
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {provider.changeHistory[0]?.changeDate || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                        {provider.summary.stats.slice(0, 4).map((stat, idx) => {
                          const categoryName = stat.label.replace(" Changes", "")
                          const color =
                            categoryColors[categoryName as keyof typeof categoryColors] || categoryColors.Information
                          return (
                            <div
                              key={idx}
                              className="px-2 py-1 rounded text-xs font-medium bg-gray-50 border-l-2"
                              style={{ borderLeftColor: color }}
                              title={stat.label}
                            >
                              {stat.value}
                            </div>
                          )
                        })}
                        {provider.summary.stats.length > 4 && (
                          <span className="text-xs text-gray-400">+{provider.summary.stats.length - 4}</span>
                        )}
                      </div>

                      {/* Expand Icon */}
                      <div className="flex-shrink-0 text-gray-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                        {/* All category badges */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-4">
                          {provider.summary.stats.map((stat, idx) => {
                            const categoryName = stat.label.replace(" Changes", "")
                            const color =
                              categoryColors[categoryName as keyof typeof categoryColors] || categoryColors.Information

                            return (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewCategoryHistory(provider, categoryName)
                                }}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-left group"
                                style={{ borderLeftWidth: 3, borderLeftColor: color }}
                              >
                                <span className="text-xs font-medium text-gray-700 truncate pr-1">{categoryName}</span>
                                <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Action button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewFullHistory(provider)
                          }}
                          className="w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          View Full Change History
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredProviders.length > pageSize && (
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProviders.length)}{" "}
              of {filteredProviders.length} providers
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
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
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Detail Panel */}
      {selectedProvider && (
        <aside className="w-[480px] border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => {
                  setSelectedProvider(null)
                  setFilterCategory(null)
                }}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to list
              </button>
              <button
                onClick={() => {
                  setSelectedProvider(null)
                  setFilterCategory(null)
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold">
                {selectedProvider.summary.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedProvider.summary.name}</h2>
                <p className="text-sm text-gray-500">NPI: {selectedProvider.summary.npi}</p>
              </div>
            </div>
            {filterCategory && (
              <div className="mt-3 flex items-center justify-between bg-violet-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-violet-700 font-medium">Viewing {filterCategory} changes only</span>
                <button
                  onClick={() => setFilterCategory(null)}
                  className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                >
                  Show all
                </button>
              </div>
            )}
          </div>

          {/* Change History */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {getFilteredHistory(selectedProvider).map((historyEntry, historyIndex) => {
              const categoryMatch = historyEntry.summary.match(/\d+\s+(\w+)\s+(added|changed|terminate)/)
              const category = categoryMatch ? categoryMatch[1] : "Unknown"
              const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.Information

              return (
                <div key={historyIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Entry Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{historyEntry.changeDate}</span>
                      </div>
                      <span
                        className="text-xs font-medium px-2 py-1 rounded bg-white border"
                        style={{ borderLeftWidth: 3, borderLeftColor: color }}
                      >
                        {category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{historyEntry.summary}</p>
                  </div>

                  {/* Added */}
                  {historyEntry.added.length > 0 && (
                    <div className="p-4 space-y-3">
                      {historyEntry.added.map((addedGroup, groupIndex) => (
                        <div key={`added-${groupIndex}`} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-green-50 text-green-700 border border-green-200">
                              <Plus className="w-3 h-3" />
                              Added
                            </span>
                          </div>
                          <div className="space-y-1.5 pl-2 border-l-2 border-green-200">
                            {addedGroup.map((field, fieldIndex) => (
                              <div key={fieldIndex} className="flex items-start gap-2 text-xs">
                                <span className="font-medium text-gray-600 min-w-[100px]">
                                  {formatFieldName(field.fieldName)}:
                                </span>
                                <span className="font-mono bg-green-50 px-1.5 py-0.5 rounded text-green-800 break-all">
                                  {field.newValue || <em className="text-gray-400">empty</em>}
                                </span>
                              </div>
                            ))}
                          </div>
                          {addedGroup[0] && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                              <User className="w-3 h-3" />
                              {addedGroup[0].changedBy} • {addedGroup[0].changedOn}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Changed */}
                  {historyEntry.changed.length > 0 && (
                    <div className="p-4 space-y-3 bg-amber-50/30">
                      {historyEntry.changed.map((changedGroup, groupIndex) => (
                        <div key={`changed-${groupIndex}`} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-amber-50 text-amber-700 border border-amber-200">
                              <ArrowRight className="w-3 h-3" />
                              Modified
                            </span>
                          </div>
                          <div className="space-y-2 pl-2 border-l-2 border-amber-200">
                            {changedGroup.map((field, fieldIndex) => (
                              <div key={fieldIndex} className="text-xs">
                                <span className="font-medium text-gray-700">{formatFieldName(field.fieldName)}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 line-through">
                                    {field.oldValue || <em className="text-gray-400">empty</em>}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">
                                    {field.newValue || <em className="text-gray-400">empty</em>}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {changedGroup[0] && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                              <User className="w-3 h-3" />
                              {changedGroup[0].changedBy} • {changedGroup[0].changedOn}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Terminated */}
                  {historyEntry.terminate.length > 0 && (
                    <div className="p-4 space-y-3 bg-red-50/30">
                      {historyEntry.terminate.map((terminatedGroup, groupIndex) => (
                        <div key={`terminated-${groupIndex}`} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-red-50 text-red-700 border border-red-200">
                              <Minus className="w-3 h-3" />
                              Terminated
                            </span>
                          </div>
                          <div className="space-y-1.5 pl-2 border-l-2 border-red-200">
                            {terminatedGroup.map((field, fieldIndex) => (
                              <div key={fieldIndex} className="flex items-start gap-2 text-xs">
                                <span className="font-medium text-gray-600 min-w-[100px]">
                                  {formatFieldName(field.fieldName)}:
                                </span>
                                <span className="font-mono bg-red-50 px-1.5 py-0.5 rounded text-red-800 line-through break-all">
                                  {field.oldValue || <em className="text-gray-400">empty</em>}
                                </span>
                              </div>
                            ))}
                          </div>
                          {terminatedGroup[0] && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                              <User className="w-3 h-3" />
                              {terminatedGroup[0].changedBy} • {terminatedGroup[0].changedOn}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>
      )}
    </div>
  )
}
