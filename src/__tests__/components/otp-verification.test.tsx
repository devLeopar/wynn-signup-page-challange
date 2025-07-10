/* eslint-disable */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OtpVerification } from '@/components/otp-verification';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockStore = {
  navigation: { currentStep: 2 },
  data: {
    step1Data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      gender: 'male',
      country: 'US',
      agreed: true,
    },
    step3Data: { otpCode: '' },
  },
  apiStates: {
    selectedOtpMethod: 'email',
    userRegistered: false,
    otpRequested: true,
  },
  ui: {
    isLoading: false,
    apiErrors: {},
  },
  actions: {
    updateStep3Data: vi.fn(),
    clearApiErrors: vi.fn(),
    setOtpRequested: vi.fn(),
    resetStore: vi.fn(),
  },
};

// Mock the store
vi.mock('@/store/signup-store', () => ({
  useSignupStore: vi.fn(() => mockStore.navigation),
  useSignupActions: vi.fn(() => mockStore.actions),
  useDataState: vi.fn(() => mockStore.data),
  useApiStatesState: vi.fn(() => mockStore.apiStates),
  useUIState: vi.fn(() => mockStore.ui),
}));

// Mock auth mutations
const mockVerifyOtpMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockResendOtpMutation = {
  resendOtp: vi.fn(),
  isResending: false,
};

