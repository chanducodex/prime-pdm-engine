"use client"

import { Trash2, Plus, GripVertical, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface RecordCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  onDelete?: () => void
  variant?: "default" | "nested" | "compact"
  isModified?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  badge?: React.ReactNode
  actions?: React.ReactNode
}

export function RecordCard({
  title,
  subtitle,
  children,
  onDelete,
  variant = "default",
  isModified = false,
  collapsible = false,
  defaultExpanded = true,
  badge,
  actions,
}: RecordCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const variantStyles = {
    default: {
      container: `border rounded-lg overflow-hidden ${
        isModified ? "border-amber-300 bg-amber-50/30" : "border-gray-200"
      }`,
      header: "p-4 bg-white",
      content: "px-4 pb-4",
    },
    nested: {
      container: `border rounded-lg overflow-hidden ${
        isModified ? "border-amber-200 bg-amber-50/20" : "border-gray-100 bg-gray-50/50"
      }`,
      header: "p-3",
      content: "px-3 pb-3",
    },
    compact: {
      container: `border-b ${isModified ? "border-amber-200 bg-amber-50/20" : "border-gray-100"}`,
      header: "py-2",
      content: "pb-2",
    },
  }

  const styles = variantStyles[variant]

  const headerContent = (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        {collapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            {isModified && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Modified" />
            )}
            {badge}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {actions}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>{headerContent}</div>
      {(!collapsible || isExpanded) && <div className={styles.content}>{children}</div>}
    </div>
  )
}

/**
 * Button to add new record
 */
interface AddRecordButtonProps {
  label: string
  onClick: () => void
  variant?: "default" | "compact"
  disabled?: boolean
}

export function AddRecordButton({
  label,
  onClick,
  variant = "default",
  disabled = false,
}: AddRecordButtonProps) {
  if (variant === "compact") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-700 hover:text-violet-800 hover:bg-violet-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        <Plus className="w-3 h-3" />
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  )
}

/**
 * Empty state for when no records exist
 */
interface EmptyRecordsStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyRecordsState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyRecordsStateProps) {
  return (
    <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
          type="button"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/**
 * Badge component for status display
 */
interface StatusBadgeProps {
  status: string
  variant?: "success" | "warning" | "error" | "info" | "default"
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const variantStyles = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    default: "bg-gray-100 text-gray-700 border-gray-200",
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${variantStyles[variant]}`}
    >
      {status}
    </span>
  )
}

/**
 * Get status badge variant based on status text
 */
export function getStatusVariant(
  status: string | null | undefined
): "success" | "warning" | "error" | "info" | "default" {
  if (!status) return "default"

  const lower = status.toLowerCase()

  if (lower.includes("approved") || lower.includes("active") || lower.includes("certified") || lower.includes("completed")) {
    return "success"
  }
  if (lower.includes("pending") || lower.includes("in progress")) {
    return "warning"
  }
  if (lower.includes("rejected") || lower.includes("expired") || lower.includes("inactive")) {
    return "error"
  }
  if (lower.includes("par")) {
    return "info"
  }

  return "default"
}
