// API Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://demo3975834.mockable.io';

// Types for API requests/responses
export interface RequestOtpRequest {
  method: 'email' | 'phone';
  email?: string;
  phone?: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface VerifyOtpRequest {
  otp: string;
  userData: {
    firstName: string;
    lastName: string;
    gender: string;
    country: string;
    email: string;
    phone: string;
    agreed: boolean;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  userId?: string;
  registrationDate?: string;
  errorCode?: string;
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status,
      errorData.errorCode
    );
  }
  return response.json();
};

// Helper function to make API requests with timeout
const makeApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout - please try again');
    }
    throw error;
  }
};

// API function to request OTP
export const requestOtp = async (data: RequestOtpRequest): Promise<RequestOtpResponse> => {
  // Add artificial delay for better UX
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const response = await makeApiRequest('/request-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return handleApiResponse<RequestOtpResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to request OTP'
    );
  }
};

// API function to verify OTP and register user
export const verifyOtpAndRegister = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  // Add artificial delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    // Client-side validation since mockable.io free version doesn't support dynamic responses
    if (data.otp === "1234") {
      // Call success endpoint - returns 200 with success: true
      const response = await makeApiRequest('/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      const result = await handleApiResponse<VerifyOtpResponse>(response);
      
      // Add additional delay for registration simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return the result from API as-is (success: true, message, etc.)
      return result;
    } else {
      // For invalid OTP, simulate 400 error response
      // In real scenario, this would be handled by backend
      throw new ApiError('Invalid OTP code. Please try again.', 400, 'INVALID_OTP');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to verify OTP'
    );
  }
};

// Health check function (optional)
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await makeApiRequest('/test', {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}; 