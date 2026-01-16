"use client"

import { Search, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onClearFilters?: () => void
}

export function NoResultsState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No changes match your filters</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        Try adjusting your date range or change categories to see more results.
      </p>
      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  )
}

export function NoDataState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No change history yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Provider changes will appear here once recorded in the system.
      </p>
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin mb-4" />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Loading change history...
      </p>
    </div>
  )
}
