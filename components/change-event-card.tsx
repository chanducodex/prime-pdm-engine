"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { categoryLabels, categoryColors } from "@/lib/category-config"
import { formatRelativeTime, formatAbsoluteTime } from "@/lib/utils/date"
import type { ChangeEvent, FieldChange } from "@/lib/types"
import { ArrowRight, Plus, Minus } from "lucide-react"

interface ChangeEventCardProps {
  event: ChangeEvent
  isSelected?: boolean
  onClick: () => void
}

export function ChangeEventCard({ event, isSelected = false, onClick }: ChangeEventCardProps) {
  const visibleChanges = event.changes.slice(0, 3)
  const remainingCount = event.changes.length - 3

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getChangeType = (change: FieldChange): "added" | "changed" | "removed" => {
    if (change.before === null && change.after !== null) return "added"
    if (change.before !== null && change.after === null) return "removed"
    return "changed"
  }

  const formatFieldName = (field: string) => {
    return field.replace(/([A-Z])/g, " $1").trim()
  }

  return (
    <article
      className={`bg-card border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
        isSelected ? "border-l-4 border-l-primary bg-accent/10" : "border-border"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`Change to ${event.provider.name} on ${formatRelativeTime(event.timestamp)} by ${event.actor.name}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
            {getInitials(event.provider.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{event.provider.name}</h3>
            <Badge variant="outline" className="text-xs font-mono shrink-0">
              {event.provider.npi}
            </Badge>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground flex-wrap">
        <time dateTime={event.timestamp} title={formatAbsoluteTime(event.timestamp)}>
          {formatRelativeTime(event.timestamp)}
        </time>
        <span aria-hidden="true">•</span>
        <span>{event.actor.name}</span>
        <span aria-hidden="true">•</span>
        <Badge
          variant="secondary"
          className="text-xs h-5 px-2"
          style={{
            borderLeft: `3px solid ${categoryColors[event.category]}`,
            borderRadius: "4px",
          }}
        >
          {categoryLabels[event.category]}
        </Badge>
      </div>

      {/* Field Changes Preview */}
      <div className="space-y-2">
        {visibleChanges.map((change, index) => {
          const changeType = getChangeType(change)
          return (
            <div key={index} className="text-sm">
              <div className="font-medium text-muted-foreground mb-0.5">{formatFieldName(change.field)}</div>
              <div className="flex items-center gap-2">
                {changeType === "added" && (
                  <>
                    <Plus className="h-3.5 w-3.5 text-chart-1 shrink-0" aria-hidden="true" />
                    <span className="px-2 py-0.5 rounded bg-chart-1/10 text-chart-1 text-xs font-mono truncate">
                      Added: {change.after}
                    </span>
                  </>
                )}
                {changeType === "removed" && (
                  <>
                    <Minus className="h-3.5 w-3.5 text-destructive shrink-0" aria-hidden="true" />
                    <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-mono truncate">
                      Removed: {change.before}
                    </span>
                  </>
                )}
                {changeType === "changed" && (
                  <>
                    <ArrowRight className="h-3.5 w-3.5 text-chart-3 shrink-0" aria-hidden="true" />
                    <div className="flex items-center gap-1.5 text-xs font-mono overflow-hidden">
                      <span className="truncate text-muted-foreground">{change.before}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden="true" />
                      <span className="px-2 py-0.5 rounded bg-chart-3/10 text-chart-3 truncate">{change.after}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {remainingCount > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <button className="text-xs text-primary hover:underline font-medium">
            View all {event.changes.length} changes
          </button>
        </div>
      )}
    </article>
  )
}
