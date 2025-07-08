import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

// Gender enum values
const genderOptions = ["male", "female", "other", "prefer_not_to_say"] as const;

// OTP method enum values  
const otpMethodOptions = ["email", "phone"] as const;

/**
 * Step 1 Registration Form Validation Schema
 * Validates personal information and contact details
 */
export const step1Schema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),

  gender: z
    .enum(genderOptions, {
      errorMap: () => ({ message: "Please select a gender" }),
    }),

  country: z
    .string()
    .min(1, "Residence country is required")
    .min(2, "Please select a valid country"),

  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address")
    .max(100, "Email address is too long"),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((phone) => {
      try {
        return isValidPhoneNumber(phone);
      } catch {
        return false;
      }
    }, "Please enter a valid phone number"),

  agreed: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the terms and conditions to continue",
    }),
});

/**
 * Step 2 OTP Method Selection Validation Schema
 * Validates OTP delivery method selection
 */
export const step2Schema = z.object({
  otpMethod: z
    .enum(otpMethodOptions, {
      errorMap: () => ({ message: "Please select how you'd like to receive your verification code" }),
    }),
});

/**
 * Step 3 OTP Code Validation Schema
 * Validates the 4-digit OTP code entry
 */
export const step3Schema = z.object({
  otpCode: z
    .string()
    .min(1, "Verification code is required")
    .length(4, "Verification code must be exactly 4 digits")
    .regex(/^\d{4}$/, "Verification code must contain only numbers"),
});

// TypeScript type exports for form data
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;

// Export the gender and OTP method options for use in components
export { genderOptions, otpMethodOptions };

// Combined schema for complete registration (if needed)
export const completeRegistrationSchema = step1Schema.and(step2Schema).and(step3Schema);
export type CompleteRegistrationData = z.infer<typeof completeRegistrationSchema>; 