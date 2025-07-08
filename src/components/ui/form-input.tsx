"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
  error?: string;
  // React Hook Form props
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(({
  id,
  label,
  required = false,
  placeholder,
  type = "text",
  className,
  error,
  value,
  onChange,
  onBlur,
  name,
}, ref) => {
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
      <Input
        ref={ref}
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        className={cn(
          "border-[#E8E9E9] bg-white rounded-sm h-12 p-8 w-full",
          error && "border-red-500"
        )}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
});

FormInput.displayName = "FormInput";

export default FormInput; 