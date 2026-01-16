"use client"

import { useState } from "react"
import type { ChangeEvent } from "@/lib/types"
import { ChevronDown, ChevronRight } from "lucide-react"
import { categoryColors } from "@/lib/category-config"

interface ProviderCardProps {
  provider: ChangeEvent
  onViewFullHistory: () => void
  onViewCategoryHistory: (category: string) => void
  isSelected: boolean
}

export function ProviderCard({ provider, onViewFullHistory, onViewCategoryHistory, isSelected }: ProviderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { name, npi, initials, stats } = provider.summary

  // Get provider initials from name if not provided
  const displayInitials =
    initials ||
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  // Calculate total changes
  const totalChanges = stats.reduce((acc, stat) => acc + Number.parseInt(stat.value), 0)

  return (
    <div
      className={`border rounded-lg bg-white transition-all ${
        isSelected ? "border-violet-500 shadow-lg" : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-3 text-left"
        aria-expanded={isExpanded}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-medium text-sm">
          {displayInitials}
        </div>

        {/* Provider Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">NPI: {npi}</span>
          </div>

          {/* Total changes summary */}
          <p className="text-sm text-gray-600">
            {totalChanges} total changes across {stats.length} categories
          </p>
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0 text-gray-400">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {/* Expanded content - Stats badges */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat, idx) => {
              const categoryName = stat.label.replace(" Changes", "")
              const color = categoryColors[categoryName as keyof typeof categoryColors] || categoryColors.Information

              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewCategoryHistory(categoryName)
                  }}
                  className="flex items-center justify-between p-2 rounded border-l-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  style={{ borderLeftColor: color }}
                  title={`View ${categoryName} changes only`}
                >
                  <span className="text-xs font-medium text-gray-700 truncate pr-2">{categoryName}</span>
                  <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
                </button>
              )
            })}
          </div>

          {/* View details button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewFullHistory()
            }}
            className="w-full mt-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            View Full Change History
          </button>
        </div>
      )}
    </div>
  )
}
