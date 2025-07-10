"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistrationHeader } from "@/components/ui/registration-header";
import { 
  step3Schema, 
  type Step3FormData
} from "@/lib/validation";
import { 
  useSignupStore, 
  useSignupActions, 
  useDataState, 
  useApiStatesState,
  useUIState
} from "@/store/signup-store";
import { useVerifyOtpAndRegister, useResendOtp } from "@/hooks/use-auth-mutations";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export const OtpVerification = () => {
  const actions = useSignupActions();
  const { currentStep } = useSignupStore((state) => state.navigation);
  const { step1Data, step3Data } = useDataState();
  const { selectedOtpMethod, userRegistered } = useApiStatesState();
  const { isLoading, apiErrors } = useUIState();
  const verifyOtpMutation = useVerifyOtpAndRegister();
  const resendOtpMutation = useResendOtp();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: step3Data,
    mode: "onChange",
  });

  const otpCode = watch("otpCode");
  
  // Check if OTP is complete (4 digits)
  const isOtpComplete = otpCode && otpCode.length === 4;

  // Auto-focus first input on mount and clear OTP if coming from method selection
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Clear OTP input when component mounts (fresh start)
    if (currentStep === 2) {
      reset({ otpCode: '' });
      actions.updateStep3Data({ otpCode: '' });
    }
  }, [currentStep, reset, actions]);

  // Handle OTP input changes and auto-focus
  const handleOtpChange = (index: number, value: string) => {
    const newValue = value.replace(/[^0-9]/g, '');
    
    if (newValue.length <= 1) {
      const currentOtp = otpCode || '';
      const otpArray = currentOtp.split('');
      otpArray[index] = newValue;
      const newOtp = otpArray.join('').slice(0, 4);
      
      setValue('otpCode', newOtp);
      actions.updateStep3Data({ otpCode: newOtp });
      
      // Auto-focus next input
      if (newValue && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode?.[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: Step3FormData) => {
    // Clear previous errors
    actions.clearApiErrors();
    
    // Update store with form data
    actions.updateStep3Data(data);
    
    // Prepare verification request
    const verificationData = {
      otp: data.otpCode,
      userData: {
        firstName: step1Data.firstName || '',
        lastName: step1Data.lastName || '',
        gender: step1Data.gender || '',
        country: step1Data.country || '',
        email: step1Data.email || '',
        phone: step1Data.phone || '',
        agreed: step1Data.agreed || false,
      },
    };

    try {
      await verifyOtpMutation.mutateAsync(verificationData);
      // Success handling is done in the mutation hook
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('OTP verification failed:', error);
    }
  };

  const handleResendOtp = () => {
    const requestData = {
      method: selectedOtpMethod || 'email',
      email: selectedOtpMethod === 'email' ? step1Data.email : undefined,
      phone: selectedOtpMethod === 'phone' ? step1Data.phone : undefined,
    };

    // Clear current OTP input but keep otpRequested true
    reset({ otpCode: '' });
    actions.updateStep3Data({ otpCode: '' });
    actions.clearApiErrors();
    
    // Resend OTP without changing step
    resendOtpMutation.resendOtp(requestData);
  };

  const handleBack = () => {
    // Clear OTP input and reset form
    reset({ otpCode: '' });
    actions.updateStep3Data({ otpCode: '' });
    
    // Reset API states to show method selection again
    actions.setOtpRequested(false);
    actions.clearApiErrors();
    
    // Stay on step 2 but show method selection
  };

  const getContactDisplay = () => {
    if (selectedOtpMethod === 'email') {
      return step1Data.email || '';
    } else if (selectedOtpMethod === 'phone') {
      return step1Data.phone || '';
    }
    return '';
  };

  if (currentStep !== 2 && currentStep !== 3) return null;

  // Show success state if user is registered
  if (userRegistered) {
    return (
      <div className="max-w-3xl mx-auto p-8 rounded-md" data-testid="otp-success-state">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" data-testid="success-icon" />
          <h1 className="text-4xl font-serif mb-4 text-[#1A1A1A]">Registration Complete!</h1>
          <p className="text-gray-600 text-lg mb-6">
            Your account has been successfully created and verified.
          </p>
          <Button
            onClick={() => actions.resetStore()}
            className="bg-[#006F5F] hover:bg-[#005a4d] text-white px-12 py-3 h-auto text-lg uppercase"
            data-testid="continue-button"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 rounded-md" data-testid="otp-verification">
      {/* Header */}
      <RegistrationHeader />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" data-testid="otp-verification-form">
        {/* OTP Verification Section */}
        <div>
          <h2 className="text-2xl font-medium mb-4 text-[#1A1A1A]">OTP Verification</h2>
          <hr className="border-t border-gray-300 mb-8" />
          
          {/* Please check your email section */}
          <div className="text-center mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium mb-4 text-[#1A1A1A]">Please check your email.</h3>
            <p className="text-gray-600 mb-6" data-testid="contact-display">
              We&apos;ve sent a code to {getContactDisplay()}
            </p>
            
            {/* OTP Input */}
            <Controller
              name="otpCode"
              control={control}
              render={() => (
                <div className="space-y-4">
                  <div className="flex justify-center gap-4" data-testid="otp-input-container">
                    {[0, 1, 2, 3].map((index) => (
                      <Input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpCode?.[index] || ''}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={cn(
                          "w-20 h-20 text-center text-[45px] sm:text-[45px] md:text-[45px] font-bold border-2 rounded-lg",
                          "focus:border-[#5A3A27] focus:ring-[#5A3A27] focus:ring-2",
                          "border-[#5A3A27] text-[#5A3A27]",
                          errors.otpCode && "border-red-500"
                        )}
                        data-testid={`otp-input-${index}`}
                      />
                    ))}
                  </div>
                  {(errors.otpCode || apiErrors.verify) && (
                    <p className="text-red-500 text-sm text-center" data-testid="otp-error-message">
                      {errors.otpCode?.message || apiErrors.verify}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Resend Link */}
            <div className="mt-6">
              <p className="text-gray-600 text-sm">
                Didn&apos;t get a code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendOtpMutation.isResending}
                  className="underline font-medium"
                  data-testid="resend-otp-button"
                >
                  {resendOtpMutation.isResending ? 'Sending...' : 'Click to resend.'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-10 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="px-16 py-5 h-auto text-lg uppercase border-[#006F5F] text-[#006F5F] hover:bg-[#006F5F]/10 hover:border-[#006F5F] rounded-[4px] transition-colors duration-200 flex-1"
            disabled={isLoading || verifyOtpMutation.isPending}
            data-testid="back-button"
          >
            Back
          </Button>
          
          <Button
            type="submit"
            className="bg-[#006F5F] hover:bg-[#005a4d] text-white px-16 py-5 h-auto text-lg uppercase transition-colors duration-200 rounded-[4px] flex-1"
            disabled={!isOtpComplete || isLoading || verifyOtpMutation.isPending}
            data-testid="verify-otp-button"
          >
            {verifyOtpMutation.isPending ? 'Verifying...' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  );
}; 