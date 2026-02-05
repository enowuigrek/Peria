import { useState, useEffect } from 'react'

/**
 * Custom hook for localStorage with automatic sync
 * @param {string} key - localStorage key
 * @param {*} initialValue - initial value if key doesn't exist
 * @returns {[value, setValue]} - state value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage whenever storedValue changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
