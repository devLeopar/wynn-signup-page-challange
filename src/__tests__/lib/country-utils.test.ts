import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderFlag, getCountryName, clearCountryUtilsCache, getCacheSizes } from '@/lib/country-utils'
import { Country } from 'react-phone-number-input'

// Mock react-phone-number-input flags
vi.mock('react-phone-number-input/flags', () => ({
  default: {
    US: vi.fn(() => React.createElement('span', { 'data-testid': 'flag-us' }, '🇺🇸')),
    GB: vi.fn(() => React.createElement('span', { 'data-testid': 'flag-gb' }, '🇬🇧')),
    FR: vi.fn(() => React.createElement('span', { 'data-testid': 'flag-fr' }, '🇫🇷')),
    INVALID: undefined, // Simulate missing flag
  }
}))

// Mock react-phone-number-input locale
vi.mock('react-phone-number-input/locale/en.json', () => ({
  default: {
    US: 'United States',
    GB: 'United Kingdom', 
    FR: 'France',
    DE: 'Germany',
    // INVALID intentionally missing
  }
}))

describe('country-utils', () => {
  beforeEach(() => {
    clearCountryUtilsCache()
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearCountryUtilsCache()
  })

  describe('renderFlag', () => {
    it('should render flag component for valid country', () => {
      const flagElement = renderFlag('US' as Country)
      
      expect(flagElement).toBeTruthy()
      expect(React.isValidElement(flagElement)).toBe(true)
    })

    it('should return null for country without flag', () => {
      const flagElement = renderFlag('INVALID' as Country)
      
      expect(flagElement).toBeNull()
    })

    it('should cache flag elements', () => {
      // First call
      const flag1 = renderFlag('US' as Country)
      
      // Second call should return cached element
      const flag2 = renderFlag('US' as Country)
      
      expect(flag1).toBe(flag2)
    })

    it('should handle multiple different countries', () => {
      const usFlag = renderFlag('US' as Country)
      const gbFlag = renderFlag('GB' as Country)
      const frFlag = renderFlag('FR' as Country)
      
      expect(usFlag).toBeTruthy()
      expect(gbFlag).toBeTruthy()
      expect(frFlag).toBeTruthy()
      
      // All should be valid React elements
      expect(React.isValidElement(usFlag)).toBe(true)
      expect(React.isValidElement(gbFlag)).toBe(true)
      expect(React.isValidElement(frFlag)).toBe(true)
    })

    it('should create React element with correct structure', () => {
      const flagElement = renderFlag('US' as Country)
      
      expect(React.isValidElement(flagElement)).toBe(true)
      // Test structure if needed, but since it's mocked, we focus on behavior
    })
  })

  describe('getCountryName', () => {
    it('should return localized country name for valid country', () => {
      const name = getCountryName('US' as Country)
      
      expect(name).toBe('United States')
    })

    it('should return country code as fallback for missing translation', () => {
      const name = getCountryName('INVALID' as Country)
      
      expect(name).toBe('INVALID')
    })

    it('should cache country names', () => {
      // First call
      const name1 = getCountryName('US' as Country)
      
      // Second call should use cache
      const name2 = getCountryName('US' as Country)
      
      expect(name1).toBe('United States')
      expect(name2).toBe('United States')
      expect(name1).toBe(name2)
    })

    it('should handle multiple different countries', () => {
      const usName = getCountryName('US' as Country)
      const gbName = getCountryName('GB' as Country)
      const frName = getCountryName('FR' as Country)
      const deName = getCountryName('DE' as Country)
      
      expect(usName).toBe('United States')
      expect(gbName).toBe('United Kingdom')
      expect(frName).toBe('France')
      expect(deName).toBe('Germany')
    })

    it('should handle undefined country codes gracefully', () => {
      const name = getCountryName(undefined as unknown as Country)
      
      expect(name).toBe(undefined)
    })
  })

  describe('clearCountryUtilsCache', () => {
    it('should clear both flag and name caches', () => {
      // Populate caches
      renderFlag('US' as Country)
      getCountryName('US' as Country)
      
      const sizesBefore = getCacheSizes()
      expect(sizesBefore.flags).toBe(1)
      expect(sizesBefore.names).toBe(1)
      
      // Clear caches
      clearCountryUtilsCache()
      
      const sizesAfter = getCacheSizes()
      expect(sizesAfter.flags).toBe(0)
      expect(sizesAfter.names).toBe(0)
    })

    it('should allow fresh lookups after cache clear', () => {
      // First lookup
      const flag1 = renderFlag('US' as Country)
      
      // Clear cache
      clearCountryUtilsCache()
      
      // Second lookup should create new element (not same reference)
      const flag2 = renderFlag('US' as Country)
      
      expect(React.isValidElement(flag1)).toBe(true)
      expect(React.isValidElement(flag2)).toBe(true)
      // After cache clear, new element is created
      expect(flag1).not.toBe(flag2)
    })
  })

  describe('getCacheSizes', () => {
    it('should return correct cache sizes', () => {
      const initialSizes = getCacheSizes()
      expect(initialSizes.flags).toBe(0)
      expect(initialSizes.names).toBe(0)
      
      // Populate caches with different amounts
      renderFlag('US' as Country)
      renderFlag('GB' as Country)
      getCountryName('FR' as Country)
      
      const finalSizes = getCacheSizes()
      expect(finalSizes.flags).toBe(2)
      expect(finalSizes.names).toBe(1)
    })

    it('should update sizes as cache grows', () => {
      let sizes = getCacheSizes()
      expect(sizes.flags).toBe(0)
      expect(sizes.names).toBe(0)
      
      renderFlag('US' as Country)
      sizes = getCacheSizes()
      expect(sizes.flags).toBe(1)
      expect(sizes.names).toBe(0)
      
      getCountryName('US' as Country)
      sizes = getCacheSizes()
      expect(sizes.flags).toBe(1)
      expect(sizes.names).toBe(1)
      
      renderFlag('GB' as Country)
      getCountryName('GB' as Country)
      sizes = getCacheSizes()
      expect(sizes.flags).toBe(2)
      expect(sizes.names).toBe(2)
    })
  })

  describe('Performance', () => {
    it('should demonstrate caching performance benefits', () => {
      // Multiple calls to same country should use cache
      const start = performance.now()
      
      for (let i = 0; i < 100; i++) {
        renderFlag('US' as Country)
        getCountryName('US' as Country)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // With caching, this should be very fast
      expect(duration).toBeLessThan(50) // 50ms should be more than enough
      
      // Cache should still only have one entry for each
      const sizes = getCacheSizes()
      expect(sizes.flags).toBe(1)
      expect(sizes.names).toBe(1)
    })

    it('should handle cache memory efficiently', () => {
      // Test with many different countries
      const countries = ['US', 'GB', 'FR', 'DE', 'CA', 'AU', 'JP', 'CN', 'IN', 'BR'] as Country[]
      
      countries.forEach(country => {
        renderFlag(country)
        getCountryName(country)
      })
      
      const sizes = getCacheSizes()
      expect(sizes.flags).toBe(countries.length)
      expect(sizes.names).toBe(countries.length)
      
      // Clear cache to free memory
      clearCountryUtilsCache()
      
      const clearedSizes = getCacheSizes()
      expect(clearedSizes.flags).toBe(0)
      expect(clearedSizes.names).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle null country codes gracefully', () => {
      const flag = renderFlag(null as unknown as Country)
      const name = getCountryName(null as unknown as Country)
      
      expect(flag).toBeNull()
      expect(name).toBe(null)
    })

    it('should handle empty string country codes', () => {
      const flag = renderFlag('' as Country)
      const name = getCountryName('' as Country)
      
      expect(flag).toBeNull()
      expect(name).toBe('')
    })

    it('should not throw errors with invalid inputs', () => {
      expect(() => renderFlag('TOTALLY_INVALID' as Country)).not.toThrow()
      expect(() => getCountryName('TOTALLY_INVALID' as Country)).not.toThrow()
      
      const flag = renderFlag('TOTALLY_INVALID' as Country)
      const name = getCountryName('TOTALLY_INVALID' as Country)
      
      expect(flag).toBeNull()
      expect(name).toBe('TOTALLY_INVALID')
    })
  })
}) 