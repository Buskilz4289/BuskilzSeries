/**
 * Reusable hook: sync state with localStorage.
 * Handles empty/corrupt data safely; keeps localStorage logic out of UI.
 */

import { useState, useEffect, useCallback } from 'react'

function safeParse(raw, fallback) {
  if (raw == null || raw === '') return fallback
  try {
    const parsed = JSON.parse(raw)
    return parsed
  } catch {
    return fallback
  }
}

/**
 * @param {string} key - localStorage key
 * @param {any} initialValue - default when key is missing or invalid (can be a function for lazy init)
 * @param {(value: any) => any} [validate] - optional; if provided, applied to parsed value so corrupt data becomes initialValue
 * @returns {[value, setValue]} - same API as useState; setValue syncs to localStorage
 */
export function useLocalStorage(key, initialValue, validate) {
  const [value, setValueState] = useState(() => {
    const fallback = typeof initialValue === 'function' ? initialValue() : initialValue
    const parsed = safeParse(localStorage.getItem(key), fallback)
    return validate ? validate(parsed) ?? fallback : parsed
  })

  const setValue = useCallback(
    (next) => {
      setValueState((prev) => {
        const nextValue = typeof next === 'function' ? next(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(nextValue))
        } catch {
          // quota or disabled
        }
        return nextValue
      })
    },
    [key]
  )

  return [value, setValue]
}
