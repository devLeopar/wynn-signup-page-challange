"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormInputProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
}

export const FormInput = ({
  id,
  label,
  required = false,
  placeholder,
  type = "text",
  className,
}: FormInputProps) => {
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
        id={id}
        type={type}
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        className="border-[#E8E9E9] bg-white rounded-sm h-12 p-8 w-full"
      />
    </div>
  );
};

export default FormInput; 