vi.mock('@/hooks/use-auth-mutations', () => ({
  useVerifyOtpAndRegister: vi.fn(() => mockVerifyOtpMutation),
  useResendOtp: vi.fn(() => mockResendOtpMutation),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  CheckCircle: vi.fn(({ className, ...props }) => (
    <div className={className} {...props} data-testid="check-circle-icon">
      CheckCircle
    </div>
  )),
}));

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('OtpVerification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to default state
    mockStore.navigation.currentStep = 2;
    mockStore.apiStates.userRegistered = false;
    mockStore.apiStates.selectedOtpMethod = 'email';
    mockStore.ui.apiErrors = {};
    mockStore.ui.isLoading = false;
    mockVerifyOtpMutation.isPending = false;
    mockResendOtpMutation.isResending = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Component Rendering Tests
  describe('Component Rendering', () => {
    it('should render OTP verification form on step 2', () => {
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.getByTestId('otp-verification')).toBeInTheDocument();
      expect(screen.getByTestId('otp-verification-form')).toBeInTheDocument();
      expect(screen.getByText('OTP Verification')).toBeInTheDocument();
    });

    it('should render contact display with email when email method selected', () => {
      renderWithQueryClient(<OtpVerification />);
      
      const contactDisplay = screen.getByTestId('contact-display');
      expect(contactDisplay).toHaveTextContent('john@example.com');
    });

    it('should render contact display with phone when phone method selected', () => {
      mockStore.apiStates.selectedOtpMethod = 'phone';
      renderWithQueryClient(<OtpVerification />);
      
      const contactDisplay = screen.getByTestId('contact-display');
      expect(contactDisplay).toHaveTextContent('+1234567890');
    });

    it('should render all 4 OTP input fields', () => {
      renderWithQueryClient(<OtpVerification />);
      
      for (let i = 0; i < 4; i++) {
        expect(screen.getByTestId(`otp-input-${i}`)).toBeInTheDocument();
      }
    });

    it('should not render when not on step 2 or 3', () => {
      mockStore.navigation.currentStep = 1;
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.queryByTestId('otp-verification')).not.toBeInTheDocument();
    });
  });

  // Success State Tests
  describe('Success State', () => {
    beforeEach(() => {
      mockStore.apiStates.userRegistered = true;
    });

    it('should render success state when user is registered', () => {
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.getByTestId('otp-success-state')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('Registration Complete!')).toBeInTheDocument();
    });

    it('should call resetStore when continue button is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const continueButton = screen.getByTestId('continue-button');
      await user.click(continueButton);
      
      expect(mockStore.actions.resetStore).toHaveBeenCalled();
    });

    it('should not render OTP form when in success state', () => {
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.queryByTestId('otp-verification-form')).not.toBeInTheDocument();
    });
  });

  // OTP Input Tests
  describe('OTP Input Functionality', () => {
    it('should handle single digit input correctly', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const firstInput = screen.getByTestId('otp-input-0');
      await user.type(firstInput, '1');
      
      expect(mockStore.actions.updateStep3Data).toHaveBeenCalledWith({ otpCode: '1' });
    });

    it('should auto-focus next input after entering digit', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const firstInput = screen.getByTestId('otp-input-0');
      const secondInput = screen.getByTestId('otp-input-1');
      
      await user.type(firstInput, '1');
      
      expect(secondInput).toHaveFocus();
    });

    it('should handle backspace navigation correctly', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const secondInput = screen.getByTestId('otp-input-1');
      await user.click(secondInput);
      await user.keyboard('{Backspace}');
      
      const firstInput = screen.getByTestId('otp-input-0');
      expect(firstInput).toHaveFocus();
    });

    it('should only allow numeric input', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const firstInput = screen.getByTestId('otp-input-0');
      await user.type(firstInput, 'a');
      
      expect(mockStore.actions.updateStep3Data).toHaveBeenCalledWith({ otpCode: '' });
    });

    it('should limit input to 4 digits', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const firstInput = screen.getByTestId('otp-input-0');
      await user.type(firstInput, '12345');
      
      // Should only take the first digit
      expect(mockStore.actions.updateStep3Data).toHaveBeenCalledWith({ otpCode: '1' });
    });
  });

  // Form Validation Tests
  describe('Form Validation', () => {
    it('should disable verify button when OTP is incomplete', () => {
      renderWithQueryClient(<OtpVerification />);
      
      const verifyButton = screen.getByTestId('verify-otp-button');
      expect(verifyButton).toBeDisabled();
    });

    it('should disable verify button when OTP is incomplete', () => {
      renderWithQueryClient(<OtpVerification />);
      
      const verifyButton = screen.getByTestId('verify-otp-button');
      expect(verifyButton).toBeDisabled();
    });

    it('should display error message when validation fails', () => {
      mockStore.ui.apiErrors = { verify: 'Invalid OTP code' };
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.getByTestId('otp-error-message')).toHaveTextContent('Invalid OTP code');
    });
  });

  // Form Submission Tests
  describe('Form Submission', () => {
    it('should show loading state during verification', () => {
      mockVerifyOtpMutation.isPending = true;
      renderWithQueryClient(<OtpVerification />);
      
      const verifyButton = screen.getByTestId('verify-otp-button');
      expect(verifyButton).toHaveTextContent('Verifying...');
      expect(verifyButton).toBeDisabled();
    });

    it('should disable verify button when no OTP is entered', () => {
      renderWithQueryClient(<OtpVerification />);
      
      const verifyButton = screen.getByTestId('verify-otp-button');
      expect(verifyButton).toBeDisabled();
    });
  });

  // Resend OTP Tests
  describe('Resend OTP Functionality', () => {
    it('should render resend button', () => {
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.getByTestId('resend-otp-button')).toBeInTheDocument();
    });

    it('should call resendOtp with email method', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const resendButton = screen.getByTestId('resend-otp-button');
      await user.click(resendButton);
      
      expect(mockResendOtpMutation.resendOtp).toHaveBeenCalledWith({
        method: 'email',
        email: 'john@example.com',
        phone: undefined,
      });
    });

    it('should call resendOtp with phone method', async () => {
      const user = userEvent.setup();
      mockStore.apiStates.selectedOtpMethod = 'phone';
      renderWithQueryClient(<OtpVerification />);
      
      const resendButton = screen.getByTestId('resend-otp-button');
      await user.click(resendButton);
      
      expect(mockResendOtpMutation.resendOtp).toHaveBeenCalledWith({
        method: 'phone',
        email: undefined,
        phone: '+1234567890',
      });
    });

    it('should show loading state during resend', () => {
      mockResendOtpMutation.isResending = true;
      renderWithQueryClient(<OtpVerification />);
      
      const resendButton = screen.getByTestId('resend-otp-button');
      expect(resendButton).toHaveTextContent('Sending...');
      expect(resendButton).toBeDisabled();
    });

    it('should clear OTP input and errors when resending', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const resendButton = screen.getByTestId('resend-otp-button');
      await user.click(resendButton);
      
      expect(mockStore.actions.updateStep3Data).toHaveBeenCalledWith({ otpCode: '' });
      expect(mockStore.actions.clearApiErrors).toHaveBeenCalled();
    });
  });

  // Navigation Tests
  describe('Navigation', () => {
    it('should render back button', () => {
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('should handle back navigation correctly', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const backButton = screen.getByTestId('back-button');
      await user.click(backButton);
      
      expect(mockStore.actions.updateStep3Data).toHaveBeenCalledWith({ otpCode: '' });
      expect(mockStore.actions.setOtpRequested).toHaveBeenCalledWith(false);
      expect(mockStore.actions.clearApiErrors).toHaveBeenCalled();
    });

    it('should disable back button during loading', () => {
      mockStore.ui.isLoading = true;
      renderWithQueryClient(<OtpVerification />);
      
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeDisabled();
    });

    it('should disable back button during verification', () => {
      mockVerifyOtpMutation.isPending = true;
      renderWithQueryClient(<OtpVerification />);
      
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeDisabled();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper input attributes for OTP fields', () => {
      renderWithQueryClient(<OtpVerification />);
      
      const firstInput = screen.getByTestId('otp-input-0');
      expect(firstInput).toHaveAttribute('type', 'text');
      expect(firstInput).toHaveAttribute('inputMode', 'numeric');
      expect(firstInput).toHaveAttribute('maxLength', '1');
    });

    it('should focus first input on mount', () => {
      renderWithQueryClient(<OtpVerification />);
      
      const firstInput = screen.getByTestId('otp-input-0');
      expect(firstInput).toHaveFocus();
    });

    it('should have proper button states for screen readers', () => {
      renderWithQueryClient(<OtpVerification />);
      
      const verifyButton = screen.getByTestId('verify-otp-button');
      const backButton = screen.getByTestId('back-button');
      
      expect(verifyButton).toHaveAttribute('type', 'submit');
      expect(backButton).toHaveAttribute('type', 'button');
    });

    it('should have proper error message association', () => {
      mockStore.ui.apiErrors = { verify: 'Invalid OTP' };
      renderWithQueryClient(<OtpVerification />);
      
      const errorMessage = screen.getByTestId('otp-error-message');
      expect(errorMessage).toHaveTextContent('Invalid OTP');
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should display API verification errors', () => {
      mockStore.ui.apiErrors = { verify: 'OTP verification failed' };
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.getByTestId('otp-error-message')).toHaveTextContent('OTP verification failed');
    });

    it('should handle API errors gracefully', () => {
      mockStore.ui.apiErrors = { verify: 'Network error occurred' };
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.getByTestId('otp-error-message')).toHaveTextContent('Network error occurred');
    });

    it('should display error message when API error exists', () => {
      mockStore.ui.apiErrors = { verify: 'Invalid OTP' };
      renderWithQueryClient(<OtpVerification />);
      
      expect(screen.getByTestId('otp-error-message')).toHaveTextContent('Invalid OTP');
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should not cause unnecessary re-renders during input', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const firstInput = screen.getByTestId('otp-input-0');
      
      // Clear previous calls
      mockStore.actions.updateStep3Data.mockClear();
      
      await user.type(firstInput, '1');
      
      // Should only call once for the valid input
      expect(mockStore.actions.updateStep3Data).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid input changes efficiently', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<OtpVerification />);
      
      const firstInput = screen.getByTestId('otp-input-0');
      
      // Rapid typing simulation
      await user.type(firstInput, '123');
      
      // Should handle all inputs efficiently
      expect(mockStore.actions.updateStep3Data).toHaveBeenCalled();
    });
  });
}); 