"use client"

import { useState } from "react"
import { ChangeEventCard } from "./change-event-card"
import { NoResultsState } from "./empty-states"
import type { ChangeEvent, SortOption } from "@/lib/types"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChangeEventsListProps {
  events: ChangeEvent[]
  selectedEventId: string | null
  onEventSelect: (eventId: string) => void
}

export function ChangeEventsList({ events, selectedEventId, onEventSelect }: ChangeEventsListProps) {
  const [sortOption, setSortOption] = useState<SortOption>("recent")

  const sortedEvents = [...events].sort((a, b) => {
    switch (sortOption) {
      case "recent":
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case "oldest":
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      case "provider-az":
        return a.provider.name.localeCompare(b.provider.name)
      default:
        return 0
    }
  })

  const sortLabels: Record<SortOption, string> = {
    recent: "Most Recent",
    oldest: "Oldest First",
    "provider-az": "Provider A-Z",
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex">
        <NoResultsState />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col" role="main">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold">
          {events.length} {events.length === 1 ? "Change" : "Changes"}
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
              {sortLabels[sortOption]}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortOption("recent")}>Most Recent</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption("oldest")}>Oldest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption("provider-az")}>Provider A-Z</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedEvents.map((event) => (
          <ChangeEventCard
            key={event.eventId}
            event={event}
            isSelected={selectedEventId === event.eventId}
            onClick={() => onEventSelect(event.eventId)}
          />
        ))}
      </div>
    </div>
  )
}
