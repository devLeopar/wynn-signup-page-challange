import * as React from "react";
import { Country } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import en from "react-phone-number-input/locale/en.json";

// Cache for rendered flags to avoid recreating React elements
const flagCache = new Map<Country, React.ReactElement | null>();

// Cache for country names to avoid repeated lookups
const nameCache = new Map<Country, string>();

/**
 * Safely render country flag component with caching
 * @param country - Country code
 * @returns React component for the country flag or null
 */
export const renderFlag = (country: Country): React.ReactElement | null => {
  // Check cache first
  if (flagCache.has(country)) {
    return flagCache.get(country) || null;
  }

  const Flag = flags[country];
  const flagElement = Flag ? React.createElement(Flag, { title: country }) : null;
  
  // Cache the result
  flagCache.set(country, flagElement);
  return flagElement;
};

/**
 * Get localized country name with caching
 * @param countryCode - Country code
 * @returns Localized country name or country code as fallback
 */
export const getCountryName = (countryCode: Country): string => {
  // Check cache first
  if (nameCache.has(countryCode)) {
    return nameCache.get(countryCode)!;
  }

  const name = en[countryCode as keyof typeof en] || countryCode;
  
  // Cache the result
  nameCache.set(countryCode, name);
  return name;
};

/**
 * Clear all caches (useful for testing or memory management)
 */
export const clearCountryUtilsCache = (): void => {
  flagCache.clear();
  nameCache.clear();
};

/**
 * Get cache sizes for debugging
 */
export const getCacheSizes = (): { flags: number; names: number } => {
  return {
    flags: flagCache.size,
    names: nameCache.size,
  };
}; 