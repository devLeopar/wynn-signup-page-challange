import { useMutation } from '@tanstack/react-query';
import { useSignupActions, useApiStatesState } from '@/store/signup-store';
import { requestOtp, verifyOtpAndRegister, ApiError } from '@/lib/api';
import type { RequestOtpRequest } from '@/lib/api';
import { useEffect } from 'react';

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
      
      // Reset OTP states
      actions.setOtpRequested(false);
      actions.setOtpVerified(false);
    },
    onSuccess: (data) => {
      // Update store with success
      actions.setOtpRequested(true);
      actions.setLoadingState('requestingOtp', false);
      
      // Start 60-second timer
      actions.startOtpTimer();
      
      console.log('OTP request successful:', data);
    },
    onError: (error: Error) => {
      // Handle errors
      actions.setLoadingState('requestingOtp', false);
      
      if (error instanceof ApiError) {
        actions.setApiError('otp', error.message);
      } else {
        actions.setApiError('otp', 'Failed to request OTP. Please try again.');
      }
      
      console.error('OTP request failed:', error);
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
        // Provide user-friendly error messages
        if (error.errorCode === 'INVALID_OTP') {
          actions.setApiError('verify', 'Invalid OTP code. Please check and try again.');
        } else if (error.status === 400) {
          actions.setApiError('verify', 'Invalid OTP code. Please try again.');
        } else {
          actions.setApiError('verify', error.message);
        }
      } else {
        actions.setApiError('verify', 'Verification failed. Please try again.');
      }
      
      console.error('OTP verification failed:', error);
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
    // Reset OTP states before resending
    actions.setOtpRequested(false);
    actions.setOtpVerified(false);
    actions.clearApiErrors();
    actions.stopOtpTimer();
    
    // Trigger the mutation
    requestOtpMutation.mutate(data);
  };
  
  return {
    ...requestOtpMutation,
    resendOtp,
    isResending: requestOtpMutation.isPending,
  };
};

// Custom hook for OTP countdown timer (60 seconds)
export const useOtpTimer = () => {
  const apiStates = useApiStatesState();
  const actions = useSignupActions();

  // Countdown logic - runs when timer is active
  useEffect(() => {
    if (!apiStates.otpTimerActive || apiStates.otpTimeLeft <= 0) return;

    const interval = setInterval(() => {
      const newTimeLeft = apiStates.otpTimeLeft - 1;
      actions.setOtpTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        actions.setOtpTimerActive(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [apiStates.otpTimerActive, apiStates.otpTimeLeft, actions]);

  return {
    timeLeft: apiStates.otpTimeLeft,
    isActive: apiStates.otpTimerActive,
    canResend: apiStates.canResendOtp,
    formatTime: () => {
      const minutes = Math.floor(apiStates.otpTimeLeft / 60);
      const seconds = apiStates.otpTimeLeft % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
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