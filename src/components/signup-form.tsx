"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { CountryCombobox } from "@/components/ui/country-combobox";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

// Removed static countries array - now using comprehensive country data from CountryCombobox

export const SignupForm = () => {
  const [agreed, setAgreed] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [countryValue, setCountryValue] = useState<string>("");
  const [countryError, setCountryError] = useState<string | undefined>();

  const handlePhoneChange = useCallback((value: string | undefined) => {
    const phoneStr = value || "";
    setPhoneValue(phoneStr);
    
    // Basic validation
    if (!phoneStr) {
      setPhoneError("Phone number is required");
    } else if (phoneStr.length < 8) {
      setPhoneError("Phone number is too short");
    } else {
      setPhoneError(undefined);
    }
  }, []);

  const handleCountryChange = useCallback((value: string | undefined) => {
    const countryStr = value || "";
    setCountryValue(countryStr);
    
    // Basic validation
    if (!countryStr) {
      setCountryError("Residence country is required");
    } else {
      setCountryError(undefined);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8 rounded-md">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-serif text-[#1A1A1A]">Registration</h1>
          <div className="text-2xl text-gray-600">Step 1 of 3</div>
        </div>
        <p className="text-gray-600 text-lg">
          Please enter below information to create your account.
        </p>
      </div>

      <form className="space-y-10">
        {/* Personal Info Section */}
        <div>
          <h2 className="text-2xl font-medium mb-4 text-[#1A1A1A]">Personal Info</h2>
          <hr className="border-t border-gray-300 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <FormInput
              id="firstName"
              label="First Name"
              required
              placeholder="Enter first name..."
            />
            <FormInput
              id="lastName"
              label="Last Name"
              required
              placeholder="Enter last name..."
            />
          </div>
          <div className="grid grid-cols-1 gap-y-6 mt-6">
            <FormSelect
              id="gender"
              label="Gender"
              required
              options={genderOptions}
              placeholder="Select gender..."
            />
            <CountryCombobox
              id="country"
              label="Your Residence Country"
              required
              value={countryValue}
              onChange={handleCountryChange}
              error={countryError}
              placeholder="Select residence country..."
            />
          </div>
        </div>

        {/* Contact Details Section */}
        <div>
          <h2 className="text-2xl font-medium mb-4 text-[#1A1A1A]">Contact Details</h2>
          <hr className="border-t border-gray-300 mb-8" />
          <div className="grid grid-cols-1 gap-y-6">
            <FormInput
              id="email"
              label="Email"
              required
              type="email"
              placeholder="Enter email address..."
            />
            <PhoneInput
              id="phone"
              label="Phone Number"
              required
              placeholder="(___) - ___"
              value={phoneValue}
              onChange={handlePhoneChange}
              error={phoneError}
              defaultCountry="AE"
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-2 mt-8">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-1 border-gray-400"
          />
          <Label htmlFor="terms" className="text-sm font-normal">
            I agree to the{" "}
            <Link href="#" className="text-[#5A3A27] underline hover:text-[#7A5A47]">
              terms and conditions
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-[#5A3A27] underline hover:text-[#7A5A47]">
              privacy policy
            </Link>
            .
          </Label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-start mt-8">
          <Button
            type="submit"
            className="bg-[#006F5F] hover:bg-[#005a4d] text-white px-12 py-3 h-auto text-lg uppercase"
            disabled={!agreed}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm; 