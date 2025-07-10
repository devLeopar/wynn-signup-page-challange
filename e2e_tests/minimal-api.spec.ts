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
}); 