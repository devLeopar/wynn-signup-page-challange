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
import {
  Country,
  getCountries,
} from "react-phone-number-input";
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

export const CountryCombobox = ({
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
  const countries = React.useMemo(() => getCountries(), []);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Update container width when component mounts or open state changes
  React.useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [open]);

  // Find selected country object
  const selectedCountry = React.useMemo(() => {
    if (!value) return null;
    return countries.find(country => country === value) || null;
  }, [value, countries]);

  const handleCountrySelect = (countryCode: string) => {
    if (onChange) {
      onChange(countryCode === value ? undefined : countryCode);
    }
    setOpen(false);
  };

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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <div
              ref={containerRef}
              className={cn(
                "flex items-center justify-between w-full h-12 p-8 border border-[#E8E9E9] rounded-sm bg-white",
                error && "border-red-500"
              )}
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
                >
                  <div className="flex items-center gap-3">
                    {selectedCountry && (
                      <div className="w-6 h-4 flex-shrink-0">
                        {renderFlag(selectedCountry as Country)}
                      </div>
                    )}
                    <span className="flex-1 truncate">
                      {selectedCountry 
                        ? getCountryName(selectedCountry as Country)
                        : placeholder
                      }
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                </button>
              </PopoverTrigger>
            </div>
          </PopoverAnchor>
          
          <PopoverContent 
            className="p-0" 
            align="start"
            style={{ width: containerWidth }}
            sideOffset={4}
          >
            <Command>
              <CommandInput 
                placeholder="Search countries..." 
                className="h-9" 
              />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[300px]">
                    {countries.map((countryCode) => (
                      <CommandItem
                        key={countryCode}
                        value={getCountryName(countryCode as Country)}
                        onSelect={() => handleCountrySelect(countryCode)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-6 h-4 flex-shrink-0">
                          {renderFlag(countryCode as Country)}
                        </div>
                        <span className="flex-1">
                          {getCountryName(countryCode as Country)}
                        </span>
                        {value === countryCode && (
                          <Check className="h-4 w-4 text-[#7F56D9] flex-shrink-0" />
                        )}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default CountryCombobox; 