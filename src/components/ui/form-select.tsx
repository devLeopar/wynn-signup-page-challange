"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormSelectProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
  error?: string;
  // React Hook Form props
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
}

export const FormSelect = ({
  id,
  label,
  required = false,
  placeholder,
  options,
  className,
  error,
  value,
  onChange,
  onBlur,
  name,
}: FormSelectProps) => {
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
      <Select 
        value={value} 
        onValueChange={onChange}
        name={name || id}
      >
        <SelectTrigger 
          id={id} 
          onBlur={onBlur}
          data-testid={`${id}-select-trigger`}
          className={cn(
            "border-[#E8E9E9] bg-white rounded-sm h-12 p-8 w-full",
            error && "border-red-500"
          )}
        >
          <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}...`} />
        </SelectTrigger>
        <SelectContent data-testid={`${id}-select-content`}>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              data-testid={`${id}-option-${option.value}`}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormSelect; 