"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { OtpMethodSelection } from "@/components/otp-method-selection";
import { OtpVerification } from "@/components/otp-verification";
import { RegistrationHeader } from "@/components/ui/registration-header";
import { 
  step1Schema, 
  type Step1FormData, 
  genderOptions as validationGenderOptions 
} from "@/lib/validation";
import { useSignupStore, useSignupActions, useDataState, useApiStatesState } from "@/store/signup-store";

// Convert validation gender options to component format
const genderOptions = validationGenderOptions.map((value) => ({
  value,
  label: value === "prefer_not_to_say" 
    ? "Prefer not to say" 
    : value.charAt(0).toUpperCase() + value.slice(1)
}));

// Removed static countries array - now using comprehensive country data from CountryCombobox

const Step1Form = () => {
  const actions = useSignupActions();
  const { step1Data } = useDataState();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: "onChange", // Validate on each change
    defaultValues: step1Data.firstName ? step1Data : {
      firstName: "",
      lastName: "",
      gender: "" as (typeof validationGenderOptions)[number], // Empty string to prevent controlled/uncontrolled warning
      country: "",
      email: "",
      phone: "",
      agreed: false
    }
  });
  
  const onSubmit = (data: Step1FormData) => {
    // Update store with form data
    actions.updateStep1Data(data);
    // Navigate to step 2
    actions.setStep(2);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 rounded-md">
      {/* Header */}
      <RegistrationHeader />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
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
              {...register("firstName")}
              error={errors.firstName?.message}
            />
            <FormInput
              id="lastName"
              label="Last Name"
              required
              placeholder="Enter last name..."
              {...register("lastName")}
              error={errors.lastName?.message}
            />
          </div>
          <div className="grid grid-cols-1 gap-y-6 mt-6">
            <Controller
              name="gender"
              control={control}
              render={({ field, fieldState }) => (
                <FormSelect
                  id="gender"
                  label="Gender"
                  required
                  options={genderOptions}
                  placeholder="Select gender..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="country"
              control={control}
              render={({ field, fieldState }) => (
                <CountryCombobox
                  id="country"
                  label="Your Residence Country"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Select residence country..."
                />
              )}
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
              {...register("email")}
              error={errors.email?.message}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <PhoneInput
                  id="phone"
                  label="Phone Number"
                  required
                  placeholder="(___) - ___"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  defaultCountry="AE"
                />
              )}
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-2 mt-8">
          <Controller
            name="agreed"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
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
                {fieldState.error && <p className="text-red-500 text-sm mt-1 ml-7">{fieldState.error.message}</p>}
              </div>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-start mt-8">
          <Button
            type="submit"
            className="bg-[#006F5F] hover:bg-[#005a4d] text-white px-16 py-4 h-auto text-lg uppercase transition-colors duration-200"
            disabled={!isValid}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export const SignupForm = () => {
  const { currentStep } = useSignupStore((state) => state.navigation);
  const { otpRequested } = useApiStatesState();

  // Render the appropriate step component
  switch (currentStep) {
    case 1:
      return <Step1Form />;
    case 2:
      // If OTP is requested, show verification, otherwise show method selection
      return otpRequested ? <OtpVerification /> : <OtpMethodSelection />;
    case 3:
      return <OtpVerification />;
    default:
      return <Step1Form />;
  }
};

export default SignupForm; 