import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data for testing
export const mockCountries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
]

export const mockFormData = {
  valid: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    countryCode: 'US',
    phoneNumber: '1234567890',
    termsAccepted: true,
  },
  invalid: {
    firstName: '',
    lastName: '',
    email: 'invalid-email',
    countryCode: '',
    phoneNumber: '123',
    termsAccepted: false,
  },
}

// Helper functions for testing
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

export const createMockApiResponse = <T,>(data: T, delay = 0) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), delay))

export const createMockApiError = (message: string, delay = 0) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), delay)
  ) 