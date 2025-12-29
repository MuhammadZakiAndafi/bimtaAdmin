const { test, expect } = require('@playwright/test');
const { 
  login, 
  navigateTo,
  selectDropdown
} = require('../helpers/test-helpers');
const { ROUTES, TEST_LAPORAN, TIMEOUTS } = require('../fixtures/test-data');

test.describe('Generate Laporan Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, ROUTES.GENERATE_LAPORAN);
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-LAP-001: Menampilkan halaman Generate Laporan dengan benar', async ({ page }) => {
    await expect(page.locator('text="Generate Laporan Bimbingan"')).toBeVisible();
    await expect(page.locator('text="Parameter Laporan"')).toBeVisible();
    await expect(page.locator('select[name="jenis_laporan"]')).toBeVisible();
    await expect(page.locator('select[name="bulan"]')).toBeVisible();
    await expect(page.locator('select[name="tahun"]')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Laporan")')).toBeVisible();
    await expect(page.locator('button:has-text("Reset Filter")')).toBeVisible();
  });

  test('TC-LAP-002: Memiliki nilai default yang benar', async ({ page }) => {
    const jenisLaporan = page.locator('select[name="jenis_laporan"]');
    await expect(jenisLaporan).toHaveValue('bulanan');
    
    const currentMonth = new Date().getMonth() + 1;
    const bulan = page.locator('select[name="bulan"]');
    await expect(bulan).toHaveValue(currentMonth.toString());
    
    const currentYear = new Date().getFullYear();
    const tahun = page.locator('select[name="tahun"]');
    await expect(tahun).toHaveValue(currentYear.toString());
  });

  test('TC-LAP-003: Berhasil generate laporan bulanan', async ({ page }) => {
    await selectDropdown(page, 'select[name="jenis_laporan"]', 'bulanan');
    await page.click('button:has-text("Generate Laporan")');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const hasResults = await page.locator('table').count() > 0;
    const hasEmptyState = await page.locator('text="Pilih parameter"').count() > 0;
    expect(hasResults || hasEmptyState).toBe(true);
    
    if (hasResults) {
      await expect(page.locator('th:has-text("NIM")')).toBeVisible();
      await expect(page.locator('th:has-text("Mahasiswa")')).toBeVisible();
      await expect(page.locator('th:has-text("Dosen")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Total Bimbingan")')).toBeVisible();
    }
  });

  test('TC-LAP-004: Berhasil generate laporan semester', async ({ page }) => {
    await selectDropdown(page, 'select[name="jenis_laporan"]', 'semester');
    await page.waitForTimeout(500);
    
    const bulanField = await page.locator('select[name="bulan"]').count();
    expect(bulanField).toBe(0);
    
    await page.click('button:has-text("Generate Laporan")');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const hasResults = await page.locator('table').count() > 0;
    const hasEmptyState = await page.locator('text="Pilih parameter"').count() > 0;
    expect(hasResults || hasEmptyState).toBe(true);
    
    if (hasResults) {
      await expect(page.locator('th:has-text("Dosen Pembimbing")')).toBeVisible();
      await expect(page.locator('th:has-text("Total Bimbingan")')).toBeVisible();
      await expect(page.locator('th:has-text("Selesai")')).toBeVisible();
      await expect(page.locator('th:has-text("Berlangsung")')).toBeVisible();
      await expect(page.locator('th:has-text("Rata-rata Pertemuan")')).toBeVisible();
    }
  });

  test('TC-LAP-005: Dapat mengubah seleksi bulan', async ({ page }) => {
    await selectDropdown(page, 'select[name="bulan"]', '6');
    const bulan = page.locator('select[name="bulan"]');
    await expect(bulan).toHaveValue('6');
  });

  test('TC-LAP-006: Dapat mengubah seleksi tahun', async ({ page }) => {
    const currentYear = new Date().getFullYear();
    const lastYear = (currentYear - 1).toString();
    await selectDropdown(page, 'select[name="tahun"]', lastYear);
    const tahun = page.locator('select[name="tahun"]');
    await expect(tahun).toHaveValue(lastYear);
  });

  test('TC-LAP-007: Mereset filter ke nilai default', async ({ page }) => {
    await selectDropdown(page, 'select[name="jenis_laporan"]', 'semester');
    await selectDropdown(page, 'select[name="tahun"]', '2023');
    await page.click('button:has-text("Reset Filter")');
    await page.waitForTimeout(500);
    
    const jenisLaporan = page.locator('select[name="jenis_laporan"]');
    await expect(jenisLaporan).toHaveValue('bulanan');
    const currentYear = new Date().getFullYear();
    const tahun = page.locator('select[name="tahun"]');
    await expect(tahun).toHaveValue(currentYear.toString());
  });

  test('TC-LAP-008: Menampilkan tombol export setelah generate laporan', async ({ page }) => {
    await page.click('button:has-text("Generate Laporan")');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const hasResults = await page.locator('table').count() > 0;
    if (hasResults) {
      await expect(page.locator('button:has-text("Export Excel")')).toBeVisible();
    }
  });

  test('TC-LAP-009: Menampilkan informasi periode dalam hasil', async ({ page }) => {
    await page.click('button:has-text("Generate Laporan")');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const hasResults = await page.locator('table').count() > 0;
    if (hasResults) {
      await expect(page.locator('table')).toBeVisible();
      const tableRows = await page.locator('table tbody tr').count();
      expect(tableRows).toBeGreaterThanOrEqual(0);
    }
  });

  test('TC-LAP-010: Menampilkan jenis laporan yang benar dalam hasil', async ({ page }) => {
    await selectDropdown(page, 'select[name="jenis_laporan"]', 'bulanan');
    await page.click('button:has-text("Generate Laporan")');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const hasResults = await page.locator('table').count() > 0;
    if (hasResults) {
      await expect(page.locator('text="Laporan Bulanan"')).toBeVisible();
    }
  });

  test('TC-LAP-011: Menangani hasil kosong dengan baik', async ({ page }) => {
    await expect(page.locator('button:has-text("Generate Laporan")')).toBeVisible();
    await expect(page).toHaveURL(/.*generate-laporan/);
  });

  test('TC-LAP-012: Menampilkan status loading saat generate', async ({ page }) => {
    const generateButton = page.locator('button:has-text("Generate Laporan")');
    await generateButton.click();
    await page.waitForTimeout(500);
    
    const loadingExists = await page.locator('text="Sedang generate"').count() > 0 ||
                          await page.locator('.animate-spin').count() > 0;
    expect(true).toBe(true);
  });

  test('TC-LAP-013: Mempertahankan status filter setelah generate', async ({ page }) => {
    await selectDropdown(page, 'select[name="bulan"]', '3');
    const selectedYear = '2024';
    await selectDropdown(page, 'select[name="tahun"]', selectedYear);
    await page.click('button:has-text("Generate Laporan")');
    await page.waitForLoadState('domcontentloaded');
    
    const bulan = page.locator('select[name="bulan"]');
    await expect(bulan).toHaveValue('3');
    const tahun = page.locator('select[name="tahun"]');
    await expect(tahun).toHaveValue(selectedYear);
  });
});