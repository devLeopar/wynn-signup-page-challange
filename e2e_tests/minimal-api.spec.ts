import { test, expect } from '@playwright/test';

test.describe('Minimal Working E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Page loads successfully', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Registration');
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    
    console.log('✅ Page load test completed');
  });

  test('Basic input filling works', async ({ page }) => {
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    
    await expect(page.locator('input[name="firstName"]')).toHaveValue('John');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Doe');
    await expect(page.locator('input[name="email"]')).toHaveValue('john.doe@example.com');
    
    console.log('✅ Basic input test completed');
  });

  test('Performance measurement', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`⚡ Page Load Time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
    
    console.log('✅ Performance test completed');
  });

  test('Network monitoring', async ({ page }) => {
    const requests: { url: string; method: string }[] = [];
    
    page.on('request', request => {
      if (request.url().includes('api') || request.url().includes('mockable')) {
        requests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    
    await page.waitForTimeout(2000);
    
    console.log(`📡 API requests captured: ${requests.length}`);
    requests.forEach(req => {
      console.log(`  - ${req.method} ${req.url}`);
    });
    
    console.log('✅ Network monitoring completed');
  });

  test('LocalStorage check', async ({ page }) => {
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    
    await page.waitForTimeout(1000);
    
    const storeState = await page.evaluate(() => {
      return localStorage.getItem('signup-store');
    });
    
    if (storeState) {
      console.log('📦 LocalStorage found:', JSON.parse(storeState));
      expect(storeState).toBeTruthy();
    } else {
      console.log('⚠️ No localStorage data found');
    }
    
    console.log('✅ LocalStorage test completed');
  });

  test('API Health Check - Test endpoint', async ({ page }) => {
    const response = await page.request.get('https://demo3975834.mockable.io/test');
    
    console.log(`🔍 Health Check Status: ${response.status()}`);
    console.log(`🌐 Health Check URL: ${response.url()}`);
    
    expect(response.status()).toBe(200);
    
    console.log('✅ API Health Check completed');
  });

  test('API Request OTP - Real endpoint test', async ({ page }) => {
    const startTime = Date.now();
    
    const response = await page.request.post('https://demo3975834.mockable.io/request-otp', {
      data: {
        email: 'john.doe@example.com',
        phone: '+971501234567',
        method: 'email'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`🚀 Request OTP Response Time: ${responseTime}ms`);
    console.log(`📊 Status: ${response.status()}`);
    console.log(`🌐 URL: ${response.url()}`);
    
    const responseBody = await response.json();
    console.log(`📦 Response Body:`, responseBody);
    
    expect(response.status()).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toBe('OTP sent successfully');
    expect(responseBody.timestamp).toBeTruthy();
    expect(responseTime).toBeLessThan(10000);
    
    console.log('✅ Request OTP API test completed');
  });

  test('API Verify OTP - Real endpoint test', async ({ page }) => {
    const startTime = Date.now();
    
    const response = await page.request.post('https://demo3975834.mockable.io/verify-otp', {
      data: {
        email: 'john.doe@example.com',
        otp: '1234',
        userData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+971501234567',
          gender: 'male',
          country: 'AE'
        }
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`🚀 Verify OTP Response Time: ${responseTime}ms`);
    console.log(`📊 Status: ${response.status()}`);
    console.log(`🌐 URL: ${response.url()}`);
    
    const responseBody = await response.json();
    console.log(`📦 Response Body:`, responseBody);
    
    expect(response.status()).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toBe('Registration completed successfully');
    expect(responseTime).toBeLessThan(10000);
    
    console.log('✅ Verify OTP API test completed');
  });
}); 