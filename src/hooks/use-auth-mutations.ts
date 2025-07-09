import { useMutation } from '@tanstack/react-query';
import { useSignupActions } from '@/store/signup-store';
import { requestOtp, verifyOtpAndRegister, ApiError } from '@/lib/api';
import type { RequestOtpRequest } from '@/lib/api';

// Hook for requesting OTP
export const useRequestOtp = () => {
  const actions = useSignupActions();

  return useMutation({
    mutationFn: requestOtp,
    onMutate: (variables: RequestOtpRequest) => {
      // Clear previous errors
      actions.clearApiErrors();
      
      // Set loading state
      actions.setLoadingState('requestingOtp', true);
      
      // Store the selected OTP method
      actions.setSelectedOtpMethod(variables.method);
      
      // Reset verification state (keep otpRequested as is for resend)
      actions.setOtpVerified(false);
    },
    onSuccess: (data) => {
      // Update store with success
      actions.setOtpRequested(true);
      actions.setLoadingState('requestingOtp', false);
      
      // Set timestamp for resend logic
      actions.setOtpRequestTimestamp(Date.now());
      
      console.log('OTP request successful:', data);
    },
    onError: (error: Error) => {
      // Handle errors
      actions.setLoadingState('requestingOtp', false);
      
      if (error instanceof ApiError) {
        // Show user-friendly error message
        actions.setApiError('otp', error.message);
        
        // Log detailed error for debugging
        console.error('OTP request failed - API Error:', {
          message: error.message,
          status: error.status,
          errorCode: error.errorCode
        });
      } else {
        // Generic error for UI
        actions.setApiError('otp', 'Failed to request OTP. Please try again.');
        
        // Log full error for debugging
        console.error('OTP request failed - Unknown Error:', error);
      }
    },
    onSettled: () => {
      // Always reset loading state
      actions.setLoadingState('requestingOtp', false);
    },
  });
};

// Hook for verifying OTP and registering user
export const useVerifyOtpAndRegister = () => {
  const actions = useSignupActions();

  return useMutation({
    mutationFn: verifyOtpAndRegister,
    onMutate: () => {
      // Clear previous errors
      actions.clearApiErrors();
      
      // Set loading states
      actions.setLoadingState('verifyingOtp', true);
      actions.setLoadingState('registeringUser', true);
      
      // Reset verification states
      actions.setOtpVerified(false);
      actions.setUserRegistered(false);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Update store with success
        actions.setOtpVerified(true);
        actions.setUserRegistered(true);
        
        // Set submit status to success
        actions.setSubmitStatus('success');
        
        // Navigate to step 3 (success page)
        actions.setStep(3);
        
        // Navigate to success page (step 4)
        actions.setStep(4);
        
        console.log('OTP verification and registration successful:', data);
      } else {
        // Handle unexpected success response without success flag
        actions.setApiError('verify', data.message || 'Verification failed');
        actions.setSubmitStatus('error');
      }
      
      // Reset loading states
      actions.setLoadingState('verifyingOtp', false);
      actions.setLoadingState('registeringUser', false);
    },
    onError: (error: Error) => {
      // Handle errors
      actions.setLoadingState('verifyingOtp', false);
      actions.setLoadingState('registeringUser', false);
      actions.setSubmitStatus('error');
      
      if (error instanceof ApiError) {
        // Provide user-friendly error messages for UI display
        if (error.errorCode === 'INVALID_OTP') {
          actions.setApiError('verify', 'Invalid OTP code. Please check and try again.');
        } else if (error.status === 400) {
          actions.setApiError('verify', 'Invalid OTP code. Please try again.');
        } else {
          actions.setApiError('verify', error.message);
        }
        
        // Log detailed error for debugging
        console.error('OTP verification failed - API Error:', {
          message: error.message,
          status: error.status,
          errorCode: error.errorCode
        });
      } else {
        // Generic error for UI
        actions.setApiError('verify', 'Verification failed. Please try again.');
        
        // Log full error for debugging
        console.error('OTP verification failed - Unknown Error:', error);
      }
    },
    onSettled: () => {
      // Always reset loading states
      actions.setLoadingState('verifyingOtp', false);
      actions.setLoadingState('registeringUser', false);
    },
  });
};

// Hook for resending OTP (reuses the request OTP mutation)
export const useResendOtp = () => {
  const requestOtpMutation = useRequestOtp();
  const actions = useSignupActions();
  
  const resendOtp = (data: RequestOtpRequest) => {
    // Reset verification states but keep otpRequested true
    actions.setOtpVerified(false);
    actions.clearApiErrors();
    
    // Trigger the mutation
    requestOtpMutation.mutate(data);
  };
  
  return {
    ...requestOtpMutation,
    resendOtp,
    isResending: requestOtpMutation.isPending,
  };
};



// Custom hook to get mutation states
export const useAuthMutationStates = () => {
  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtpAndRegister();
  
  return {
    // Request OTP states
    isRequestingOtp: requestOtpMutation.isPending,
    requestOtpError: requestOtpMutation.error,
    
    // Verify OTP states
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,
    
    // Combined states
    isAnyMutationPending: requestOtpMutation.isPending || verifyOtpMutation.isPending,
    hasAnyError: !!requestOtpMutation.error || !!verifyOtpMutation.error,
    
    // Reset functions
    resetRequestOtp: requestOtpMutation.reset,
    resetVerifyOtp: verifyOtpMutation.reset,
  };
}; 