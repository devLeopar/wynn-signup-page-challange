"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { RegistrationHeader } from "@/components/ui/registration-header";
import { 
  step2Schema, 
  type Step2FormData
} from "@/lib/validation";
import { useSignupStore, useSignupActions, useDataState, useUIState } from "@/store/signup-store";
import { useRequestOtp } from "@/hooks/use-auth-mutations";
import { cn } from "@/lib/utils";

export const OtpMethodSelection = () => {
  const actions = useSignupActions();
  const { currentStep } = useSignupStore((state) => state.navigation);
  const { step1Data, step2Data } = useDataState();
  const { isLoading, apiErrors } = useUIState();
  const requestOtpMutation = useRequestOtp();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data,
    mode: "onChange",
  });

  const selectedMethod = watch("otpMethod");

  const handleMethodSelection = (method: 'email' | 'phone') => {
    // Update form data immediately
    actions.updateStep2Data({ otpMethod: method });
  };

  const onSubmit = async (data: Step2FormData) => {
    // Clear previous errors
    actions.clearApiErrors();
    
    // Update store with form data
    actions.updateStep2Data(data);

    // Prepare API request
    const requestData = {
      method: data.otpMethod,
      email: data.otpMethod === 'email' ? step1Data.email : undefined,
      phone: data.otpMethod === 'phone' ? step1Data.phone : undefined,
    };

    try {
      await requestOtpMutation.mutateAsync(requestData);
      // OTP sent successfully - OtpVerification will render automatically
      // Step remains 2, but OTP verification component will show
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('OTP request failed:', error);
    }
  };

  const handleBack = () => {
    actions.setStep(1);
  };

  if (currentStep !== 2) return null;

  return (
    <div className="max-w-3xl mx-auto p-8 rounded-md" data-testid="otp-method-selection">
      {/* Header */}
      <RegistrationHeader />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" data-testid="otp-method-form">
        {/* OTP Verification Section */}
        <div>
          <h2 className="text-2xl font-medium mb-4 text-[#1A1A1A]">OTP Verification</h2>
          <hr className="border-t border-gray-300 mb-8" />
          
          {/* Send Code Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-xl font-medium mb-4 text-center text-[#1A1A1A]">Send Code</h3>
            <p className="text-gray-600 text-center mb-6">How would you like to receive the code?</p>
            
            <Controller
              name="otpMethod"
              control={control}
              render={({ field }) => (
                <div className="flex justify-center space-x-8">
                  {/* Email Option */}
                  <div
                    className={cn(
                      "flex items-center space-x-2 cursor-pointer",
                      selectedMethod === 'email' ? "text-[#006F5F]" : "text-gray-600"
                    )}
                    onClick={() => {
                      field.onChange('email');
                      handleMethodSelection('email');
                    }}
                    data-testid="email-otp-option"
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      selectedMethod === 'email' 
                        ? "border-[#006F5F] bg-[#006F5F]" 
                        : "border-gray-400"
                    )}>
                      {selectedMethod === 'email' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium">Send to Email</span>
                  </div>

                  {/* Phone Option */}
                  <div
                    className={cn(
                      "flex items-center space-x-2 cursor-pointer",
                      selectedMethod === 'phone' ? "text-[#006F5F]" : "text-gray-600"
                    )}
                    onClick={() => {
                      field.onChange('phone');
                      handleMethodSelection('phone');
                    }}
                    data-testid="phone-otp-option"
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      selectedMethod === 'phone' 
                        ? "border-[#006F5F] bg-[#006F5F]" 
                        : "border-gray-400"
                    )}>
                      {selectedMethod === 'phone' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium">Send to Phone</span>
                  </div>
                </div>
              )}
            />
            
            {(errors.otpMethod || apiErrors.otp) && (
              <p className="text-red-500 text-sm text-center mt-4">
                {errors.otpMethod?.message || apiErrors.otp}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-10 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="px-16 py-5 h-auto text-lg uppercase border-[#006F5F] text-[#006F5F] hover:bg-[#006F5F]/10 hover:border-[#006F5F] rounded-[4px] transition-colors duration-200 flex-1"
            disabled={isLoading || requestOtpMutation.isPending}
            data-testid="back-button"
          >
            Back
          </Button>
          
          <Button
            type="submit"
            className="bg-[#006F5F] hover:bg-[#005a4d] text-white px-16 py-5 h-auto text-lg uppercase transition-colors duration-200 rounded-[4px] flex-1"
            disabled={!isValid || isLoading || requestOtpMutation.isPending}
            data-testid="send-otp-button"
          >
            {requestOtpMutation.isPending ? 'Sending...' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  );
}; 