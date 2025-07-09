import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Step1FormData, Step2FormData, Step3FormData } from '@/lib/validation';

// Environment configuration interface
interface EnvironmentConfig {
  apiBaseUrl: string;
  isProduction: boolean;
}

// Navigation slice interface
interface NavigationSlice {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoBack: boolean;
}

// Data slice interface
interface DataSlice {
  step1Data: Partial<Step1FormData>;
  step2Data: Partial<Step2FormData>;
  step3Data: Partial<Step3FormData>;
}

// UI slice interface
interface UISlice {
  isLoading: boolean;
  errors: Record<string, string>;
  submitStatus: 'idle' | 'pending' | 'success' | 'error';
  apiErrors: Record<string, string>;
  loadingStates: {
    requestingOtp: boolean;
    verifyingOtp: boolean;
    registeringUser: boolean;
  };
}

// API States slice interface
interface ApiStatesSlice {
  otpRequested: boolean;
  otpVerified: boolean;
  userRegistered: boolean;
  selectedOtpMethod: 'email' | 'phone' | null;
  otpRequestTimestamp: number | null;
  canResendOtp: boolean;
}

// Actions interface
interface SignupActions {
  // Navigation actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetNavigation: () => void;
  updateCanGoNext: (canGo: boolean) => void;
  updateCanGoBack: (canGo: boolean) => void;

  // Data actions
  updateStep1Data: (data: Partial<Step1FormData>) => void;
  updateStep2Data: (data: Partial<Step2FormData>) => void;
  updateStep3Data: (data: Partial<Step3FormData>) => void;
  clearFormData: () => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (key: string, message: string) => void;
  clearErrors: () => void;
  clearError: (key: string) => void;
  setSubmitStatus: (status: 'idle' | 'pending' | 'success' | 'error') => void;
  setApiError: (key: string, message: string) => void;
  clearApiErrors: () => void;
  setLoadingState: (key: 'requestingOtp' | 'verifyingOtp' | 'registeringUser', loading: boolean) => void;

  // API State actions
  setOtpRequested: (requested: boolean) => void;
  setOtpVerified: (verified: boolean) => void;
  setUserRegistered: (registered: boolean) => void;
  setSelectedOtpMethod: (method: 'email' | 'phone' | null) => void;
  setOtpRequestTimestamp: (timestamp: number | null) => void;
  updateCanResendOtp: () => void;
  resetApiStates: () => void;

  // Environment actions
  setApiBaseUrl: (url: string) => void;
  getApiUrl: (endpoint: string) => string;

  // Reset functionality
  resetStore: () => void;
}

// Complete store interface
interface SignupStore {
  navigation: NavigationSlice;
  data: DataSlice;
  ui: UISlice;
  apiStates: ApiStatesSlice;
  environment: EnvironmentConfig;
  actions: SignupActions;
}

// Initial state values
const initialNavigationState: NavigationSlice = {
  currentStep: 1,
  totalSteps: 3,
  canGoNext: false,
  canGoBack: false,
};

const initialDataState: DataSlice = {
  step1Data: {},
  step2Data: {},
  step3Data: {},
};

const initialUIState: UISlice = {
  isLoading: false,
  errors: {},
  submitStatus: 'idle',
  apiErrors: {},
  loadingStates: {
    requestingOtp: false,
    verifyingOtp: false,
    registeringUser: false,
  },
};

const initialApiStatesState: ApiStatesSlice = {
  otpRequested: false,
  otpVerified: false,
  userRegistered: false,
  selectedOtpMethod: null,
  otpRequestTimestamp: null,
  canResendOtp: false,
};

const initialEnvironmentState: EnvironmentConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://demo3975834.mockable.io',
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
};

