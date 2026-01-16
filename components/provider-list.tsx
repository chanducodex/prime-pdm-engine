"use client"

import { ProviderCard } from "./provider-card"
import type { ChangeEvent } from "@/lib/types"
import { FileSearch } from "lucide-react"

interface ProviderListProps {
  providers: ChangeEvent[]
  onViewFullHistory: (provider: ChangeEvent) => void
  onViewCategoryHistory: (provider: ChangeEvent, category: string) => void
  selectedProviderId?: string
  sortBy: "name" | "changes"
}

export function ProviderList({
  providers,
  onViewFullHistory,
  onViewCategoryHistory,
  selectedProviderId,
  sortBy,
}: ProviderListProps) {
  // Sort providers
  const sortedProviders = [...providers].sort((a, b) => {
    if (sortBy === "name") {
      return a.summary.name.localeCompare(b.summary.name)
    } else {
      const aTotal = a.summary.stats.reduce((acc, stat) => acc + Number.parseInt(stat.value), 0)
      const bTotal = b.summary.stats.reduce((acc, stat) => acc + Number.parseInt(stat.value), 0)
      return bTotal - aTotal // Most changes first
    }
  })

  if (providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileSearch className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
        <p className="text-sm text-gray-500 max-w-sm">Try adjusting your filters to see more results</p>
      </div>
    )
  }

  return (
    <div>
      {/* Sort and count header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {providers.length} provider{providers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Provider cards */}
      <div className="space-y-3">
        {sortedProviders.map((provider) => (
          <ProviderCard
            key={provider.summary.npi}
            provider={provider}
            onViewFullHistory={() => onViewFullHistory(provider)}
            onViewCategoryHistory={(category) => onViewCategoryHistory(provider, category)}
            isSelected={selectedProviderId === provider.summary.npi.toString()}
          />
        ))}
      </div>
    </div>
  )
}
