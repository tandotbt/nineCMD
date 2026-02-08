import { expect } from 'vitest'

/**
 * Validates that the 'actual' object matches the structure and types of the 'expected' object.
 * It does NOT check for exact values, but ensures keys exist and have the correct types.
 */
export function validateStructure(actual: unknown, expected: unknown, pathStr = '') {
  if (expected === null || expected === undefined) {
    return
  }

  if (Array.isArray(expected)) {
    expect(Array.isArray(actual), `Path ${pathStr} should be an array`).toBe(true)
    const actualArray = actual as unknown[]
    const expectedArray = expected as unknown[]

    // Validate structure of elements in the array
    if (expectedArray.length > 0) {
      // Check each element in actual against the first element of expected (the template)
      actualArray.forEach((item, index) => {
        validateStructure(item, expectedArray[0], `${pathStr}[${index}].`)
      })
    }
    return
  }

  if (typeof expected === 'object' && expected !== null) {
    expect(actual, `Path ${pathStr} should be an object but got ${typeof actual}`).not.toBeNull()
    expect(typeof actual, `Path ${pathStr} should be an object`).toBe('object')

    const expectedObj = expected as Record<string, unknown>
    const actualObj = (actual || {}) as Record<string, unknown>

    const expectedKeys = Object.keys(expectedObj)
    const actualKeys = Object.keys(actualObj)

    expectedKeys.forEach((key) => {
      expect(actualKeys, `Missing key: ${pathStr}${key}`).toContain(key)

      const expectedVal = expectedObj[key]
      const actualVal = actualObj[key]

      // If expected value is null, we just check if the key exists (already checked above)
      if (expectedVal === null) {
        return
      }

      // If actual value is null, we allow it (lenient check for real data)
      if (actualVal === null) {
        return
      }

      if (typeof expectedVal === 'object') {
        validateStructure(actualVal, expectedVal, `${pathStr}${key}.`)
      } else {
        expect(
          typeof actualVal,
          `Type mismatch at ${pathStr}${key} (Expected: ${typeof expectedVal}, Got: ${typeof actualVal})`,
        ).toBe(typeof expectedVal)
      }
    })
    return
  }

  expect(typeof actual, `Type mismatch at ${pathStr}`).toBe(typeof expected)
}
