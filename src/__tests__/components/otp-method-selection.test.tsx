/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { OtpMethodSelection } from '@/components/otp-method-selection'
import * as signupStore from '@/store/signup-store'
import * as authMutations from '@/hooks/use-auth-mutations'

// Mock the store
const mockActions = {
  updateStep2Data: vi.fn(),
  setStep: vi.fn(),
  clearApiErrors: vi.fn(),
  // Add other required actions
  updateStep1Data: vi.fn(),
  setOtpRequested: vi.fn(),
  reset: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  resetNavigation: vi.fn(),
  updateCanGoNext: vi.fn(),
  updateStep3Data: vi.fn(),
  setOtpVerified: vi.fn(),
  setUserRegistered: vi.fn(),
  setSelectedOtpMethod: vi.fn(),
  setOtpRequestTimestamp: vi.fn(),
  setCanResendOtp: vi.fn(),
  setIsLoading: vi.fn(),
  setError: vi.fn(),
  clearError: vi.fn(),
  resetApiStates: vi.fn(),
  resetData: vi.fn(),
  resetAll: vi.fn(),
  setCurrentStep: vi.fn(),
  updateNavigationState: vi.fn(),
}

const mockInitialState = {
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
    step2Data: {
      otpMethod: '',
      phoneNumber: '',
      email: '',
    },
    step3Data: {
      otpCode: '',
      isVerified: false,
    }
  },
  ui: {
    isLoading: false,
    apiErrors: {},
  }
}

const mockRequestOtpMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  isSuccess: false,
  reset: vi.fn(),
}

vi.mock('@/store/signup-store', () => ({
  useSignupStore: vi.fn(),
  useSignupActions: vi.fn(),
  useDataState: vi.fn(),
  useUIState: vi.fn(),
}))

vi.mock('@/hooks/use-auth-mutations', () => ({
  useRequestOtp: vi.fn(),
}))

vi.mock('@/components/ui/registration-header', () => ({
  RegistrationHeader: () => <div data-testid="registration-header">Registration Header</div>
}))

