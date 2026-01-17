"use client"

import { Plus, X, Trash2, ChevronDown } from "lucide-react"
import { useState, useCallback } from "react"

// Filter operators by field type
const FILTER_OPERATORS = {
  text: [
    { value: "equals", label: "Equals" },
    { value: "notEquals", label: "Does not equal" },
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Does not contain" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "isEmpty", label: "Is empty" },
    { value: "isNotEmpty", label: "Is not empty" },
  ],
  number: [
    { value: "equals", label: "Equals" },
    { value: "notEquals", label: "Does not equal" },
    { value: "greaterThan", label: "Greater than" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterOrEqual", label: "Greater or equal" },
    { value: "lessOrEqual", label: "Less or equal" },
    { value: "between", label: "Between" },
    { value: "isEmpty", label: "Is empty" },
  ],
  date: [
    { value: "equals", label: "On" },
    { value: "notEquals", label: "Not on" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
    { value: "inLast", label: "In the last" },
    { value: "isEmpty", label: "Is empty" },
  ],
  select: [
    { value: "equals", label: "Is" },
    { value: "notEquals", label: "Is not" },
    { value: "in", label: "Is any of" },
    { value: "notIn", label: "Is none of" },
  ],
  boolean: [
    { value: "equals", label: "Is" },
  ],
}

// Available fields for filtering
const AVAILABLE_FIELDS = [
  { key: "firstName", label: "First Name", type: "text" as const },
  { key: "lastName", label: "Last Name", type: "text" as const },
  { key: "middleName", label: "Middle Name", type: "text" as const },
  { key: "npi", label: "NPI", type: "number" as const },
  { key: "providerType", label: "Provider Type", type: "select" as const, options: [
    { value: "Specialist", label: "Specialist" },
    { value: "Primary Care", label: "Primary Care" },
    { value: "Individual", label: "Individual" },
    { value: "Organization", label: "Organization" },
  ]},
  { key: "basicInfo.degree", label: "Degree", type: "text" as const },
  { key: "basicInfo.cumc_department", label: "Department", type: "text" as const },
  { key: "basicInfo.cumc_division", label: "Division", type: "text" as const },
  { key: "basicInfo.cred_approval_status", label: "Approval Status", type: "select" as const, options: [
    { value: "APPROVED", label: "Approved" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
    { value: "EXPIRED", label: "Expired" },
  ]},
  { key: "basicInfo.date_hire", label: "Date Hired", type: "date" as const },
  { key: "basicInfo.genderTypeId", label: "Gender", type: "select" as const, options: [
    { value: 1, label: "Male" },
    { value: 2, label: "Female" },
    { value: 3, label: "Other" },
    { value: 4, label: "Non-conforming" },
    { value: 5, label: "Non-Binary" },
  ]},
  { key: "address.stateId", label: "State", type: "select" as const, options: [
    { value: 33, label: "New York" },
    { value: 31, label: "Massachusetts" },
    { value: 34, label: "New Jersey" },
    { value: 39, label: "Pennsylvania" },
  ]},
  { key: "address.wheelChairAccess", label: "Wheelchair Access", type: "boolean" as const },
  { key: "specialties.name", label: "Specialty", type: "text" as const },
  { key: "specialties.board_status", label: "Board Status", type: "select" as const, options: [
    { value: "Certified", label: "Certified" },
    { value: "Not Certified", label: "Not Certified" },
    { value: "Pending", label: "Pending" },
  ]},
]

export interface FilterRule {
  id: string
  field: string
  operator: string
  value: string | number | boolean | (string | number)[]
  secondValue?: string | number // For "between" operator
}

interface AdvancedFilterBuilderProps {
  rules: FilterRule[]
  onRulesChange: (rules: FilterRule[]) => void
  onApply: () => void
  onClear: () => void
}

export function AdvancedFilterBuilder({
  rules,
  onRulesChange,
  onApply,
  onClear,
}: AdvancedFilterBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(rules.length > 0)

  const addRule = useCallback(() => {
    const newRule: FilterRule = {
      id: crypto.randomUUID(),
      field: "",
      operator: "",
      value: "",
    }
    onRulesChange([...rules, newRule])
    setIsExpanded(true)
  }, [rules, onRulesChange])

  const updateRule = useCallback(
    (id: string, updates: Partial<FilterRule>) => {
      onRulesChange(
        rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
      )
    },
    [rules, onRulesChange]
  )

  const removeRule = useCallback(
    (id: string) => {
      onRulesChange(rules.filter((rule) => rule.id !== id))
    },
    [rules, onRulesChange]
  )

  const getFieldConfig = (fieldKey: string) => {
    return AVAILABLE_FIELDS.find((f) => f.key === fieldKey)
  }

  const getOperatorsForField = (fieldKey: string) => {
    const field = getFieldConfig(fieldKey)
    if (!field) return []
    return FILTER_OPERATORS[field.type] || FILTER_OPERATORS.text
  }

  const renderValueInput = (rule: FilterRule) => {
    const field = getFieldConfig(rule.field)
    if (!field || !rule.operator) return null

    // No value input needed for isEmpty/isNotEmpty
    if (rule.operator === "isEmpty" || rule.operator === "isNotEmpty") {
      return null
    }

    // Select field type
    if (field.type === "select" && field.options) {
      if (rule.operator === "in" || rule.operator === "notIn") {
        // Multi-select for "is any of" / "is none of"
        return (
          <div className="flex flex-wrap gap-1">
            {field.options.map((opt) => {
              const isSelected = Array.isArray(rule.value)
                ? rule.value.includes(opt.value)
                : rule.value === opt.value
              return (
                <button
                  key={String(opt.value)}
                  onClick={() => {
                    const currentValues = Array.isArray(rule.value) ? rule.value : []
                    const newValues = isSelected
                      ? currentValues.filter((v) => v !== opt.value)
                      : [...currentValues, opt.value]
                    updateRule(rule.id, { value: newValues })
                  }}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    isSelected
                      ? "bg-violet-100 border-violet-300 text-violet-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        )
      }

      return (
        <select
          value={String(rule.value)}
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        >
          <option value="">Select value</option>
          {field.options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    }

    // Boolean field type
    if (field.type === "boolean") {
      return (
        <select
          value={String(rule.value)}
          onChange={(e) => updateRule(rule.id, { value: e.target.value === "true" })}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        >
          <option value="">Select value</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      )
    }

    // Date field type
    if (field.type === "date") {
      if (rule.operator === "between") {
        return (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={String(rule.value) || ""}
              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <span className="text-gray-500 text-sm">and</span>
            <input
              type="date"
              value={String(rule.secondValue) || ""}
              onChange={(e) => updateRule(rule.id, { secondValue: e.target.value })}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        )
      }

      if (rule.operator === "inLast") {
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={String(rule.value) || ""}
              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
              placeholder="Number"
              min="1"
              className="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <select
              value={String(rule.secondValue) || "days"}
              onChange={(e) => updateRule(rule.id, { secondValue: e.target.value })}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        )
      }

      return (
        <input
          type="date"
          value={String(rule.value) || ""}
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      )
    }

    // Number field type
    if (field.type === "number") {
      if (rule.operator === "between") {
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={String(rule.value) || ""}
              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
              placeholder="Min"
              className="w-24 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <span className="text-gray-500 text-sm">and</span>
            <input
              type="number"
              value={String(rule.secondValue) || ""}
              onChange={(e) => updateRule(rule.id, { secondValue: e.target.value })}
              placeholder="Max"
              className="w-24 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        )
      }

      return (
        <input
          type="number"
          value={String(rule.value) || ""}
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
          placeholder="Enter value"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      )
    }

    // Default text input
    return (
      <input
        type="text"
        value={String(rule.value) || ""}
        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        placeholder="Enter value"
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">Advanced Filters</span>
          {rules.length > 0 && (
            <span className="text-xs text-white bg-violet-600 px-2 py-0.5 rounded-full">
              {rules.length} rule{rules.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Rules */}
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div
                key={rule.id}
                className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
              >
                {/* Conjunction */}
                {index > 0 && (
                  <span className="text-xs text-gray-500 py-1.5 font-medium">AND</span>
                )}

                {/* Field selector */}
                <select
                  value={rule.field}
                  onChange={(e) => updateRule(rule.id, { field: e.target.value, operator: "", value: "" })}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="">Select field</option>
                  {AVAILABLE_FIELDS.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </select>

                {/* Operator selector */}
                {rule.field && (
                  <select
                    value={rule.operator}
                    onChange={(e) => updateRule(rule.id, { operator: e.target.value, value: "" })}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="">Select operator</option>
                    {getOperatorsForField(rule.field).map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Value input */}
                {rule.field && rule.operator && renderValueInput(rule)}

                {/* Remove button */}
                <button
                  onClick={() => removeRule(rule.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Rule Button */}
          <button
            onClick={addRule}
            className="mt-3 flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add filter rule
          </button>

          {/* Actions */}
          {rules.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={onClear}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={onApply}
                className="px-4 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Apply filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Apply filter rules to a list of providers
 */
export function applyFilterRules<T extends Record<string, unknown>>(
  items: T[],
  rules: FilterRule[]
): T[] {
  if (rules.length === 0) return items

  return items.filter((item) => {
    return rules.every((rule) => {
      if (!rule.field || !rule.operator) return true

      const value = getNestedValue(item, rule.field)
      const filterValue = rule.value

      switch (rule.operator) {
        case "equals":
          return String(value).toLowerCase() === String(filterValue).toLowerCase()
        case "notEquals":
          return String(value).toLowerCase() !== String(filterValue).toLowerCase()
        case "contains":
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
        case "notContains":
          return !String(value).toLowerCase().includes(String(filterValue).toLowerCase())
        case "startsWith":
          return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase())
        case "endsWith":
          return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase())
        case "isEmpty":
          return value === null || value === undefined || value === ""
        case "isNotEmpty":
          return value !== null && value !== undefined && value !== ""
        case "greaterThan":
          return Number(value) > Number(filterValue)
        case "lessThan":
          return Number(value) < Number(filterValue)
        case "greaterOrEqual":
          return Number(value) >= Number(filterValue)
        case "lessOrEqual":
          return Number(value) <= Number(filterValue)
        case "between":
          return Number(value) >= Number(filterValue) && Number(value) <= Number(rule.secondValue)
        case "before":
          return new Date(String(value)) < new Date(String(filterValue))
        case "after":
          return new Date(String(value)) > new Date(String(filterValue))
        case "in":
          return Array.isArray(filterValue) && filterValue.includes(value)
        case "notIn":
          return Array.isArray(filterValue) && !filterValue.includes(value)
        default:
          return true
      }
    })
  })
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".")
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) return undefined

    // Handle array paths (e.g., "address.stateId" should check any address)
    if (Array.isArray(current)) {
      return current.some((item) =>
        item && typeof item === "object" ? getNestedValue(item as Record<string, unknown>, keys.slice(keys.indexOf(key)).join(".")) : false
      )
    }

    if (typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }

  return current
}
