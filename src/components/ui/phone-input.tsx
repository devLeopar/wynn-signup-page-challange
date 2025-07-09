"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import "react-phone-number-input/style.css";
import {
  Country,
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input";
import { renderFlag, getCountryName } from "@/lib/country-utils";

interface PhoneInputProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  error?: string;
  defaultCountry?: Country;
}

// Pre-process countries data once at module level for maximum performance
const PHONE_COUNTRIES_DATA = (() => {
  const countries = getCountries();
  return countries.map((countryCode) => ({
    code: countryCode,
    name: getCountryName(countryCode as Country),
    flag: renderFlag(countryCode as Country),
    callingCode: getCountryCallingCode(countryCode),
  }));
})();

// Memoized country item component for optimal rendering
const PhoneCountryItem = React.memo(({ 
  country, 
  isSelected, 
  onSelect 
}: { 
  country: typeof PHONE_COUNTRIES_DATA[0]; 
  isSelected: boolean; 
  onSelect: (code: string) => void; 
}) => (
  <CommandItem
    key={country.code}
    value={country.name}
    onSelect={() => onSelect(country.code)}
    className="flex items-center gap-2"
  >
    <div className="mr-2 w-6 h-4">
      {country.flag}
    </div>
    <span className="flex-1">
      {country.name}
    </span>
    {isSelected && (
      <Check className="h-4 w-4 text-[#7F56D9]" />
    )}
  </CommandItem>
));

PhoneCountryItem.displayName = "PhoneCountryItem";

// Virtualized country list for better performance with large datasets
const VirtualizedPhoneCountryList = React.memo(({ 
  countries, 
  selectedCountry, 
  onSelect 
}: { 
  countries: typeof PHONE_COUNTRIES_DATA; 
  selectedCountry: Country; 
  onSelect: (code: string) => void; 
}) => {
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 50 });
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const itemHeight = 40; // Approximate height per item
    const containerHeight = target.clientHeight;
    const scrollTop = target.scrollTop;
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 10, countries.length);
    
    setVisibleRange({ start, end });
  }, [countries.length]);

  const visibleCountries = React.useMemo(() => {
    return countries.slice(visibleRange.start, visibleRange.end);
  }, [countries, visibleRange]);

  return (
    <ScrollArea 
      className="h-[200px]" 
      ref={scrollAreaRef}
      onScrollCapture={handleScroll}
    >
      <div style={{ height: countries.length * 40 }}>
        <div style={{ transform: `translateY(${visibleRange.start * 40}px)` }}>
          {visibleCountries.map((country) => (
            <PhoneCountryItem
              key={country.code}
              country={country}
              isSelected={selectedCountry === country.code}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
});

VirtualizedPhoneCountryList.displayName = "VirtualizedPhoneCountryList";

export const PhoneInput = React.memo(({
  id,
  label,
  required = false,
  placeholder = "(___) - ___",
  className,
  value,
  onChange,
  error,
  defaultCountry = "AE",
}: PhoneInputProps) => {
  const [country, setCountry] = React.useState<Country>(defaultCountry);
  const [open, setOpen] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState<number | undefined>();
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Optimized container width calculation
  React.useLayoutEffect(() => {
    if (containerRef.current && open) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [open]);

  // Filtered countries based on search with memoization
  const filteredCountries = React.useMemo(() => {
    if (!searchTerm) return PHONE_COUNTRIES_DATA;
    const term = searchTerm.toLowerCase();
    return PHONE_COUNTRIES_DATA.filter((countryData) =>
      countryData.name.toLowerCase().includes(term) ||
      countryData.code.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Memoized country calling code
  const countryCallingCode = React.useMemo(() => {
    return getCountryCallingCode(country);
  }, [country]);

  // Optimized handlers with useCallback
  const handlePhoneChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value;
    const fullPhoneNumber = phoneNumber ? `+${countryCallingCode}${phoneNumber}` : "";
    if (onChange) {
      onChange(fullPhoneNumber);
    }
  }, [countryCallingCode, onChange]);

  // Helper function to extract phone number without country code
  const extractPhoneNumber = React.useCallback((fullPhone: string) => {
    if (!fullPhone.startsWith('+')) return fullPhone;
    const countryCode = getCountryCallingCode(country);
    return fullPhone.replace(`+${countryCode}`, '');
  }, [country]);

  const handleCountryChange = React.useCallback((countryCode: string) => {
    const newCountry = countryCode as Country;
    setCountry(newCountry);
    setOpen(false);
    setSearchTerm(""); // Reset search on selection
    
    // Update phone number with new country code if there's a current value
    if (value && onChange) {
      const currentPhoneNumber = extractPhoneNumber(value);
      if (currentPhoneNumber) {
        const newCountryCode = getCountryCallingCode(newCountry);
        const newFullPhoneNumber = `+${newCountryCode}${currentPhoneNumber}`;
        onChange(newFullPhoneNumber);
      }
    }
  }, [value, onChange, extractPhoneNumber]);

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm(""); // Reset search when closing
    }
  }, []);

  const handleSearchChange = React.useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  // Memoized flag component
  const countryFlag = React.useMemo(() => {
    return renderFlag(country);
  }, [country]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="flex items-center text-base gap-0">
        {label} {required && <span className="text-[#5A3A27]">*</span>}
        <div className="ml-auto">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-xs font-bold">i</span>
          </div>
        </div>
      </Label>
      <div className="relative">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverAnchor asChild>
            <div
              ref={containerRef}
              className="flex items-center h-12 p-8 border border-[#E8E9E9] rounded-sm bg-white overflow-hidden"
            >
              {/* Country Selector */}
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 h-full hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4">{countryFlag}</div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </button>
              </PopoverTrigger>

              {/* Country Code */}
              <div className="px-3 text-gray-700">
                +{countryCallingCode}
              </div>

              {/* Phone Input */}
              <Input
                id={id}
                type="tel"
                placeholder={placeholder}
                value={extractPhoneNumber(value || "")}
                onChange={handlePhoneChange}
                className={cn(
                  "flex-1 h-full border-none rounded-none p-3 shadow-none",
                  "focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                  error && "text-red-500"
                )}
              />
            </div>
          </PopoverAnchor>

          {/* Lazy load popover content only when open */}
          {open && (
            <PopoverContent
              className="p-0"
              align="start"
              style={{ width: containerWidth }}
              sideOffset={4}
            >
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Search" 
                  className="h-9" 
                  value={searchTerm}
                  onValueChange={handleSearchChange}
                />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    <VirtualizedPhoneCountryList
                      countries={filteredCountries}
                      selectedCountry={country}
                      onSelect={handleCountryChange}
                    />
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
