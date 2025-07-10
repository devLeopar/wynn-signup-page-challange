# 🏨 Wynn Al Marjan Island - Signup Page Challenge

A modern, responsive multi-step user registration page for Wynn Al Marjan Island, built with Next.js, TypeScript, and TailwindCSS.

## 🌟 Features

- **Multi-Step Registration Form**: 3-step signup process (Personal Info → OTP Verification → Success)
- **Modern UI/UX**: Built with Shadcn UI components and TailwindCSS
- **Form Validation**: Comprehensive validation using React Hook Form + Zod
- **State Management**: Optimized global state with Zustand
- **API Integration**: TanStack Query with mock API endpoints
- **Performance Optimized**: Country combobox optimized for < 50ms response time
- **Comprehensive Testing**: Unit, integration, and E2E tests included
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Mobile-first design approach

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone and install dependencies:**
```bash
cd signup-page-challange
npm install
```

2. **Build and start production server:**
```bash
npm run build
npm start
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

**Alternative - Development mode:**
```bash
npm run dev  # For development with hot reload
```

## 🔧 Available Scripts

### Production (Recommended)
```bash
npm run build        # Build for production
npm start           # Start production server
```

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run lint        # Run ESLint
```

### Testing
```bash
# Unit & Integration Tests (Vitest)
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# E2E Tests (Playwright)
npm run test:e2e     # Run E2E tests headless
npm run test:e2e:ui  # Run E2E tests with UI
npm run test:e2e:debug # Debug E2E tests
npm run test:e2e:headed # Run E2E tests in headed mode
```

## 🌐 API Integration

The application uses mock API endpoints hosted on **mockable.io** for demonstration purposes.

### API Base URL
```
https://demo3975834.mockable.io
```

### Endpoints

#### 1. Request OTP
```http
POST /request-otp
Content-Type: application/json

{
  "method": "email" | "phone",
  "contact": "user@example.com" | "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "timestamp": "2024-12-28T10:30:00Z"
}
```

#### 2. Verify OTP
```http
POST /verify-otp
Content-Type: application/json

{
  "otp": "1234",
  "userData": { /* user registration data */ }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration completed successfully"
}
```



### 🔑 Important: OTP Validation

<div align="center">

## 🎯 **VALID OTP: `1234`**

</div>

**For successful registration, use OTP code: `1234`**

- ✅ **OTP "1234"** → Success flow → Registration complete
- ❌ **Any other OTP** → Error flow → "Invalid OTP" message

## 📱 User Flow

### Step 1: Personal Information
- First Name, Last Name, Gender
- Residence Country (searchable dropdown)
- Email and Phone Number
- Terms & Conditions agreement

### Step 2: OTP Method Selection
- Choose to receive OTP via Email or Phone
- Displays masked contact information
- Sends OTP request to selected method

### Step 3: OTP Verification
- Enter 4-digit OTP code
- **Use "1234" for successful verification**
- Resend functionality available
- Success page on completion

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main signup page
├── components/
│   ├── layout/            # Header and Footer
│   ├── ui/                # Reusable UI components
│   │   ├── country-combobox.tsx  # Optimized country selector
│   │   ├── phone-input.tsx       # International phone input
│   │   └── ...            # Other Shadcn UI components
│   ├── signup-form.tsx    # Main form component
│   ├── otp-method-selection.tsx
│   └── otp-verification.tsx
├── hooks/
│   └── use-auth-mutations.ts  # TanStack Query hooks
├── lib/
│   ├── api.ts             # API helper functions
│   ├── validation.ts      # Zod validation schemas
│   └── utils.ts           # Utility functions
└── store/
    └── signup-store.ts    # Zustand state management
```

## 🧪 Testing

### Unit & Integration Tests
- **Framework**: Vitest + React Testing Library
- **Coverage**: 80%+ code coverage
- **Components**: All UI components tested
- **Hooks**: API mutations and state management
- **Utilities**: Form validation and helper functions

### E2E Tests
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, Safari
- **Scenarios**: Complete user journeys
- **Performance**: Country combobox response time testing
- **Accessibility**: Keyboard navigation and screen readers

### Running Tests
```bash
# Run all unit tests
npm run test

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Debug E2E tests with UI
npm run test:e2e:ui
```

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Create `.env.local` for custom configuration:
```bash
NEXT_PUBLIC_API_BASE_URL=https://demo3975834.mockable.io
```

### Performance Optimizations
- **Country Combobox**: Optimized for < 50ms response time
- **Bundle Size**: Optimized with tree shaking
- **Code Splitting**: Dynamic imports where beneficial
- **Image Optimization**: Next.js automatic optimization

## 🔧 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + Shadcn UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **API**: TanStack Query
- **Testing**: Vitest + Playwright
- **Phone Input**: react-phone-number-input
- **Icons**: Lucide React

## 🎨 Design System

- **Colors**: Wynn brand colors with #5A3A27 accent
- **Typography**: Modern, accessible font stack
- **Components**: Shadcn UI component library
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG 2.1 AA compliant

## 🐛 Troubleshooting

### Playwright Browser Installation
If you encounter issues running E2E tests, you may need to install Playwright browsers:

```bash
# Install Playwright browsers
npx playwright install

# Install specific browsers only
npx playwright install chromium firefox webkit

# Install with dependencies (Linux)
npx playwright install-deps
```

### Common Issues

- **"Browser not found" error**: Run `npx playwright install`
- **Tests failing on CI**: Make sure to run `npx playwright install` in your CI pipeline
- **Permission issues**: On Linux, you might need `npx playwright install-deps`

## 🐛 Known Issues & Limitations

- **Mock API**: Uses static mock endpoints (no real backend)
- **OTP Validation**: Client-side validation for demo purposes
- **Email/SMS**: No actual email/SMS sending (mock responses only)

## 📄 License

This project is created for the Wynn Al Marjan Island signup page challenge.

---

**Ready to test?** Remember to use OTP code **"1234"** for successful registration! 🎉