// Create the Zustand store with middleware
export const useSignupStore = create<SignupStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State slices
        navigation: initialNavigationState,
        data: initialDataState,
        ui: initialUIState,
        apiStates: initialApiStatesState,
        environment: initialEnvironmentState,

        // Actions
        actions: {
          // Navigation actions
          setStep: (step: number) => {
            set((state) => {
              state.navigation.currentStep = Math.max(1, Math.min(step, state.navigation.totalSteps));
              state.navigation.canGoBack = state.navigation.currentStep > 1;
              // canGoNext is managed separately based on form validation
            });
          },

          nextStep: () => {
            set((state) => {
              if (state.navigation.canGoNext && state.navigation.currentStep < state.navigation.totalSteps) {
                state.navigation.currentStep += 1;
                state.navigation.canGoBack = true;
                state.navigation.canGoNext = false; // Reset until form is validated
              }
            });
          },

          prevStep: () => {
            set((state) => {
              if (state.navigation.currentStep > 1) {
                state.navigation.currentStep -= 1;
                state.navigation.canGoBack = state.navigation.currentStep > 1;
                state.navigation.canGoNext = true; // Previous steps are assumed valid
              }
            });
          },

          resetNavigation: () => {
            set((state) => {
              state.navigation = { ...initialNavigationState };
            });
          },

          updateCanGoNext: (canGo: boolean) => {
            set((state) => {
              state.navigation.canGoNext = canGo;
            });
          },

          updateCanGoBack: (canGo: boolean) => {
            set((state) => {
              state.navigation.canGoBack = canGo;
            });
          },

          // Data actions
          updateStep1Data: (data: Partial<Step1FormData>) => {
            set((state) => {
              state.data.step1Data = { ...state.data.step1Data, ...data };
            });
          },

          updateStep2Data: (data: Partial<Step2FormData>) => {
            set((state) => {
              state.data.step2Data = { ...state.data.step2Data, ...data };
            });
          },

          updateStep3Data: (data: Partial<Step3FormData>) => {
            set((state) => {
              state.data.step3Data = { ...state.data.step3Data, ...data };
            });
          },

          clearFormData: () => {
            set((state) => {
              state.data = { ...initialDataState };
            });
          },

          // UI actions
          setLoading: (loading: boolean) => {
            set((state) => {
              state.ui.isLoading = loading;
            });
          },

          setError: (key: string, message: string) => {
            set((state) => {
              state.ui.errors[key] = message;
            });
          },

          clearErrors: () => {
            set((state) => {
              state.ui.errors = {};
            });
          },

          clearError: (key: string) => {
            set((state) => {
              delete state.ui.errors[key];
            });
          },

          setSubmitStatus: (status: 'idle' | 'pending' | 'success' | 'error') => {
            set((state) => {
              state.ui.submitStatus = status;
            });
          },

          setApiError: (key: string, message: string) => {
            set((state) => {
              state.ui.apiErrors[key] = message;
            });
          },

          clearApiErrors: () => {
            set((state) => {
              state.ui.apiErrors = {};
            });
          },

          setLoadingState: (key: 'requestingOtp' | 'verifyingOtp' | 'registeringUser', loading: boolean) => {
            set((state) => {
              state.ui.loadingStates[key] = loading;
            });
          },

          // API State actions
          setOtpRequested: (requested: boolean) => {
            set((state) => {
              state.apiStates.otpRequested = requested;
              if (requested) {
                state.apiStates.otpRequestTimestamp = Date.now();
                state.apiStates.canResendOtp = false;
              }
            });
          },

          setOtpVerified: (verified: boolean) => {
            set((state) => {
              state.apiStates.otpVerified = verified;
            });
          },

          setUserRegistered: (registered: boolean) => {
            set((state) => {
              state.apiStates.userRegistered = registered;
            });
          },

          setSelectedOtpMethod: (method: 'email' | 'phone' | null) => {
            set((state) => {
              state.apiStates.selectedOtpMethod = method;
            });
          },

          setOtpRequestTimestamp: (timestamp: number | null) => {
            set((state) => {
              state.apiStates.otpRequestTimestamp = timestamp;
            });
          },

          updateCanResendOtp: () => {
            set((state) => {
              const { otpRequestTimestamp } = state.apiStates;
              if (otpRequestTimestamp) {
                // Allow resend after 60 seconds
                const canResend = Date.now() - otpRequestTimestamp > 60000;
                state.apiStates.canResendOtp = canResend;
              }
            });
          },

          resetApiStates: () => {
            set((state) => {
              state.apiStates = { ...initialApiStatesState };
            });
          },



          // Environment actions
          setApiBaseUrl: (url: string) => {
            set((state) => {
              state.environment.apiBaseUrl = url;
            });
          },

          getApiUrl: (endpoint: string) => {
            const { environment } = get();
            return `${environment.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
          },

          // Reset functionality
          resetStore: () => {
            set((state) => {
              state.navigation = { ...initialNavigationState };
              state.data = { ...initialDataState };
              state.ui = { ...initialUIState };
              state.apiStates = { ...initialApiStatesState };
              // Don't reset environment config
            });
          },
        },
      })),
      {
        name: 'signup-store',
        partialize: (state) => ({
          // Only persist navigation, data, and API states (including timer)
          navigation: state.navigation,
          data: state.data,
          apiStates: state.apiStates,
        }),
        version: 1,
      }
    ),
    {
      name: 'signup-store',
    }
  )
);

// Selectors for optimized state access
export const useNavigationState = () => useSignupStore((state) => state.navigation);
export const useDataState = () => useSignupStore((state) => state.data);
export const useUIState = () => useSignupStore((state) => state.ui);
export const useApiStatesState = () => useSignupStore((state) => state.apiStates);
export const useEnvironmentState = () => useSignupStore((state) => state.environment);
export const useSignupActions = () => useSignupStore((state) => state.actions);

// Computed selectors
export const useCurrentStepData = () => {
  return useSignupStore((state) => {
    switch (state.navigation.currentStep) {
      case 1:
        return state.data.step1Data;
      case 2:
        return state.data.step2Data;
      case 3:
        return state.data.step3Data;
      default:
        return {};
    }
  });
};

export const useIsStepComplete = (step: number) => {
  return useSignupStore((state) => {
    switch (step) {
      case 1:
        return Object.keys(state.data.step1Data).length > 0;
      case 2:
        return Object.keys(state.data.step2Data).length > 0;
      case 3:
        return Object.keys(state.data.step3Data).length > 0;
      default:
        return false;
    }
  });
};

export const useFormProgress = () => {
  return useSignupStore((state) => {
    const completedSteps = [
      Object.keys(state.data.step1Data).length > 0,
      Object.keys(state.data.step2Data).length > 0,
      Object.keys(state.data.step3Data).length > 0,
    ].filter(Boolean).length;
    
    return {
      completedSteps,
      totalSteps: state.navigation.totalSteps,
      progress: (completedSteps / state.navigation.totalSteps) * 100,
    };
  });
};

export const useHasErrors = () => {
  return useSignupStore((state) => 
    Object.keys(state.ui.errors).length > 0 || Object.keys(state.ui.apiErrors).length > 0
  );
};

export const useIsSubmitting = () => {
  return useSignupStore((state) => 
    state.ui.isLoading || state.ui.submitStatus === 'pending'
  );
};

// New API state selectors
export const useIsAnyLoading = () => {
  return useSignupStore((state) => {
    const { loadingStates } = state.ui;
    return loadingStates.requestingOtp || loadingStates.verifyingOtp || loadingStates.registeringUser;
  });
};

export const useCanResendOtp = () => {
  return useSignupStore((state) => {
    const { otpRequestTimestamp, canResendOtp } = state.apiStates;
    if (!otpRequestTimestamp) return true;
    
    // Allow immediate resend for demo purposes
    return canResendOtp;
  });
};

export const useSelectedContactInfo = () => {
  return useSignupStore((state) => {
    const { selectedOtpMethod } = state.apiStates;
    const { step1Data } = state.data;
    
    if (selectedOtpMethod === 'email') {
      return { method: 'email', value: step1Data.email || '' };
    } else if (selectedOtpMethod === 'phone') {
      return { method: 'phone', value: step1Data.phone || '' };
    }
    
    return { method: null, value: '' };
  });
};

export const useRegistrationProgress = () => {
  return useSignupStore((state) => {
    const { otpRequested, otpVerified, userRegistered } = state.apiStates;
    const { currentStep } = state.navigation;
    
    return {
      currentStep,
      formCompleted: currentStep === 3,
      otpRequested,
      otpVerified,
      userRegistered,
      isComplete: userRegistered,
    };
  });
};

// Type exports for external use
export type { SignupStore, NavigationSlice, DataSlice, UISlice, ApiStatesSlice, SignupActions }; 