"use client"

import { RotateCcw, AlertCircle, Info } from "lucide-react"
import type { FieldDefinition } from "./types"
import { SELECT_OPTIONS } from "./types"

interface EditableFieldProps {
  path: string
  label: string
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox"
  value: unknown
  originalValue: unknown
  isModified: boolean
  onChange: (value: unknown) => void
  onRevert: () => void
  error?: string
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
  disabled?: boolean
  colSpan?: 1 | 2 | 3
  searchTerm?: string
}

export function EditableField({
  path,
  label,
  type,
  value,
  originalValue,
  isModified,
  onChange,
  onRevert,
  error,
  required,
  placeholder,
  options,
  disabled,
  colSpan = 1,
  searchTerm,
}: EditableFieldProps) {
  const colSpanClass = colSpan === 3 ? "col-span-3" : colSpan === 2 ? "col-span-2" : ""

  const inputBaseClass = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors`
  const inputModifiedClass = isModified ? "border-amber-300 bg-amber-50/50" : "border-gray-200"
  const inputErrorClass = error ? "border-red-500 bg-red-50/50" : ""
  const inputDisabledClass = disabled ? "bg-gray-100 cursor-not-allowed" : ""

  const renderInput = () => {
    switch (type) {
      case "text":
        return (
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${inputBaseClass} ${inputModifiedClass} ${inputErrorClass} ${inputDisabledClass}`}
          />
        )

      case "number":
        return (
          <input
            type="number"
            value={(value as number) ?? ""}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
            placeholder={placeholder}
            disabled={disabled}
            className={`${inputBaseClass} ${inputModifiedClass} ${inputErrorClass} ${inputDisabledClass} font-mono`}
          />
        )

      case "date":
        return (
          <input
            type="date"
            value={formatDateForInput(value as string)}
            onChange={(e) => onChange(formatDateForDisplay(e.target.value))}
            disabled={disabled}
            className={`${inputBaseClass} ${inputModifiedClass} ${inputErrorClass} ${inputDisabledClass}`}
          />
        )

      case "select":
        return (
          <select
            value={(value as string | number) ?? ""}
            onChange={(e) => {
              const selectedOption = options?.find((o) => String(o.value) === e.target.value)
              onChange(selectedOption ? selectedOption.value : e.target.value)
            }}
            disabled={disabled}
            className={`${inputBaseClass} ${inputModifiedClass} ${inputErrorClass} ${inputDisabledClass} bg-white`}
          >
            <option value="">Select...</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case "textarea":
        return (
          <textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            className={`${inputBaseClass} ${inputModifiedClass} ${inputErrorClass} ${inputDisabledClass} resize-none`}
          />
        )

      case "checkbox":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">{placeholder || "Yes"}</span>
          </label>
        )

      default:
        return null
    }
  }

  return (
    <div className={`${colSpanClass}`}>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        <span className="flex items-center gap-2">
          <span>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>

          {/* Modified indicator with original value tooltip */}
          {isModified && (
            <span
              className="inline-flex items-center gap-1 text-amber-600 cursor-help"
              title={`Original: ${formatDisplayValue(originalValue)}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-wide">modified</span>
            </span>
          )}
        </span>
      </label>

      <div className="relative flex items-start gap-2">
        <div className="flex-1">{renderInput()}</div>

        {/* Per-field revert button */}
        {isModified && !disabled && (
          <button
            onClick={onRevert}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            title={`Revert to: ${formatDisplayValue(originalValue)}`}
            type="button"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Original value display when modified */}
      {isModified && !error && (
        <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Original: {formatDisplayValue(originalValue)}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Format date from MM/DD/YYYY to YYYY-MM-DD for input
 */
function formatDateForInput(dateStr: string | undefined | null): string {
  if (!dateStr) return ""

  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }

  // Parse MM/DD/YYYY format
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (match) {
    const [, month, day, year] = match
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  return ""
}

/**
 * Format date from YYYY-MM-DD to MM/DD/YYYY for display
 */
function formatDateForDisplay(dateStr: string | undefined | null): string {
  if (!dateStr) return ""

  // Parse YYYY-MM-DD format
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    const [, year, month, day] = match
    return `${month}/${day}/${year}`
  }

  return dateStr
}

/**
 * Format value for display
 */
function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return "(empty)"
  if (value === "") return "(empty)"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) return `[${value.length} items]`
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

/**
 * Highlight text component for search results
 */
export function HighlightedText({ text, search }: { text: string; search?: string }) {
  if (!search || !text) return <>{text}</>

  const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

/**
 * Wrapper component that takes field definition and state from context
 */
export interface EditableFieldWrapperProps {
  field: FieldDefinition
  value: unknown
  originalValue: unknown
  isModified: boolean
  error?: string
  onChange: (value: unknown) => void
  onRevert: () => void
  searchTerm?: string
}

export function EditableFieldWrapper({
  field,
  value,
  originalValue,
  isModified,
  error,
  onChange,
  onRevert,
  searchTerm,
}: EditableFieldWrapperProps) {
  return (
    <EditableField
      path={field.path}
      label={field.label}
      type={field.type}
      value={value}
      originalValue={originalValue}
      isModified={isModified}
      onChange={onChange}
      onRevert={onRevert}
      error={error}
      required={field.required}
      placeholder={field.placeholder}
      options={field.options}
      disabled={field.disabled}
      colSpan={field.colSpan}
      searchTerm={searchTerm}
    />
  )
}
