/**
 * Deep utility functions for object manipulation and comparison
 */

/**
 * Deep clone an object using structuredClone (native) with fallback
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj

  try {
    return structuredClone(obj)
  } catch {
    // Fallback for environments without structuredClone
    return JSON.parse(JSON.stringify(obj))
  }
}

/**
 * Deep equality check between two values
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true

  if (a === null || b === null) return a === b
  if (typeof a !== typeof b) return false

  if (typeof a !== "object") return a === b

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  if (Array.isArray(a) || Array.isArray(b)) return false

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>

  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)

  if (aKeys.length !== bKeys.length) return false

  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]))
}

/**
 * Get a nested value from an object using dot notation path
 * Supports array indices: "address.0.city"
 */
export function getNestedValue<T = unknown>(obj: unknown, path: string): T | undefined {
  if (!path) return obj as T

  const keys = path.split(".")
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) return undefined

    if (typeof current !== "object") return undefined

    // Handle array index
    const arrayIndex = parseInt(key, 10)
    if (!isNaN(arrayIndex) && Array.isArray(current)) {
      current = current[arrayIndex]
    } else {
      current = (current as Record<string, unknown>)[key]
    }
  }

  return current as T
}

/**
 * Set a nested value in an object using dot notation path
 * Returns a new object (immutable update)
 * Supports array indices: "address.0.city"
 */
export function setNestedValue<T>(obj: T, path: string, value: unknown): T {
  if (!path) return value as T

  const keys = path.split(".")
  const result = deepClone(obj)

  let current: unknown = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const nextKey = keys[i + 1]

    if (current === null || current === undefined || typeof current !== "object") {
      return result
    }

    const arrayIndex = parseInt(key, 10)

    if (!isNaN(arrayIndex) && Array.isArray(current)) {
      // Ensure array element exists
      if (current[arrayIndex] === undefined) {
        current[arrayIndex] = !isNaN(parseInt(nextKey, 10)) ? [] : {}
      }
      current = current[arrayIndex]
    } else {
      const currentObj = current as Record<string, unknown>
      // Ensure nested object/array exists
      if (currentObj[key] === undefined) {
        currentObj[key] = !isNaN(parseInt(nextKey, 10)) ? [] : {}
      }
      current = currentObj[key]
    }
  }

  const lastKey = keys[keys.length - 1]
  const lastArrayIndex = parseInt(lastKey, 10)

  if (!isNaN(lastArrayIndex) && Array.isArray(current)) {
    current[lastArrayIndex] = value
  } else if (typeof current === "object" && current !== null) {
    (current as Record<string, unknown>)[lastKey] = value
  }

  return result
}

/**
 * Delete a nested value from an object using dot notation path
 * Returns a new object (immutable update)
 * For arrays, removes the element at the index
 */
export function deleteNestedValue<T>(obj: T, path: string): T {
  if (!path) return obj

  const keys = path.split(".")
  const result = deepClone(obj)

  let current: unknown = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    if (current === null || current === undefined || typeof current !== "object") {
      return result
    }

    const arrayIndex = parseInt(key, 10)

    if (!isNaN(arrayIndex) && Array.isArray(current)) {
      current = current[arrayIndex]
    } else {
      current = (current as Record<string, unknown>)[key]
    }
  }

  const lastKey = keys[keys.length - 1]
  const lastArrayIndex = parseInt(lastKey, 10)

  if (!isNaN(lastArrayIndex) && Array.isArray(current)) {
    current.splice(lastArrayIndex, 1)
  } else if (typeof current === "object" && current !== null) {
    delete (current as Record<string, unknown>)[lastKey]
  }

  return result
}

/**
 * Add an item to a nested array
 * Returns a new object (immutable update)
 */
export function addToNestedArray<T, V>(obj: T, path: string, value: V): T {
  const currentArray = getNestedValue<V[]>(obj, path)
  const newArray = Array.isArray(currentArray) ? [...currentArray, value] : [value]
  return setNestedValue(obj, path, newArray)
}

/**
 * Get all paths that differ between two objects
 * Returns array of dot-notation paths
 */
export function getModifiedPaths(original: unknown, current: unknown, prefix = ""): string[] {
  const paths: string[] = []

  if (deepEqual(original, current)) return paths

  if (
    original === null ||
    current === null ||
    typeof original !== "object" ||
    typeof current !== "object"
  ) {
    return prefix ? [prefix] : []
  }

  if (Array.isArray(original) && Array.isArray(current)) {
    const maxLength = Math.max(original.length, current.length)
    for (let i = 0; i < maxLength; i++) {
      const itemPath = prefix ? `${prefix}.${i}` : `${i}`
      if (i >= original.length || i >= current.length) {
        paths.push(itemPath)
      } else {
        paths.push(...getModifiedPaths(original[i], current[i], itemPath))
      }
    }
    return paths
  }

  const originalObj = original as Record<string, unknown>
  const currentObj = current as Record<string, unknown>
  const allKeys = new Set([...Object.keys(originalObj), ...Object.keys(currentObj)])

  for (const key of allKeys) {
    const keyPath = prefix ? `${prefix}.${key}` : key
    paths.push(...getModifiedPaths(originalObj[key], currentObj[key], keyPath))
  }

  return paths
}

/**
 * Generate a unique ID for new records
 */
export function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}
