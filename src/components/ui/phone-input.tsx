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
import flags from "react-phone-number-input/flags";
import en from "react-phone-number-input/locale/en.json";

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

export const PhoneInput = ({
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
  const countries = React.useMemo(() => getCountries(), []);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Update container width when component mounts or open state changes
  React.useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [open]);

  // Helper function to safely render flag
  const renderFlag = (country: Country) => {
    const Flag = flags[country];
    return Flag ? <Flag title={country} /> : null;
  };

  // Get country name from locale
  const getCountryName = (countryCode: Country) => {
    return en[countryCode as keyof typeof en] || countryCode;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleCountryChange = (newCountry: Country) => {
    setCountry(newCountry);
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
              className="flex items-center h-12 p-8 border border-[#E8E9E9] rounded-sm bg-white overflow-hidden"
            >
              {/* Country Selector */}
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 h-full hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4">{renderFlag(country)}</div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </button>
              </PopoverTrigger>

              {/* Country Code */}
              <div className="px-3 text-gray-700">
                +{getCountryCallingCode(country)}
              </div>

              {/* Phone Input */}
              <Input
                id={id}
                type="tel"
                placeholder={placeholder}
                value={value || ""}
                onChange={handlePhoneChange}
                className={cn(
                  "flex-1 border-0 h-full rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-3",
                  error && "text-red-500"
                )}
              />
            </div>
          </PopoverAnchor>
          
          <PopoverContent 
            className="p-0" 
            align="start"
            style={{ width: containerWidth }}
            sideOffset={4}
          >
            <Command>
              <CommandInput placeholder="Search" className="h-9" />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[200px]">
                    {countries.map((countryCode) => (
                      <CommandItem
                        key={countryCode}
                        value={getCountryName(countryCode as Country)}
                        onSelect={() => handleCountryChange(countryCode as Country)}
                        className="flex items-center gap-2"
                      >
                        <div className="mr-2 w-6 h-4">
                          {renderFlag(countryCode as Country)}
                        </div>
                        <span className="flex-1">
                          {getCountryName(countryCode as Country)}
                        </span>
                        {country === countryCode && (
                          <Check className="h-4 w-4 text-[#7F56D9]" />
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

export default PhoneInput;
