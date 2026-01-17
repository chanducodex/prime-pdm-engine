"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, ChevronsUpDown } from "lucide-react"

interface CollapsibleSectionProps {
  sectionKey: string
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  badge?: string | number
  isExpanded?: boolean
  onToggle?: (key: string) => void
  actions?: React.ReactNode
  variant?: "default" | "nested" | "compact"
  modifiedCount?: number
}

export function CollapsibleSection({
  sectionKey,
  title,
  children,
  defaultExpanded = true,
  badge,
  isExpanded: controlledExpanded,
  onToggle,
  actions,
  variant = "default",
  modifiedCount,
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)

  const isControlled = controlledExpanded !== undefined
  const isExpanded = isControlled ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    if (onToggle) {
      onToggle(sectionKey)
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  const variantStyles = {
    default: {
      container: "border border-gray-200 rounded-lg overflow-hidden",
      header:
        "w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors",
      headerText: "text-sm font-semibold text-gray-900",
      content: "p-4",
    },
    nested: {
      container: "border border-gray-100 rounded-lg overflow-hidden bg-gray-50/50",
      header:
        "w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors",
      headerText: "text-xs font-medium text-gray-700",
      content: "p-3",
    },
    compact: {
      container: "border-b border-gray-100",
      header:
        "w-full px-2 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors",
      headerText: "text-xs font-medium text-gray-600",
      content: "px-2 pb-3",
    },
  }

  const styles = variantStyles[variant]

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleToggle} className="flex-1 flex items-center justify-between text-left" type="button">
          <div className="flex items-center gap-2">
            <h3 className={styles.headerText}>{title}</h3>
            {badge !== undefined && (
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
            {modifiedCount !== undefined && modifiedCount > 0 && (
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {modifiedCount} modified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </button>
        {actions && (
          <div className="flex items-center gap-2 ml-2">
            {actions}
          </div>
        )}
      </div>

      {isExpanded && <div className={styles.content}>{children}</div>}
    </section>
  )
}

/**
 * Controls for expanding/collapsing all sections
 */
interface ExpansionControlsProps {
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function ExpansionControls({ onExpandAll, onCollapseAll }: ExpansionControlsProps) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        onClick={onExpandAll}
        className="flex items-center gap-1 text-violet-600 hover:text-violet-700 transition-colors"
        type="button"
      >
        <ChevronsUpDown className="w-3 h-3" />
        Expand all
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={onCollapseAll}
        className="flex items-center gap-1 text-violet-600 hover:text-violet-700 transition-colors"
        type="button"
      >
        <ChevronsUpDown className="w-3 h-3 rotate-90" />
        Collapse all
      </button>
    </div>
  )
}

/**
 * Grid container for fields within a section
 */
interface FieldGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3
}

export function FieldGrid({ children, columns = 2 }: FieldGridProps) {
  const colsClass =
    columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1"

  return <div className={`grid ${colsClass} gap-4`}>{children}</div>
}