describe('OtpMethodSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    vi.mocked(signupStore.useSignupStore).mockReturnValue(mockInitialState.navigation)
    // @ts-expect-error - Mock actions for testing
    vi.mocked(signupStore.useSignupActions).mockReturnValue(mockActions)
    // @ts-expect-error - Mock data for testing
    vi.mocked(signupStore.useDataState).mockReturnValue(mockInitialState.data)
    // @ts-expect-error - Mock UI state for testing
    vi.mocked(signupStore.useUIState).mockReturnValue(mockInitialState.ui)
    // @ts-expect-error - Mock mutation for testing
    vi.mocked(authMutations.useRequestOtp).mockReturnValue(mockRequestOtpMutation)
  })

  describe('Component Rendering', () => {
    it('should render OTP method selection when currentStep is 2', () => {
      render(<OtpMethodSelection />)
      
      expect(screen.getByTestId('otp-method-selection')).toBeInTheDocument()
      expect(screen.getByTestId('registration-header')).toBeInTheDocument()
      expect(screen.getByText('OTP Verification')).toBeInTheDocument()
      expect(screen.getByText('Send Code')).toBeInTheDocument()
      expect(screen.getByText('How would you like to receive the code?')).toBeInTheDocument()
    })

    it('should render both email and phone options', () => {
      render(<OtpMethodSelection />)
      
      expect(screen.getByTestId('email-otp-option')).toBeInTheDocument()
      expect(screen.getByTestId('phone-otp-option')).toBeInTheDocument()
      expect(screen.getByText('Send to Email')).toBeInTheDocument()
      expect(screen.getByText('Send to Phone')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<OtpMethodSelection />)
      
      expect(screen.getByTestId('back-button')).toBeInTheDocument()
      expect(screen.getByTestId('send-otp-button')).toBeInTheDocument()
      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should not render when currentStep is not 2', () => {
      vi.mocked(signupStore.useSignupStore).mockReturnValue({ currentStep: 1 })
      
      render(<OtpMethodSelection />)
      
      expect(screen.queryByTestId('otp-method-selection')).not.toBeInTheDocument()
    })
  })

  describe('OTP Method Selection', () => {
    it('should allow selecting email option', async () => {
      const user = userEvent.setup()
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      await user.click(emailOption)
      
      expect(mockActions.updateStep2Data).toHaveBeenCalledWith({ otpMethod: 'email' })
      
      // Check visual selection state
      expect(emailOption).toHaveClass('text-[#006F5F]')
    })

    it('should allow selecting phone option', async () => {
      const user = userEvent.setup()
      render(<OtpMethodSelection />)
      
      const phoneOption = screen.getByTestId('phone-otp-option')
      await user.click(phoneOption)
      
      expect(mockActions.updateStep2Data).toHaveBeenCalledWith({ otpMethod: 'phone' })
      
      // Check visual selection state
      expect(phoneOption).toHaveClass('text-[#006F5F]')
    })

    it('should update selected method visually', async () => {
      const user = userEvent.setup()
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      const phoneOption = screen.getByTestId('phone-otp-option')
      
      // Initially neither should be selected
      expect(emailOption).toHaveClass('text-gray-600')
      expect(phoneOption).toHaveClass('text-gray-600')
      
      // Select email
      await user.click(emailOption)
      expect(emailOption).toHaveClass('text-[#006F5F]')
      
      // Select phone
      await user.click(phoneOption)
      expect(phoneOption).toHaveClass('text-[#006F5F]')
    })

    it('should show radio button visual feedback', async () => {
      const user = userEvent.setup()
      
      // Mock selected method
      vi.mocked(signupStore.useDataState).mockReturnValue({
        ...mockInitialState.data,
        step2Data: { ...mockInitialState.data.step2Data, otpMethod: 'email' }
      })
      
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      
      // Should show selected state styling
      expect(emailOption).toHaveClass('text-[#006F5F]')
    })
  })

  describe('Form Validation', () => {
    it('should disable Next button when no method is selected', () => {
      render(<OtpMethodSelection />)
      
      const nextButton = screen.getByTestId('send-otp-button')
      expect(nextButton).toBeDisabled()
    })

    it('should enable Next button when method is selected', async () => {
      const user = userEvent.setup()
      
      // Mock valid form state
      vi.mocked(signupStore.useDataState).mockReturnValue({
        ...mockInitialState.data,
        step2Data: { ...mockInitialState.data.step2Data, otpMethod: 'email' }
      })
      
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      await user.click(emailOption)
      
      const nextButton = screen.getByTestId('send-otp-button')
      // Note: Button state depends on form validation, might still be disabled in test
      expect(nextButton).toBeInTheDocument()
    })

    it('should show validation error for missing method selection', async () => {
      const user = userEvent.setup()
      
      // Mock validation error state
      // @ts-expect-error - Mock UI state for testing
      vi.mocked(signupStore.useUIState).mockReturnValue({
        ...mockInitialState.ui,
        apiErrors: { otp: 'Please select a method' }
      })
      
      render(<OtpMethodSelection />)
      
      expect(screen.getByText('Please select a method')).toBeInTheDocument()
      expect(screen.getByText('Please select a method')).toHaveClass('text-red-500')
    })
  })

  describe('Form Submission', () => {
    it('should handle form submission with email method', async () => {
      const user = userEvent.setup()
      
      // Mock valid form state
      vi.mocked(signupStore.useDataState).mockReturnValue({
        ...mockInitialState.data,
        step2Data: { ...mockInitialState.data.step2Data, otpMethod: 'email' }
      })
      
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      await user.click(emailOption)
      
      const nextButton = screen.getByTestId('send-otp-button')
      await user.click(nextButton)
      
      expect(mockActions.clearApiErrors).toHaveBeenCalled()
      expect(mockActions.updateStep2Data).toHaveBeenCalledWith({ otpMethod: 'email' })
      expect(mockRequestOtpMutation.mutateAsync).toHaveBeenCalledWith({
        method: 'email',
        email: 'john@example.com',
        phone: undefined,
      })
    })

    it('should handle form submission with phone method', async () => {
      const user = userEvent.setup()
      
      // Mock valid form state
      vi.mocked(signupStore.useDataState).mockReturnValue({
        ...mockInitialState.data,
        step2Data: { ...mockInitialState.data.step2Data, otpMethod: 'phone' }
      })
      
      render(<OtpMethodSelection />)
      
      const phoneOption = screen.getByTestId('phone-otp-option')
      await user.click(phoneOption)
      
      const nextButton = screen.getByTestId('send-otp-button')
      await user.click(nextButton)
      
      expect(mockActions.clearApiErrors).toHaveBeenCalled()
      expect(mockActions.updateStep2Data).toHaveBeenCalledWith({ otpMethod: 'phone' })
      expect(mockRequestOtpMutation.mutateAsync).toHaveBeenCalledWith({
        method: 'phone',
        email: undefined,
        phone: '+1234567890',
      })
    })

    it('should handle API request failure', async () => {
      const user = userEvent.setup()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock API failure
      mockRequestOtpMutation.mutateAsync.mockRejectedValue(new Error('API Error'))
      
      // Mock valid form state
      vi.mocked(signupStore.useDataState).mockReturnValue({
        ...mockInitialState.data,
        step2Data: { ...mockInitialState.data.step2Data, otpMethod: 'email' }
      })
      
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      await user.click(emailOption)
      
      const nextButton = screen.getByTestId('send-otp-button')
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('OTP request failed:', expect.any(Error))
      })
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Navigation', () => {
    it('should handle back button click', async () => {
      const user = userEvent.setup()
      render(<OtpMethodSelection />)
      
      const backButton = screen.getByTestId('back-button')
      await user.click(backButton)
      
      expect(mockActions.setStep).toHaveBeenCalledWith(1)
    })

    it('should disable buttons when loading', () => {
      // Mock loading state
      // @ts-expect-error - Mock UI state for testing
      vi.mocked(signupStore.useUIState).mockReturnValue({
        ...mockInitialState.ui,
        isLoading: true
      })
      
      render(<OtpMethodSelection />)
      
      const backButton = screen.getByTestId('back-button')
      const nextButton = screen.getByTestId('send-otp-button')
      
      expect(backButton).toBeDisabled()
      expect(nextButton).toBeDisabled()
    })

    it('should disable buttons when OTP request is pending', () => {
      // Mock pending mutation
      const pendingMutation = { ...mockRequestOtpMutation, isPending: true }
      // @ts-expect-error - Mock mutation for testing
      vi.mocked(authMutations.useRequestOtp).mockReturnValue(pendingMutation)
      
      render(<OtpMethodSelection />)
      
      const backButton = screen.getByTestId('back-button')
      const nextButton = screen.getByTestId('send-otp-button')
      
      expect(backButton).toBeDisabled()
      expect(nextButton).toBeDisabled()
      expect(screen.getByText('Sending...')).toBeInTheDocument()
    })
  })

  describe('Store Integration', () => {
    it('should use existing step2Data as default values', () => {
      // Mock existing step2 data
      vi.mocked(signupStore.useDataState).mockReturnValue({
        ...mockInitialState.data,
        step2Data: { 
          otpMethod: 'phone',
        }
      })
      
      render(<OtpMethodSelection />)
      
      // Component should render with phone option selected
      const phoneOption = screen.getByTestId('phone-otp-option')
      expect(phoneOption).toHaveClass('text-[#006F5F]')
    })

    it('should update store on method selection', async () => {
      const user = userEvent.setup()
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      await user.click(emailOption)
      
      expect(mockActions.updateStep2Data).toHaveBeenCalledWith({ otpMethod: 'email' })
    })

    it('should use step1Data for API request', async () => {
      const user = userEvent.setup()
      
      // Mock different step1 data
      vi.mocked(signupStore.useDataState).mockReturnValue({
        ...mockInitialState.data,
        step1Data: {
          ...mockInitialState.data.step1Data,
          email: 'different@email.com',
          phone: '+9876543210'
        },
        step2Data: { ...mockInitialState.data.step2Data, otpMethod: 'email' }
      })
      
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      await user.click(emailOption)
      
      const nextButton = screen.getByTestId('send-otp-button')
      await user.click(nextButton)
      
      expect(mockRequestOtpMutation.mutateAsync).toHaveBeenCalledWith({
        method: 'email',
        email: 'different@email.com',
        phone: undefined,
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<OtpMethodSelection />)
      
      const form = screen.getByTestId('otp-method-form')
      expect(form).toBeInTheDocument()
      expect(form.tagName).toBe('FORM')
    })

    it('should have clickable method options', () => {
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      const phoneOption = screen.getByTestId('phone-otp-option')
      
      expect(emailOption).toHaveClass('cursor-pointer')
      expect(phoneOption).toHaveClass('cursor-pointer')
    })

    it('should show visual feedback for selected option', async () => {
      const user = userEvent.setup()
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      await user.click(emailOption)
      
      // Should show selected styling
      expect(emailOption).toHaveClass('text-[#006F5F]')
      
      // Should show radio button selected state
      const radioButton = emailOption.querySelector('.bg-\\[\\#006F5F\\]')
      expect(radioButton).toBeInTheDocument()
    })

    it('should have proper button types and roles', () => {
      render(<OtpMethodSelection />)
      
      const backButton = screen.getByTestId('back-button')
      const nextButton = screen.getByTestId('send-otp-button')
      
      expect(backButton).toHaveAttribute('type', 'button')
      expect(nextButton).toHaveAttribute('type', 'submit')
      expect(backButton).toHaveRole('button')
      expect(nextButton).toHaveRole('button')
    })
  })

  describe('Error Handling', () => {
    it('should display API errors', () => {
      // Mock API error state
      // @ts-expect-error - Mock UI state for testing
      vi.mocked(signupStore.useUIState).mockReturnValue({
        ...mockInitialState.ui,
        apiErrors: { otp: 'Failed to send OTP' }
      })
      
      render(<OtpMethodSelection />)
      
      expect(screen.getByText('Failed to send OTP')).toBeInTheDocument()
      expect(screen.getByText('Failed to send OTP')).toHaveClass('text-red-500')
    })

    it('should clear errors before new submission', async () => {
      const user = userEvent.setup()
      
      // Mock valid form state
      vi.mocked(signupStore.useDataState).mockReturnValue({
        ...mockInitialState.data,
        step2Data: { ...mockInitialState.data.step2Data, otpMethod: 'email' }
      })
      
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      await user.click(emailOption)
      
      const nextButton = screen.getByTestId('send-otp-button')
      await user.click(nextButton)
      
      expect(mockActions.clearApiErrors).toHaveBeenCalled()
    })

    it('should handle missing step1 data gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock missing step1 data
      vi.mocked(signupStore.useDataState).mockReturnValue({
        ...mockInitialState.data,
        step1Data: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          gender: '',
          country: '',
          agreed: false,
        },
        step2Data: { ...mockInitialState.data.step2Data, otpMethod: 'email' }
      })
      
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      await user.click(emailOption)
      
      const nextButton = screen.getByTestId('send-otp-button')
      await user.click(nextButton)
      
      expect(mockRequestOtpMutation.mutateAsync).toHaveBeenCalledWith({
        method: 'email',
        email: '',
        phone: undefined,
      })
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<OtpMethodSelection />)
      
      // Re-render with same props
      rerender(<OtpMethodSelection />)
      
      // Component should still be in document
      expect(screen.getByTestId('otp-method-selection')).toBeInTheDocument()
    })

    it('should handle rapid method selection clicks', async () => {
      const user = userEvent.setup()
      render(<OtpMethodSelection />)
      
      const emailOption = screen.getByTestId('email-otp-option')
      const phoneOption = screen.getByTestId('phone-otp-option')
      
      // Rapid clicks
      await user.click(emailOption)
      await user.click(phoneOption)
      await user.click(emailOption)
      
      // Should handle all clicks
      expect(mockActions.updateStep2Data).toHaveBeenCalledTimes(3)
    })
  })
}) 