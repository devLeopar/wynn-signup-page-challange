"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface PhoneInputProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const PhoneInput = ({
  id,
  label,
  required = false,
  placeholder = "Enter phone number...",
  className,
}: PhoneInputProps) => {
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
      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pointer-events-none">
          <Image
            src="/ae-flag.png"
            alt="UAE Flag"
            width={24}
            height={16}
            className="mr-2"
          />
          <span className="text-gray-700">+971</span>
          <span className="mx-2 text-gray-400">|</span>
        </div>
        <Input
          id={id}
          type="tel"
          placeholder={placeholder}
          className="border-[#E8E9E9] bg-white rounded-sm h-12 p-8 pl-28 w-full"
        />
      </div>
    </div>
  );
};

export default PhoneInput; 