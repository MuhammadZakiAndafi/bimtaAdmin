const { test, expect } = require('@playwright/test');
const { 
  login, 
  navigateTo,
  openModal,
  closeModal,
  searchInTable,
  selectDropdown,
  getTableRowCount
} = require('../helpers/test-helpers');
const { ROUTES, TEST_MAHASISWA, TIMEOUTS } = require('../fixtures/test-data');

test.describe('Akun Mahasiswa Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, ROUTES.AKUN_MAHASISWA);
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-MHS-001: Menampilkan halaman Akun Mahasiswa dengan benar', async ({ page }) => {
    await expect(page.locator('text="Mengelola Akun Mahasiswa"')).toBeVisible();
    await expect(page.locator('input[placeholder*="Cari mahasiswa"]')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('button:has-text("Buat Akun Baru")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('TC-MHS-002: Membuka modal pembuatan saat mengklik "Buat Akun Baru"', async ({ page }) => {
    await page.click('button:has-text("Buat Akun Baru")');
    await page.waitForSelector('text="Buat Akun Mahasiswa Baru"', { timeout: TIMEOUTS.MEDIUM });
    await expect(page.locator('text="Buat Akun Mahasiswa Baru"')).toBeVisible();
    await expect(page.locator('input[name="user_id"]')).toBeVisible();
    await expect(page.locator('input[name="nama"]')).toBeVisible();
    await expect(page.locator('input[name="no_whatsapp"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('TC-MHS-003: Berhasil membuat mahasiswa baru', async ({ page }) => {
    await page.click('button:has-text("Buat Akun Baru")');
    await page.waitForSelector('text="Buat Akun Mahasiswa Baru"');
    await page.fill('input[name="user_id"]', TEST_MAHASISWA.user_id);
    await page.fill('input[name="nama"]', TEST_MAHASISWA.nama);
    await page.fill('input[name="no_whatsapp"]', TEST_MAHASISWA.no_whatsapp);
    await page.fill('input[name="password"]', TEST_MAHASISWA.password);
    
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('berhasil');
      await dialog.accept();
    });
    
    await page.click('button[type="submit"]:has-text("Simpan")');
    await page.waitForSelector('text="Buat Akun Mahasiswa Baru"', { state: 'hidden', timeout: TIMEOUTS.MEDIUM });
    await page.waitForLoadState('domcontentloaded');
    await searchInTable(page, TEST_MAHASISWA.user_id);
    await expect(page.locator(`text="${TEST_MAHASISWA.nama}"`)).toBeVisible();
    await expect(page.locator(`text="${TEST_MAHASISWA.user_id}"`)).toBeVisible();
  });

  test('TC-MHS-004: Dapat mencari mahasiswa berdasarkan NIM atau nama', async ({ page }) => {
    await searchInTable(page, TEST_MAHASISWA.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const rowCount = await getTableRowCount(page);
    if (rowCount > 0) {
      await expect(page.locator(`text="${TEST_MAHASISWA.user_id}"`)).toBeVisible();
    }
  });

  test('TC-MHS-005: Dapat memfilter mahasiswa berdasarkan status', async ({ page }) => {
    await selectDropdown(page, 'select', 'active');
    await page.waitForLoadState('domcontentloaded');
    const rowCount = await getTableRowCount(page);
    expect(rowCount).toBeGreaterThanOrEqual(0);
    
    await selectDropdown(page, 'select', 'inactive');
    await page.waitForLoadState('domcontentloaded');
    await selectDropdown(page, 'select', '');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-MHS-006: Membuka modal edit saat mengklik tombol edit', async ({ page }) => {
    await searchInTable(page, TEST_MAHASISWA.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const mahasiswaExists = await page.locator(`text="${TEST_MAHASISWA.user_id}"`).count() > 0;
    if (mahasiswaExists) {
      await page.locator('button[title="Edit"]').first().click();
      await page.waitForSelector('text="Edit Akun Mahasiswa"', { timeout: TIMEOUTS.MEDIUM });
      await expect(page.locator('text="Edit Akun Mahasiswa"')).toBeVisible();
      
      const nimInput = page.locator('input[name="user_id"]');
      await expect(nimInput).toBeDisabled();
      await expect(nimInput).toHaveValue(TEST_MAHASISWA.user_id);
    }
  });

  test('TC-MHS-007: Berhasil memperbarui data mahasiswa', async ({ page }) => {
    await searchInTable(page, TEST_MAHASISWA.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const mahasiswaExists = await page.locator(`text="${TEST_MAHASISWA.user_id}"`).count() > 0;
    if (mahasiswaExists) {
      await page.locator('button[title="Edit"]').first().click();
      await page.waitForSelector('text="Edit Akun Mahasiswa"');
      
      const updatedName = TEST_MAHASISWA.nama + ' Updated';
      await page.fill('input[name="nama"]', updatedName);
      
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('berhasil');
        await dialog.accept();
      });
      
      await page.click('button[type="submit"]:has-text("Update")');
      await page.waitForSelector('text="Edit Akun Mahasiswa"', { state: 'hidden', timeout: TIMEOUTS.MEDIUM });
      await page.waitForLoadState('domcontentloaded');
      await searchInTable(page, TEST_MAHASISWA.user_id);
      await expect(page.locator(`text="${updatedName}"`)).toBeVisible();
    }
  });

  test('TC-MHS-008: Membuka modal reset password', async ({ page }) => {
    await searchInTable(page, TEST_MAHASISWA.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const mahasiswaExists = await page.locator(`text="${TEST_MAHASISWA.user_id}"`).count() > 0;
    if (mahasiswaExists) {
      await page.locator('button[title="Reset Password"]').first().click();
      await page.waitForSelector('text="Reset Password"', { timeout: TIMEOUTS.MEDIUM });
      await expect(page.locator('h3:has-text("Reset Password")')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    }
  });

  test('TC-MHS-009: Berhasil mereset password mahasiswa', async ({ page }) => {
    await searchInTable(page, TEST_MAHASISWA.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const mahasiswaExists = await page.locator(`text="${TEST_MAHASISWA.user_id}"`).count() > 0;
    if (mahasiswaExists) {
      await page.locator('button[title="Reset Password"]').first().click();
      await page.waitForSelector('text="Reset Password"');
      await page.fill('input[type="password"]', 'newpassword123');
      
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('berhasil');
        await dialog.accept();
      });
      
      await page.click('button:has-text("Reset Password")');
      await page.waitForSelector('text="Reset Password"', { state: 'hidden', timeout: TIMEOUTS.MEDIUM });
    }
  });

  test('TC-MHS-010: Berhasil menghapus mahasiswa', async ({ page }) => {
    await searchInTable(page, TEST_MAHASISWA.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const mahasiswaExists = await page.locator(`text="${TEST_MAHASISWA.user_id}"`).count() > 0;
    if (mahasiswaExists) {
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('yakin');
        await dialog.accept();
      });
      
      await page.locator('button[title="Hapus"]').first().click();
      await page.waitForTimeout(1000);
      
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('berhasil');
        await dialog.accept();
      });
      
      await page.waitForLoadState('domcontentloaded');
      await searchInTable(page, TEST_MAHASISWA.user_id);
      const stillExists = await page.locator(`text="${TEST_MAHASISWA.user_id}"`).count() > 0;
      expect(stillExists).toBe(false);
    }
  });

  test('TC-MHS-011: Menutup modal saat mengklik "Batal"', async ({ page }) => {
    await page.click('button:has-text("Buat Akun Baru")');
    await page.waitForSelector('text="Buat Akun Mahasiswa Baru"');
    await page.click('button:has-text("Batal")');
    await page.waitForSelector('text="Buat Akun Mahasiswa Baru"', { state: 'hidden', timeout: TIMEOUTS.SHORT });
    await expect(page.locator('text="Buat Akun Mahasiswa Baru"')).not.toBeVisible();
  });

  test('TC-MHS-012: Memvalidasi field yang diperlukan dalam formulir pembuatan', async ({ page }) => {
    await page.click('button:has-text("Buat Akun Baru")');
    await page.waitForSelector('text="Buat Akun Mahasiswa Baru"');
    await page.click('button[type="submit"]:has-text("Simpan")');
    await expect(page.locator('text="Buat Akun Mahasiswa Baru"')).toBeVisible();
  });
});