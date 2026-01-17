"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Hook for persisting state to localStorage with SSR support
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
    setIsHydrated(true)
  }, [key])

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        // Save to localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [isHydrated ? storedValue : initialValue, setValue]
}

/**
 * Hook for managing a Set in localStorage
 */
export function useLocalStorageSet<T extends string | number>(
  key: string,
  initialValue: Set<T> = new Set()
): [Set<T>, (value: Set<T> | ((prev: Set<T>) => Set<T>)) => void] {
  const [storedValue, setStoredValue] = useLocalStorage<T[]>(key, Array.from(initialValue))

  const setAsSet = new Set(storedValue)

  const setValue = useCallback(
    (value: Set<T> | ((prev: Set<T>) => Set<T>)) => {
      const newSet = value instanceof Function ? value(setAsSet) : value
      setStoredValue(Array.from(newSet))
    },
    [setAsSet, setStoredValue]
  )

  return [setAsSet, setValue]
}

/**
 * Hook for managing expansion states with localStorage persistence
 */
export function useExpandedSections(
  storageKey: string,
  defaultExpanded: Record<string, boolean> = {}
): {
  expandedSections: Record<string, boolean>
  toggleSection: (key: string) => void
  expandAll: () => void
  collapseAll: () => void
  setExpanded: (key: string, expanded: boolean) => void
} {
  const [expandedSections, setExpandedSections] = useLocalStorage<Record<string, boolean>>(
    storageKey,
    defaultExpanded
  )

  const toggleSection = useCallback(
    (key: string) => {
      setExpandedSections((prev) => ({
        ...prev,
        [key]: !prev[key],
      }))
    },
    [setExpandedSections]
  )

  const setExpanded = useCallback(
    (key: string, expanded: boolean) => {
      setExpandedSections((prev) => ({
        ...prev,
        [key]: expanded,
      }))
    },
    [setExpandedSections]
  )

  const expandAll = useCallback(() => {
    setExpandedSections((prev) => {
      const result: Record<string, boolean> = {}
      for (const key of Object.keys(prev)) {
        result[key] = true
      }
      return result
    })
  }, [setExpandedSections])

  const collapseAll = useCallback(() => {
    setExpandedSections((prev) => {
      const result: Record<string, boolean> = {}
      for (const key of Object.keys(prev)) {
        result[key] = false
      }
      return result
    })
  }, [setExpandedSections])

  return {
    expandedSections,
    toggleSection,
    expandAll,
    collapseAll,
    setExpanded,
  }
}
