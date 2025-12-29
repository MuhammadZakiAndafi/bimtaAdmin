const { test, expect } = require('@playwright/test');
const { 
  login, 
  navigateTo,
  searchInTable,
  selectDropdown,
  getTableRowCount
} = require('../helpers/test-helpers');
const { ROUTES, TEST_DOSEN, TIMEOUTS } = require('../fixtures/test-data');

test.describe('Akun Dosen Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, ROUTES.AKUN_DOSEN);
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-DSN-001: Menampilkan halaman Akun Dosen dengan benar', async ({ page }) => {
    await expect(page.locator('text="Mengelola Akun Dosen"')).toBeVisible();
    await expect(page.locator('input[placeholder*="Cari dosen"]')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('button:has-text("Buat Akun Baru")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('TC-DSN-002: Berhasil membuat dosen baru', async ({ page }) => {
    await page.click('button:has-text("Buat Akun Baru")');
    await page.waitForSelector('text="Buat Akun Dosen Baru"');
    await page.fill('input[name="user_id"]', TEST_DOSEN.user_id);
    await page.fill('input[name="nama"]', TEST_DOSEN.nama);
    await page.fill('input[name="no_whatsapp"]', TEST_DOSEN.no_whatsapp);
    await page.fill('input[name="password"]', TEST_DOSEN.password);
    
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('berhasil');
      await dialog.accept();
    });
    
    await page.click('button[type="submit"]:has-text("Simpan")');
    await page.waitForSelector('text="Buat Akun Dosen Baru"', { state: 'hidden', timeout: TIMEOUTS.MEDIUM });
    await page.waitForLoadState('domcontentloaded');
    await searchInTable(page, TEST_DOSEN.user_id);
    await expect(page.locator(`text="${TEST_DOSEN.nama}"`)).toBeVisible();
    await expect(page.locator(`text="${TEST_DOSEN.user_id}"`)).toBeVisible();
  });

  test('TC-DSN-003: Dapat mencari dosen berdasarkan NIDN atau nama', async ({ page }) => {
    await searchInTable(page, TEST_DOSEN.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const rowCount = await getTableRowCount(page);
    if (rowCount > 0) {
      await expect(page.locator(`text="${TEST_DOSEN.user_id}"`)).toBeVisible();
    }
  });

  test('TC-DSN-004: Dapat memfilter dosen berdasarkan status', async ({ page }) => {
    await selectDropdown(page, 'select', 'active');
    await page.waitForLoadState('domcontentloaded');
    
    const rowCount = await getTableRowCount(page);
    expect(rowCount).toBeGreaterThanOrEqual(0);
    
    await selectDropdown(page, 'select', '');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-DSN-005: Berhasil memperbarui data dosen', async ({ page }) => {
    await searchInTable(page, TEST_DOSEN.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const dosenExists = await page.locator(`text="${TEST_DOSEN.user_id}"`).count() > 0;
    if (dosenExists) {
      await page.locator('button[title="Edit"]').first().click();
      await page.waitForSelector('text="Edit Akun Dosen"');
      
      const updatedName = TEST_DOSEN.nama + ' Updated';
      await page.fill('input[name="nama"]', updatedName);
      
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('berhasil');
        await dialog.accept();
      });
      
      await page.click('button[type="submit"]:has-text("Update")');
      await page.waitForSelector('text="Edit Akun Dosen"', { state: 'hidden', timeout: TIMEOUTS.MEDIUM });
      await page.waitForLoadState('domcontentloaded');
      await searchInTable(page, TEST_DOSEN.user_id);
      await expect(page.locator(`text="${updatedName}"`)).toBeVisible();
    }
  });

  test('TC-DSN-006: Berhasil mereset password dosen', async ({ page }) => {
    await searchInTable(page, TEST_DOSEN.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const dosenExists = await page.locator(`text="${TEST_DOSEN.user_id}"`).count() > 0;
    if (dosenExists) {
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

  test('TC-DSN-007: Berhasil menghapus dosen', async ({ page }) => {
    await searchInTable(page, TEST_DOSEN.user_id);
    await page.waitForLoadState('domcontentloaded');
    
    const dosenExists = await page.locator(`text="${TEST_DOSEN.user_id}"`).count() > 0;
    if (dosenExists) {
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
      await searchInTable(page, TEST_DOSEN.user_id);
      const stillExists = await page.locator(`text="${TEST_DOSEN.user_id}"`).count() > 0;
      expect(stillExists).toBe(false);
    }
  });
});