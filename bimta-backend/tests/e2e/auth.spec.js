const { test, expect } = require('@playwright/test');
const { 
  login, 
  logout
} = require('../helpers/test-helpers');
const { 
  ADMIN_CREDENTIALS, 
  ROUTES 
} = require('../fixtures/test-data');

test.describe('Authentication Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-AUTH-001: Berhasil login dengan kredensial admin yang valid', async ({ page }) => {
    await page.fill('input[name="user_id"]', ADMIN_CREDENTIALS.user_id);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('p.text-sm.font-semibold').first()).toBeVisible();
    await expect(page.locator('text="BIMTA"')).toBeVisible();
  });

  test('TC-AUTH-002: Menampilkan error dengan kredensial yang tidak valid', async ({ page }) => {
    await page.fill('input[name="user_id"]', 'invalid_user');
    await page.fill('input[name="password"]', 'wrong_password');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('salah');
      await dialog.accept();
    });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC-AUTH-003: Menampilkan error dengan kredensial kosong', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC-AUTH-004: Dapat mengalihkan visibilitas password', async ({ page }) => {
    await page.fill('input[name="password"]', 'testpassword');
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.locator('button:has(svg)').last().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('TC-AUTH-005: Berhasil logout', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/.*dashboard/);
    await logout(page);
    await expect(page).toHaveURL(/.*login/);
    await page.goto(ROUTES.DASHBOARD);
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC-AUTH-006: Redirect ke login saat mengakses rute terlindungi tanpa autentikasi', async ({ page }) => {
    await page.goto(ROUTES.DASHBOARD);
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC-AUTH-007: Mempertahankan sesi setelah reload halaman', async ({ page }) => {
    await login(page);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('p.text-sm.font-semibold').first()).toBeVisible();
  });

  test('TC-AUTH-008: Redirect ke dashboard jika sudah login', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.LOGIN);
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });
});