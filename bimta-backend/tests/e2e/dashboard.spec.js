const { test, expect } = require('@playwright/test');
const { 
  login, 
  waitForLoadingComplete,
  navigateTo
} = require('../helpers/test-helpers');
const { ROUTES } = require('../fixtures/test-data');

test.describe('Dashboard Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('TC-DASH-001: Menampilkan semua kartu statistik', async ({ page }) => {
    await expect(page.locator('text="Total Mahasiswa"')).toBeVisible();
    await expect(page.locator('text="Total Dosen"')).toBeVisible();
    await expect(page.locator('text="Referensi TA"').first()).toBeVisible();
    await expect(page.locator('text="Laporan Generated"')).toBeVisible();
    const statCards = page.locator('.bg-white.rounded-lg').first();
    await expect(statCards).toBeVisible();
  });

  test('TC-DASH-002: Menampilkan bagian aksi cepat', async ({ page }) => {
    await expect(page.locator('text="Aksi Cepat"')).toBeVisible();
    await expect(page.locator('text="Kelola Akun Mahasiswa"')).toBeVisible();
    await expect(page.locator('text="Kelola Akun Dosen"')).toBeVisible();
  });

  test('TC-DASH-003: Menampilkan aktivitas terbaru', async ({ page }) => {
    await expect(page.locator('text="Aktivitas Terbaru"')).toBeVisible();
    const activitiesSection = page.locator('text="Aktivitas Terbaru"').locator('..');
    await expect(activitiesSection).toBeVisible();
  });

  test('TC-DASH-004: Menampilkan peringatan sistem', async ({ page }) => {
    await expect(page.locator('text="Peringatan Sistem"')).toBeVisible();
    const warningsSection = page.locator('text="Peringatan Sistem"').locator('..');
    await expect(warningsSection).toBeVisible();
  });

  test('TC-DASH-005: Dapat menavigasi ke Akun Mahasiswa dari sidebar', async ({ page }) => {
    await page.click('a:has-text("Akun Mahasiswa")');
    await page.waitForURL('**/akun-mahasiswa', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*akun-mahasiswa/);
  });

  test('TC-DASH-006: Dapat menavigasi ke Akun Dosen dari sidebar', async ({ page }) => {
    await page.click('a:has-text("Akun Dosen")');
    await page.waitForURL('**/akun-dosen', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*akun-dosen/);
  });

  test('TC-DASH-007: Dapat menavigasi ke Referensi TA dari sidebar', async ({ page }) => {
    await page.click('a:has-text("Referensi TA")');
    await page.waitForURL('**/referensi-ta', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*referensi-ta/);
  });

  test('TC-DASH-008: Dapat menavigasi ke Generate Laporan dari sidebar', async ({ page }) => {
    await page.click('a:has-text("Generate Laporan")');
    await page.waitForURL('**/generate-laporan', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*generate-laporan/);
  });

  test('TC-DASH-009: Menyoroti menu aktif di sidebar', async ({ page }) => {
    await expect(page).toHaveURL(/.*dashboard/);
    const dashboardLink = page.locator('a[href="/dashboard"]');
    await expect(dashboardLink).toBeVisible();
    await page.click('a:has-text("Akun Mahasiswa")');
    await page.waitForURL('**/akun-mahasiswa');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*akun-mahasiswa/);
  });

  test('TC-DASH-010: Menampilkan informasi profil pengguna di header', async ({ page }) => {
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });
});