import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { PhoneInput } from '@/components/ui/phone-input'

// Mock the country utilities
vi.mock('@/lib/country-utils', () => ({
  renderFlag: vi.fn((countryCode: string) => `🏳️‍${countryCode}`),
  getCountryName: vi.fn((countryCode: string) => {
    const names: Record<string, string> = {
      'AE': 'United Arab Emirates',
      'US': 'United States',
      'GB': 'United Kingdom',
      'FR': 'France',
      'DE': 'Germany',
    }
    return names[countryCode] || `Country ${countryCode}`
  }),
}))

// Mock react-phone-number-input
vi.mock('react-phone-number-input', () => ({
  getCountries: vi.fn(() => ['AE', 'US', 'GB', 'FR', 'DE']),
  getCountryCallingCode: vi.fn((countryCode: string) => {
    const codes: Record<string, string> = {
      'AE': '971',
      'US': '1',
      'GB': '44',
      'FR': '33',
      'DE': '49',
    }
    return codes[countryCode] || '1'
  }),
}))

describe('PhoneInput', () => {
  const defaultProps = {
    id: 'phone-input',
    label: 'Phone Number',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<PhoneInput {...defaultProps} />)
      
      expect(screen.getByTestId('phone-input')).toBeInTheDocument()
      expect(screen.getByTestId('phone-number-input')).toBeInTheDocument()
      expect(screen.getByTestId('phone-country-code')).toHaveTextContent('+971') // Default AE country code
      expect(screen.getByTestId('phone-country-flag')).toHaveTextContent('🏳️‍AE') // Default AE flag
    })

    it('should render with required asterisk when required is true', () => {
      render(<PhoneInput {...defaultProps} required />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByText('*')).toHaveClass('text-[#5A3A27]')
    })

    it('should render with custom placeholder', () => {
      const customPlaceholder = '000-0000'
      render(<PhoneInput {...defaultProps} placeholder={customPlaceholder} />)
      
      const input = screen.getByTestId('phone-number-input')
      expect(input).toHaveAttribute('placeholder', customPlaceholder)
    })

    it('should render with custom default country', () => {
      render(<PhoneInput {...defaultProps} defaultCountry="US" />)
      
      expect(screen.getByTestId('phone-country-code')).toHaveTextContent('+1')
      expect(screen.getByTestId('phone-country-flag')).toHaveTextContent('🏳️‍US')
    })

    it('should render with error state', () => {
      const errorMessage = 'Invalid phone number'
      render(<PhoneInput {...defaultProps} error={errorMessage} />)
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toHaveClass('text-red-500')
    })

    it('should render with custom className', () => {
      const customClass = 'custom-phone-input'
      render(<PhoneInput {...defaultProps} className={customClass} />)
      
      const container = screen.getByTestId('phone-input')
      expect(container).toHaveClass(customClass)
    })

    it('should render info icon', () => {
      render(<PhoneInput {...defaultProps} />)
      
      const infoIcon = screen.getByTestId('phone-info-icon')
      expect(infoIcon).toBeInTheDocument()
      expect(infoIcon).toHaveClass('text-gray-500', 'text-xs', 'font-bold')
    })

    it('should display phone number without country code when value is provided', () => {
      render(<PhoneInput {...defaultProps} value="+9711234567890" />)
      
      const input = screen.getByTestId('phone-number-input')
      expect(input).toHaveValue('1234567890')
    })
  })

  describe('Country Selection', () => {
    it('should open country dropdown when country selector is clicked', async () => {
      const user = userEvent.setup()
      render(<PhoneInput {...defaultProps} />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      await waitFor(() => {
        expect(screen.getByTestId('phone-country-search')).toBeInTheDocument()
      })
    })

    it('should close country dropdown when clicked outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <PhoneInput {...defaultProps} />
          <button data-testid="outside-button">Outside Button</button>
        </div>
      )
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      await waitFor(() => {
        expect(screen.getByTestId('phone-country-search')).toBeInTheDocument()
      })
      
      // Click outside
      const outsideButton = screen.getByTestId('outside-button')
      await user.click(outsideButton)
      
      await waitFor(() => {
        expect(screen.queryByTestId('phone-country-search')).not.toBeInTheDocument()
      })
    })

    it('should change country when a country is selected', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<PhoneInput {...defaultProps} onChange={onChange} />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      await waitFor(() => {
        expect(screen.getByText('United States')).toBeInTheDocument()
      })
      
      const usOption = screen.getByText('United States')
      await user.click(usOption)
      
      await waitFor(() => {
        expect(screen.getByTestId('phone-country-code')).toHaveTextContent('+1')
        expect(screen.getByTestId('phone-country-flag')).toHaveTextContent('🏳️‍US')
      })
    })

    it('should update phone number when country changes with existing phone value', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<PhoneInput {...defaultProps} value="+9711234567890" onChange={onChange} />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      await waitFor(() => {
        expect(screen.getByText('United States')).toBeInTheDocument()
      })
      
      const usOption = screen.getByText('United States')
      await user.click(usOption)
      
      expect(onChange).toHaveBeenCalledWith('+11234567890')
    })

    it('should show check mark for selected country', async () => {
      const user = userEvent.setup()
      render(<PhoneInput {...defaultProps} defaultCountry="AE" />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      await waitFor(() => {
        const checkIcon = screen.getByTestId('phone-check-icon')
        expect(checkIcon).toBeInTheDocument()
        expect(checkIcon).toHaveClass('text-[#7F56D9]')
      })
    })
  })

  describe('Phone Number Input', () => {
    it('should handle phone number input', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<PhoneInput {...defaultProps} onChange={onChange} />)
      
      const phoneInput = screen.getByTestId('phone-number-input')
      await user.type(phoneInput, '1234567890')
      
      // Check that onChange was called with phone numbers including country code
      expect(onChange).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalledTimes(10) // One call per character
      
      // Verify first and last calls contain the AE country code
      const calls = onChange.mock.calls
      expect(calls[0][0]).toContain('+971') // First call
      expect(calls[calls.length - 1][0]).toContain('+971') // Last call
    })

    it('should clear phone number when input is cleared', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<PhoneInput {...defaultProps} value="+9711234567890" onChange={onChange} />)
      
      const phoneInput = screen.getByTestId('phone-number-input')
      await user.clear(phoneInput)
      
      expect(onChange).toHaveBeenCalledWith('')
    })

    it('should format phone number correctly with different country codes', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<PhoneInput {...defaultProps} defaultCountry="US" onChange={onChange} />)
      
      const phoneInput = screen.getByTestId('phone-number-input')
      await user.type(phoneInput, '5551234567')
      
      // Check that onChange was called with US country code
      expect(onChange).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalledTimes(10) // One call per character
      
      // Verify calls contain the US country code
      const calls = onChange.mock.calls
      expect(calls[0][0]).toContain('+1') // First call
      expect(calls[calls.length - 1][0]).toContain('+1') // Last call
      
      // Verify country code is displayed correctly
      expect(screen.getByTestId('phone-country-code')).toHaveTextContent('+1')
    })

    it('should handle backspace and editing', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<PhoneInput {...defaultProps} value="+9711234567890" onChange={onChange} />)
      
      const phoneInput = screen.getByTestId('phone-number-input')
      
      // Focus on the input and delete last character
      await user.click(phoneInput)
      await user.keyboard('{Backspace}')
      
      expect(onChange).toHaveBeenCalledWith('+971123456789')
    })
  })

  describe('Search Functionality', () => {
    it('should filter countries when searching', async () => {
      const user = userEvent.setup()
      render(<PhoneInput {...defaultProps} />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      const searchInput = await screen.findByTestId('phone-country-search')
      await user.type(searchInput, 'United')
      
      await waitFor(() => {
        expect(screen.getByText('United States')).toBeInTheDocument()
        expect(screen.getByText('United Arab Emirates')).toBeInTheDocument()
        expect(screen.queryByText('France')).not.toBeInTheDocument()
      })
    })

    it('should filter countries by country code', async () => {
      const user = userEvent.setup()
      render(<PhoneInput {...defaultProps} />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      const searchInput = await screen.findByTestId('phone-country-search')
      await user.type(searchInput, 'US')
      
      await waitFor(() => {
        expect(screen.getByText('United States')).toBeInTheDocument()
        expect(screen.queryByText('United Kingdom')).not.toBeInTheDocument()
      })
    })

    it('should show "No country found" when search has no results', async () => {
      const user = userEvent.setup()
      render(<PhoneInput {...defaultProps} />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      const searchInput = await screen.findByTestId('phone-country-search')
      await user.type(searchInput, 'NonExistentCountry')
      
      await waitFor(() => {
        expect(screen.getByText('No country found.')).toBeInTheDocument()
      })
    })

    it('should reset search when closing dropdown', async () => {
      const user = userEvent.setup()
      render(<PhoneInput {...defaultProps} />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      const searchInput = await screen.findByTestId('phone-country-search')
      await user.type(searchInput, 'United')
      
      // Close dropdown by pressing Escape
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByTestId('phone-country-search')).not.toBeInTheDocument()
      })
      
      // Reopen and check search is reset
      await user.click(countrySelector)
      
      const newSearchInput = await screen.findByTestId('phone-country-search')
      expect(newSearchInput).toHaveValue('')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels and IDs', () => {
      render(<PhoneInput {...defaultProps} />)
      
      const phoneInput = screen.getByTestId('phone-number-input')
      expect(phoneInput).toHaveAttribute('id', 'phone-input')
      expect(phoneInput).toHaveAttribute('type', 'tel')
      
      const label = screen.getByText('Phone Number')
      expect(label).toBeInTheDocument()
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<PhoneInput {...defaultProps} />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      
      // Tab to country selector
      await user.tab()
      expect(countrySelector).toHaveFocus()
      
      // Open with Enter
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByTestId('phone-country-search')).toBeInTheDocument()
      })
    })

    it('should handle focus correctly', async () => {
      const user = userEvent.setup()
      render(<PhoneInput {...defaultProps} />)
      
      const phoneInput = screen.getByTestId('phone-number-input')
      
      await user.click(phoneInput)
      expect(phoneInput).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined onChange gracefully', async () => {
      const user = userEvent.setup()
      render(<PhoneInput {...defaultProps} onChange={undefined} />)
      
      const phoneInput = screen.getByTestId('phone-number-input')
      
      // Should not throw error when typing
      await user.type(phoneInput, '123')
      
      // Since onChange is undefined, the input should remain empty (controlled component)
      expect(phoneInput).toHaveValue('')
    })

    it('should handle invalid phone values gracefully', () => {
      render(<PhoneInput {...defaultProps} value="invalid-phone" />)
      
      const phoneInput = screen.getByTestId('phone-number-input')
      expect(phoneInput).toHaveValue('invalid-phone')
    })

    it('should handle empty phone value', () => {
      render(<PhoneInput {...defaultProps} value="" />)
      
      const phoneInput = screen.getByTestId('phone-number-input')
      expect(phoneInput).toHaveValue('')
    })

    it('should handle country change without existing phone number', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<PhoneInput {...defaultProps} onChange={onChange} />)
      
      const countrySelector = screen.getByTestId('phone-country-selector')
      await user.click(countrySelector)
      
      await waitFor(() => {
        expect(screen.getByText('United States')).toBeInTheDocument()
      })
      
      const usOption = screen.getByText('United States')
      await user.click(usOption)
      
      // Should not call onChange when no existing phone number
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it('should only render popover content when open', () => {
      render(<PhoneInput {...defaultProps} />)
      
      // Search input should not be in DOM when closed
      expect(screen.queryByTestId('phone-country-search')).not.toBeInTheDocument()
    })

    it('should memoize country calling code', () => {
      const { rerender } = render(<PhoneInput {...defaultProps} defaultCountry="US" />)
      
      expect(screen.getByTestId('phone-country-code')).toHaveTextContent('+1')
      
      // Rerender with same country should not cause issues
      rerender(<PhoneInput {...defaultProps} defaultCountry="US" />)
      
      expect(screen.getByTestId('phone-country-code')).toHaveTextContent('+1')
    })
  })
}) 