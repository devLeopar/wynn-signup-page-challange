import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { CountryCombobox } from '@/components/ui/country-combobox'

// Mock the country utilities
vi.mock('@/lib/country-utils', () => ({
  renderFlag: vi.fn((countryCode: string) => `🏳️‍${countryCode}`),
  getCountryName: vi.fn((countryCode: string) => {
    const names: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'FR': 'France',
      'DE': 'Germany',
      'CA': 'Canada',
    }
    return names[countryCode] || `Country ${countryCode}`
  }),
}))

// Mock react-phone-number-input
vi.mock('react-phone-number-input', () => ({
  getCountries: vi.fn(() => ['US', 'GB', 'FR', 'DE', 'CA']),
}))

describe('CountryCombobox', () => {
  const defaultProps = {
    id: 'country-select',
    label: 'Country of Residence',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<CountryCombobox {...defaultProps} />)
      
      expect(screen.getByTestId('country-combobox')).toBeInTheDocument()
      expect(screen.getByTestId('country-combobox-trigger')).toBeInTheDocument()
      expect(screen.getByText('Country of Residence')).toBeInTheDocument()
      expect(screen.getByTestId('selected-country-text')).toHaveTextContent('Select residence country...')
    })

    it('should render with required asterisk when required is true', () => {
      render(<CountryCombobox {...defaultProps} required />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByText('*')).toHaveClass('text-[#5A3A27]')
    })

    it('should render with custom placeholder', () => {
      const customPlaceholder = 'Choose your country'
      render(<CountryCombobox {...defaultProps} placeholder={customPlaceholder} />)
      
      expect(screen.getByTestId('selected-country-text')).toHaveTextContent(customPlaceholder)
    })

    it('should render with selected value', () => {
      render(<CountryCombobox {...defaultProps} value="US" />)
      
      expect(screen.getByTestId('selected-country-text')).toHaveTextContent('United States')
      expect(screen.getByTestId('selected-country-flag')).toBeInTheDocument()
    })

    it('should render with error state', () => {
      const errorMessage = 'Please select a country'
      render(<CountryCombobox {...defaultProps} error={errorMessage} />)
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toHaveClass('text-red-500')
      
      // Check if the container has error styling
      const container = screen.getByTestId('country-combobox-container')
      expect(container).toHaveClass('border-red-500')
    })

    it('should render with custom className', () => {
      const customClass = 'custom-country-combobox'
      render(<CountryCombobox {...defaultProps} className={customClass} />)
      
      const container = screen.getByTestId('country-combobox')
      expect(container).toHaveClass(customClass)
    })

    it('should render info icon', () => {
      render(<CountryCombobox {...defaultProps} />)
      
      const infoIcon = screen.getByTestId('info-icon')
      expect(infoIcon).toBeInTheDocument()
      expect(infoIcon).toHaveClass('text-gray-500', 'text-xs', 'font-bold')
    })
  })

  describe('User Interactions', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup()
      render(<CountryCombobox {...defaultProps} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByTestId('country-search-input')).toBeInTheDocument()
      })
    })

    it('should close dropdown when clicked outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <CountryCombobox {...defaultProps} />
          <button data-testid="outside-button">Outside Button</button>
        </div>
      )
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByTestId('country-search-input')).toBeInTheDocument()
      })
      
      // Click outside
      const outsideButton = screen.getByTestId('outside-button')
      await user.click(outsideButton)
      
      await waitFor(() => {
        expect(screen.queryByTestId('country-search-input')).not.toBeInTheDocument()
      })
    })

    it('should select a country when clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<CountryCombobox {...defaultProps} onChange={onChange} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('United States')).toBeInTheDocument()
      })
      
      const usOption = screen.getByText('United States')
      await user.click(usOption)
      
      expect(onChange).toHaveBeenCalledWith('US')
      
      await waitFor(() => {
        expect(screen.queryByTestId('country-search-input')).not.toBeInTheDocument()
      })
    })

    it('should deselect country when clicking the same selected country', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<CountryCombobox {...defaultProps} value="US" onChange={onChange} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByTestId('country-search-input')).toBeInTheDocument()
      })
      
      // Find the United States option specifically within the dropdown list
      const options = screen.getAllByText('United States')
      const dropdownOption = options.find(option => 
        option.closest('[role="dialog"]') !== null
      )
      
      if (dropdownOption) {
        await user.click(dropdownOption)
      }
      
      expect(onChange).toHaveBeenCalledWith(undefined)
    })

    it('should show check mark for selected country', async () => {
      const user = userEvent.setup()
      render(<CountryCombobox {...defaultProps} value="US" />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      await waitFor(() => {
        const checkIcon = screen.getByTestId('check-icon')
        expect(checkIcon).toBeInTheDocument()
        expect(checkIcon).toHaveClass('text-[#7F56D9]')
      })
    })
  })

  describe('Search Functionality', () => {
    it('should filter countries when searching', async () => {
      const user = userEvent.setup()
      render(<CountryCombobox {...defaultProps} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      const searchInput = await screen.findByTestId('country-search-input')
      await user.type(searchInput, 'United')
      
      await waitFor(() => {
        expect(screen.getByText('United States')).toBeInTheDocument()
        expect(screen.getByText('United Kingdom')).toBeInTheDocument()
        expect(screen.queryByText('France')).not.toBeInTheDocument()
      })
    })

    it('should filter countries by country code', async () => {
      const user = userEvent.setup()
      render(<CountryCombobox {...defaultProps} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      const searchInput = await screen.findByTestId('country-search-input')
      await user.type(searchInput, 'US')
      
      await waitFor(() => {
        expect(screen.getByText('United States')).toBeInTheDocument()
        expect(screen.queryByText('United Kingdom')).not.toBeInTheDocument()
      })
    })

    it('should show "No country found" when search has no results', async () => {
      const user = userEvent.setup()
      render(<CountryCombobox {...defaultProps} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      const searchInput = await screen.findByTestId('country-search-input')
      await user.type(searchInput, 'NonExistentCountry')
      
      await waitFor(() => {
        expect(screen.getByText('No country found.')).toBeInTheDocument()
      })
    })

    it('should reset search when closing dropdown', async () => {
      const user = userEvent.setup()
      render(<CountryCombobox {...defaultProps} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      const searchInput = await screen.findByTestId('country-search-input')
      await user.type(searchInput, 'United')
      
      // Close dropdown by pressing Escape
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByTestId('country-search-input')).not.toBeInTheDocument()
      })
      
      // Reopen and check search is reset
      await user.click(trigger)
      
      const newSearchInput = await screen.findByTestId('country-search-input')
      expect(newSearchInput).toHaveValue('')
    })

    it('should reset search when selecting a country', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<CountryCombobox {...defaultProps} onChange={onChange} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      const searchInput = await screen.findByTestId('country-search-input')
      await user.type(searchInput, 'United')
      
      const usOption = screen.getByText('United States')
      await user.click(usOption)
      
      expect(onChange).toHaveBeenCalledWith('US')
      
      // Reopen and check search is reset
      await user.click(trigger)
      
      const newSearchInput = await screen.findByTestId('country-search-input')
      expect(newSearchInput).toHaveValue('')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<CountryCombobox {...defaultProps} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
      expect(trigger).toHaveAttribute('id', 'country-select')
    })

    it('should update aria-expanded when opened', async () => {
      const user = userEvent.setup()
      render(<CountryCombobox {...defaultProps} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<CountryCombobox {...defaultProps} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      
      // Open with Enter key
      trigger.focus()
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByTestId('country-search-input')).toBeInTheDocument()
      })
      
      // Close with Escape key
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByTestId('country-search-input')).not.toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('should only render popover content when open', () => {
      render(<CountryCombobox {...defaultProps} />)
      
      // Popover content should not be in DOM when closed
      expect(screen.queryByTestId('country-search-input')).not.toBeInTheDocument()
    })

    it('should memoize selected country', () => {
      const { rerender } = render(<CountryCombobox {...defaultProps} value="US" />)
      
      expect(screen.getByTestId('selected-country-text')).toHaveTextContent('United States')
      
      // Rerender with same value should not cause issues
      rerender(<CountryCombobox {...defaultProps} value="US" />)
      
      expect(screen.getByTestId('selected-country-text')).toHaveTextContent('United States')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined onChange gracefully', async () => {
      const user = userEvent.setup()
      render(<CountryCombobox {...defaultProps} onChange={undefined} />)
      
      const trigger = screen.getByTestId('country-combobox-trigger')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('United States')).toBeInTheDocument()
      })
      
      // Should not throw error when clicking a country
      const usOption = screen.getByText('United States')
      await user.click(usOption)
      
      // Should close the dropdown
      await waitFor(() => {
        expect(screen.queryByTestId('country-search-input')).not.toBeInTheDocument()
      })
    })

    it('should handle invalid country value gracefully', () => {
      render(<CountryCombobox {...defaultProps} value="INVALID" />)
      
      // Should show placeholder when invalid value is provided
      expect(screen.getByTestId('selected-country-text')).toHaveTextContent('Select residence country...')
    })

    it('should handle empty country list gracefully', async () => {
      // Temporarily mock empty country list
      const mockGetCountries = vi.fn(() => [])
      vi.doMock('react-phone-number-input', () => ({
        getCountries: mockGetCountries,
      }))

      render(<CountryCombobox {...defaultProps} />)
      
      expect(screen.getByTestId('country-combobox-trigger')).toBeInTheDocument()
    })
  })
}) 