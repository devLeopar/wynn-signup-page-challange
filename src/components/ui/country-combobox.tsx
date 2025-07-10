"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Country, getCountries } from "react-phone-number-input";
import { renderFlag, getCountryName } from "@/lib/country-utils";

interface CountryComboboxProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  error?: string;
}

// Pre-process countries data once at module level for maximum performance
const COUNTRIES_DATA = (() => {
  const countries = getCountries();
  return countries.map((countryCode) => ({
    code: countryCode,
    name: getCountryName(countryCode as Country),
    flag: renderFlag(countryCode as Country),
  }));
})();

// Memoized country item component for optimal rendering
const CountryItem = React.memo(({ 
  country, 
  isSelected, 
  onSelect 
}: { 
  country: typeof COUNTRIES_DATA[0]; 
  isSelected: boolean; 
  onSelect: (code: string) => void; 
}) => (
  <CommandItem
    key={country.code}
    value={country.name}
    onSelect={() => onSelect(country.code)}
    className="flex items-center gap-3 cursor-pointer"
  >
    <div className="w-6 h-4 flex-shrink-0">
      {country.flag}
    </div>
    <span className="flex-1">
      {country.name}
    </span>
    {isSelected && (
      <Check className="h-4 w-4 text-[#7F56D9] flex-shrink-0" data-testid="check-icon" />
    )}
  </CommandItem>
));

CountryItem.displayName = "CountryItem";

// Virtualized country list for better performance with large datasets
const VirtualizedCountryList = React.memo(({ 
  countries, 
  selectedValue, 
  onSelect 
}: { 
  countries: typeof COUNTRIES_DATA; 
  selectedValue?: string; 
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
      className="h-[300px]" 
      ref={scrollAreaRef}
      onScrollCapture={handleScroll}
    >
      <div style={{ height: countries.length * 40 }}>
        <div style={{ transform: `translateY(${visibleRange.start * 40}px)` }}>
          {visibleCountries.map((country) => (
            <CountryItem
              key={country.code}
              country={country}
              isSelected={selectedValue === country.code}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
});

VirtualizedCountryList.displayName = "VirtualizedCountryList";

export const CountryCombobox = React.memo(({
  id,
  label,
  required = false,
  placeholder = "Select residence country...",
  className,
  value,
  onChange,
  error,
}: CountryComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState<number | undefined>();
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Optimized container width calculation with debouncing
  React.useLayoutEffect(() => {
    if (containerRef.current && open) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [open]);

  // Find selected country with memoization
  const selectedCountry = React.useMemo(() => {
    if (!value) return null;
    return COUNTRIES_DATA.find((country) => country.code === value) || null;
  }, [value]);

  // Filtered countries based on search with memoization
  const filteredCountries = React.useMemo(() => {
    if (!searchTerm) return COUNTRIES_DATA;
    const term = searchTerm.toLowerCase();
    return COUNTRIES_DATA.filter((country) =>
      country.name.toLowerCase().includes(term) ||
      country.code.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Optimized handlers with useCallback
  const handleCountrySelect = React.useCallback((countryCode: string) => {
    if (onChange) {
      onChange(countryCode === value ? undefined : countryCode);
    }
    setOpen(false);
    setSearchTerm(""); // Reset search on selection
  }, [onChange, value]);

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm(""); // Reset search when closing
    }
  }, []);

  const handleSearchChange = React.useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  return (
    <div className={`space-y-2 ${className}`} data-testid="country-combobox">
      <Label htmlFor={id} className="flex items-center text-base gap-0">
        {label} {required && <span className="text-[#5A3A27]">*</span>}
        <div className="ml-auto">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-xs font-bold" data-testid="info-icon">i</span>
          </div>
        </div>
      </Label>
      <div className="relative">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverAnchor asChild>
            <div
              ref={containerRef}
              className={cn(
                "flex items-center justify-between w-full h-12 p-8 border border-[#E8E9E9] rounded-sm bg-white",
                error && "border-red-500"
              )}
              data-testid="country-combobox-container"
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center justify-between w-full text-left bg-transparent border-0 p-0",
                    "rounded-sm",
                    !selectedCountry && "text-gray-500"
                  )}
                  aria-expanded={open}
                  aria-haspopup="listbox"
                  id={id}
                  data-testid="country-combobox-trigger"
                >
                  <div className="flex items-center gap-3">
                    {selectedCountry && (
                      <div className="w-6 h-4 flex-shrink-0" data-testid="selected-country-flag">
                        {selectedCountry.flag}
                      </div>
                    )}
                    <span className="flex-1 truncate" data-testid="selected-country-text">
                      {selectedCountry ? selectedCountry.name : placeholder}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" data-testid="chevron-down" />
                </button>
              </PopoverTrigger>
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
                  placeholder="Search countries..." 
                  className="h-9"
                  value={searchTerm}
                  onValueChange={handleSearchChange}
                  data-testid="country-search-input"
                />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    <VirtualizedCountryList
                      countries={filteredCountries}
                      selectedValue={value}
                      onSelect={handleCountrySelect}
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

CountryCombobox.displayName = "CountryCombobox";

export default CountryCombobox;
