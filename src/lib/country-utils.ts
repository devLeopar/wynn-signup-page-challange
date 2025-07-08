import * as React from "react";
import { Country } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import en from "react-phone-number-input/locale/en.json";

/**
 * Safely render country flag component
 * @param country - Country code
 * @returns React component for the country flag or null
 */
export const renderFlag = (country: Country): React.ReactElement | null => {
  const Flag = flags[country];
  return Flag ? React.createElement(Flag, { title: country }) : null;
};

/**
 * Get localized country name
 * @param countryCode - Country code
 * @returns Localized country name or country code as fallback
 */
export const getCountryName = (countryCode: Country) => {
  return en[countryCode as keyof typeof en] || countryCode;
}; 