"use client"

import { useState, useCallback, useMemo } from "react"
import type { Provider } from "@/lib/provider-types"
import type { ProviderEditState } from "@/components/providers/provider-edit-drawer/types"
import {
  deepClone,
  deepEqual,
  getNestedValue,
  setNestedValue,
  deleteNestedValue,
  addToNestedArray,
  generateId,
} from "@/lib/utils/deep-utils"

/**
 * Hook for managing provider edit state with field-level change tracking
 */
export function useProviderEditState(initialProvider: Provider): ProviderEditState {
  // Track original state (deep clone on mount)
  const [originalProvider] = useState<Provider>(() => deepClone(initialProvider))
  const [editedProvider, setEditedProvider] = useState<Provider>(() => deepClone(initialProvider))

  // Calculate modified fields
  const modifiedFields = useMemo(() => {
    const fields = new Set<string>()

    const checkModifications = (original: unknown, current: unknown, path: string = "") => {
      if (deepEqual(original, current)) return

      if (
        original === null ||
        current === null ||
        typeof original !== "object" ||
        typeof current !== "object"
      ) {
        if (path) fields.add(path)
        return
      }

      if (Array.isArray(original) && Array.isArray(current)) {
        // For arrays, mark the array path if lengths differ
        if (original.length !== current.length) {
          fields.add(path)
        }
        // Check each item
        const maxLength = Math.max(original.length, current.length)
        for (let i = 0; i < maxLength; i++) {
          checkModifications(original[i], current[i], path ? `${path}.${i}` : `${i}`)
        }
        return
      }

      const originalObj = original as Record<string, unknown>
      const currentObj = current as Record<string, unknown>
      const allKeys = new Set([...Object.keys(originalObj), ...Object.keys(currentObj)])

      for (const key of allKeys) {
        const keyPath = path ? `${path}.${key}` : key
        checkModifications(originalObj[key], currentObj[key], keyPath)
      }
    }

    checkModifications(originalProvider, editedProvider)
    return fields
  }, [originalProvider, editedProvider])

  // Update field and track modification
  const updateField = useCallback((path: string, value: unknown) => {
    setEditedProvider((prev) => setNestedValue(prev, path, value))
  }, [])

  // Revert single field to original value
  const revertField = useCallback(
    (path: string) => {
      const originalValue = getNestedValue(originalProvider, path)
      setEditedProvider((prev) => setNestedValue(prev, path, originalValue))
    },
    [originalProvider]
  )

  // Revert all changes
  const revertAll = useCallback(() => {
    setEditedProvider(deepClone(originalProvider))
  }, [originalProvider])

  // Check if specific field is modified
  const isFieldModified = useCallback(
    (path: string): boolean => {
      // Check exact path
      if (modifiedFields.has(path)) return true

      // Check if any child path is modified (for objects/arrays)
      for (const field of modifiedFields) {
        if (field.startsWith(path + ".")) return true
      }

      return false
    },
    [modifiedFields]
  )

  // Get original value for display
  const getOriginalValue = useCallback(
    <T = unknown>(path: string): T | undefined => {
      return getNestedValue<T>(originalProvider, path)
    },
    [originalProvider]
  )

  // Add item to array
  const addArrayItem = useCallback(
    (path: string, item: unknown) => {
      // Generate unique ID if item has id field
      const itemWithId =
        typeof item === "object" && item !== null
          ? { ...item, id: (item as Record<string, unknown>).id || generateId() }
          : item

      setEditedProvider((prev) => addToNestedArray(prev, path, itemWithId))
    },
    []
  )

  // Remove item from array
  const removeArrayItem = useCallback((path: string, index: number) => {
    setEditedProvider((prev) => {
      const array = getNestedValue<unknown[]>(prev, path)
      if (!Array.isArray(array)) return prev

      const newArray = [...array]
      newArray.splice(index, 1)
      return setNestedValue(prev, path, newArray)
    })
  }, [])

  return {
    editedProvider,
    originalProvider,
    modifiedFields,
    updateField,
    revertField,
    revertAll,
    isFieldModified,
    getOriginalValue,
    isDirty: modifiedFields.size > 0,
    addArrayItem,
    removeArrayItem,
  }
}

/**
 * Hook for managing tab search terms
 */
export function useTabSearch() {
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})

  const setTabSearch = useCallback((tabId: string, term: string) => {
    setSearchTerms((prev) => ({
      ...prev,
      [tabId]: term,
    }))
  }, [])

  const getTabSearch = useCallback(
    (tabId: string): string => {
      return searchTerms[tabId] || ""
    },
    [searchTerms]
  )

  const clearTabSearch = useCallback((tabId: string) => {
    setSearchTerms((prev) => {
      const next = { ...prev }
      delete next[tabId]
      return next
    })
  }, [])

  const clearAllSearches = useCallback(() => {
    setSearchTerms({})
  }, [])

  return {
    searchTerms,
    setTabSearch,
    getTabSearch,
    clearTabSearch,
    clearAllSearches,
  }
}
