import { describe, it, expect, vi } from 'vitest'
import { 
  step1Schema, 
  step2Schema, 
  step3Schema, 
  completeRegistrationSchema,
  genderOptions,
  otpMethodOptions
} from '@/lib/validation'

// Mock the phone number validation
vi.mock('react-phone-number-input', () => ({
  isValidPhoneNumber: vi.fn((phone: string) => {
    // Simple mock that considers numbers starting with + as valid
    return typeof phone === 'string' && phone.startsWith('+') && phone.length > 5
  }),
}))

describe('validation schemas', () => {
  describe('step1Schema', () => {
    const validStep1Data = {
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      country: 'US',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      agreed: true,
    }

    describe('firstName validation', () => {
      it('should accept valid first names', () => {
        const result = step1Schema.safeParse(validStep1Data)
        expect(result.success).toBe(true)
      })

      it('should reject empty first name', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          firstName: ''
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('First name is required')
        }
      })

      it('should reject first name less than 2 characters', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          firstName: 'J'
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('First name must be at least 2 characters')
        }
      })

      it('should reject first name with invalid characters', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          firstName: 'John123'
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('can only contain letters')
        }
      })

      it('should accept first name with valid special characters', () => {
        const names = ['Mary-Jane', "O'Connor", 'Jean Paul']
        names.forEach(name => {
          const result = step1Schema.safeParse({
            ...validStep1Data,
            firstName: name
          })
          expect(result.success).toBe(true)
        })
      })
    })

    describe('lastName validation', () => {
      it('should follow same rules as firstName', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          lastName: ''
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Last name is required')
        }
      })
    })

    describe('gender validation', () => {
      it('should accept valid gender options', () => {
        genderOptions.forEach(gender => {
          const result = step1Schema.safeParse({
            ...validStep1Data,
            gender
          })
          expect(result.success).toBe(true)
        })
      })

      it('should reject invalid gender', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          gender: 'invalid'
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please select a valid gender option')
        }
      })

      it('should reject empty gender', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          gender: ''
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please select a gender')
        }
      })
    })

    describe('country validation', () => {
      it('should accept valid country codes', () => {
        const countries = ['US', 'GB', 'FR', 'DE']
        countries.forEach(country => {
          const result = step1Schema.safeParse({
            ...validStep1Data,
            country
          })
          expect(result.success).toBe(true)
        })
      })

      it('should reject empty country', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          country: ''
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Residence country is required')
        }
      })

      it('should reject single character country code', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          country: 'U'
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please select a valid country')
        }
      })
    })

    describe('email validation', () => {
      it('should accept valid email addresses', () => {
        const emails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'test+tag@example.org'
        ]
        emails.forEach(email => {
          const result = step1Schema.safeParse({
            ...validStep1Data,
            email
          })
          expect(result.success).toBe(true)
        })
      })

      it('should reject invalid email formats', () => {
        const emails = ['invalid', 'test@', '@domain.com', 'test@.com']
        emails.forEach(email => {
          const result = step1Schema.safeParse({
            ...validStep1Data,
            email
          })
          expect(result.success).toBe(false)
        })
      })

      it('should reject empty email', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          email: ''
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email address is required')
        }
      })
    })

    describe('phone validation', () => {
      it('should accept valid phone numbers', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          phone: '+1234567890'
        })
        expect(result.success).toBe(true)
      })

      it('should reject invalid phone numbers', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          phone: '123'
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid phone number')
        }
      })

      it('should reject empty phone', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          phone: ''
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Phone number is required')
        }
      })
    })

    describe('agreed validation', () => {
      it('should accept true agreement', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          agreed: true
        })
        expect(result.success).toBe(true)
      })

      it('should reject false agreement', () => {
        const result = step1Schema.safeParse({
          ...validStep1Data,
          agreed: false
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('You must agree to the terms and conditions to continue')
        }
      })
    })
  })

  describe('step2Schema', () => {
    it('should accept valid OTP methods', () => {
      otpMethodOptions.forEach(method => {
        const result = step2Schema.safeParse({ otpMethod: method })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid OTP method', () => {
      const result = step2Schema.safeParse({ otpMethod: 'invalid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Please select how you\'d like to receive')
      }
    })

    it('should reject empty OTP method', () => {
      const result = step2Schema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('step3Schema', () => {
    it('should accept valid 4-digit OTP codes', () => {
      const codes = ['1234', '0000', '9999', '5678']
      codes.forEach(code => {
        const result = step3Schema.safeParse({ otpCode: code })
        expect(result.success).toBe(true)
      })
    })

    it('should reject OTP codes with wrong length', () => {
      const codes = ['123', '12345', '12']
      codes.forEach(code => {
        const result = step3Schema.safeParse({ otpCode: code })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Verification code must be exactly 4 digits')
        }
      })
    })

    it('should reject OTP codes with non-numeric characters', () => {
      const codes = ['123a', 'abcd', '12-3', '12 3']
      codes.forEach(code => {
        const result = step3Schema.safeParse({ otpCode: code })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Verification code must contain only numbers')
        }
      })
    })

    it('should reject empty OTP code', () => {
      const result = step3Schema.safeParse({ otpCode: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Verification code is required')
      }
    })
  })

  describe('completeRegistrationSchema', () => {
    it('should accept complete valid registration data', () => {
      const completeData = {
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male',
        country: 'US',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        agreed: true,
        otpMethod: 'email' as const,
        otpCode: '1234',
      }

      const result = completeRegistrationSchema.safeParse(completeData)
      expect(result.success).toBe(true)
    })

    it('should reject incomplete registration data', () => {
      const incompleteData = {
        firstName: 'John',
        // Missing required fields
      }

      const result = completeRegistrationSchema.safeParse(incompleteData)
      expect(result.success).toBe(false)
    })
  })

  describe('exported constants', () => {
    it('should export gender options', () => {
      expect(genderOptions).toEqual(['male', 'female', 'other', 'prefer_not_to_say'])
    })

    it('should export OTP method options', () => {
      expect(otpMethodOptions).toEqual(['email', 'phone'])
    })
  })

  describe('edge cases', () => {
    it('should handle missing fields gracefully', () => {
      const result = step1Schema.safeParse({})
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it('should handle null values', () => {
      const result = step1Schema.safeParse({
        firstName: null,
        lastName: null,
        gender: null,
        country: null,
        email: null,
        phone: null,
        agreed: null,
      })
      expect(result.success).toBe(false)
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(100)
      const result = step1Schema.safeParse({
        firstName: longString,
        lastName: longString,
        gender: 'male',
        country: 'US',
        email: `${longString}@example.com`,
        phone: '+1234567890',
        agreed: true,
      })
      expect(result.success).toBe(false)
    })
  })
}) 