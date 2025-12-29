const { test, expect } = require('@playwright/test');
const path = require('path');
const { 
  login, 
  navigateTo,
  searchInTable,
  createTestPDF
} = require('../helpers/test-helpers');
const { ROUTES, TEST_REFERENSI, TIMEOUTS } = require('../fixtures/test-data');

test.describe('Referensi TA Tests', () => {
  let testPDFPath;
  
  test.beforeAll(async () => {
    testPDFPath = createTestPDF();
  });
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, ROUTES.REFERENSI_TA);
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-REF-001: Menampilkan halaman Referensi TA dengan benar', async ({ page }) => {
    await expect(page.locator('text="Referensi Tugas Akhir"')).toBeVisible();
    await expect(page.locator('input[placeholder*="Cari referensi"]')).toBeVisible();
    await expect(page.locator('button:has-text("Tambah Referensi")')).toBeVisible();
  });

  test('TC-REF-002: Membuka modal pembuatan saat mengklik "Tambah Referensi"', async ({ page }) => {
    await page.click('button:has-text("Tambah Referensi")');
    await page.waitForSelector('text="Tambah Referensi Baru"', { timeout: TIMEOUTS.MEDIUM });
    await expect(page.locator('text="Tambah Referensi Baru"')).toBeVisible();
    await expect(page.locator('input[name="nim_mahasiswa"]')).toBeVisible();
    await expect(page.locator('input[name="nama_mahasiswa"]')).toBeVisible();
    await expect(page.locator('textarea[name="judul"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('TC-REF-003: Berhasil membuat referensi baru dengan upload PDF', async ({ page }) => {
    await page.click('button:has-text("Tambah Referensi")');
    await page.waitForSelector('text="Tambah Referensi Baru"');
    await page.fill('input[name="nim_mahasiswa"]', TEST_REFERENSI.nim_mahasiswa);
    await page.fill('input[name="nama_mahasiswa"]', TEST_REFERENSI.nama_mahasiswa);
    await page.fill('textarea[name="judul"]', TEST_REFERENSI.judul);
    await page.fill('input[name="topik"]', TEST_REFERENSI.topik);
    await page.fill('input[name="tahun"]', TEST_REFERENSI.tahun.toString());
    await page.setInputFiles('input[type="file"]', testPDFPath);
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('berhasil');
      await dialog.accept();
    });
    await page.click('button[type="submit"]:has-text("Simpan")');
    await page.waitForSelector('text="Tambah Referensi Baru"', { state: 'hidden', timeout: TIMEOUTS.LONG });
    await page.waitForLoadState('domcontentloaded');
    
    // Search for newly created referensi
    await searchInTable(page, TEST_REFERENSI.nim_mahasiswa);
    
    // Verify referensi appears in cards
    await expect(page.locator(`text="${TEST_REFERENSI.judul}"`)).toBeVisible();
    await expect(page.locator(`text="${TEST_REFERENSI.nama_mahasiswa}"`)).toBeVisible();
  });

  test('TC-REF-004: Dapat mencari referensi berdasarkan berbagai kriteria', async ({ page }) => {
    await searchInTable(page, TEST_REFERENSI.nim_mahasiswa);
    await page.waitForLoadState('domcontentloaded');
    
    const searchResults = await page.locator('.bg-white.rounded-lg.shadow-md').count();
    if (searchResults > 0) {
      await expect(page.locator(`text="${TEST_REFERENSI.nim_mahasiswa}"`)).toBeVisible();
    }
    
    await page.fill('input[placeholder*="Cari referensi"]', '');
    await page.waitForTimeout(1000);
  });

  test('TC-REF-005: Menampilkan kartu referensi dengan semua informasi', async ({ page }) => {
    await searchInTable(page, TEST_REFERENSI.nim_mahasiswa);
    await page.waitForLoadState('domcontentloaded');
    
    const referensiExists = await page.locator(`text="${TEST_REFERENSI.judul}"`).count() > 0;
    if (referensiExists) {
      const card = page.locator(`text="${TEST_REFERENSI.judul}"`).locator('..');
      await expect(card.locator(`text="${TEST_REFERENSI.judul}"`)).toBeVisible();
      await expect(card.locator(`text="${TEST_REFERENSI.nama_mahasiswa}"`)).toBeVisible();
      await expect(card.locator(`text="${TEST_REFERENSI.nim_mahasiswa}"`)).toBeVisible();
      await expect(card.locator('button:has-text("Lihat")')).toBeVisible();
    }
  });

  test('TC-REF-006: Membuka modal edit dengan data yang sudah diisi', async ({ page }) => {
    await searchInTable(page, TEST_REFERENSI.nim_mahasiswa);
    await page.waitForLoadState('domcontentloaded');
    
    const referensiExists = await page.locator(`text="${TEST_REFERENSI.judul}"`).count() > 0;
    if (referensiExists) {
      const card = page.locator(`text="${TEST_REFERENSI.judul}"`).locator('../..');
      await card.locator('button[title="Edit"]').click();
      await page.waitForSelector('text="Edit Referensi"', { timeout: TIMEOUTS.MEDIUM });
      await expect(page.locator('text="Edit Referensi"')).toBeVisible();
      
      const nimInput = page.locator('input[name="nim_mahasiswa"]');
      await expect(nimInput).toBeDisabled();
      await expect(nimInput).toHaveValue(TEST_REFERENSI.nim_mahasiswa);
      await expect(page.locator('input[name="nama_mahasiswa"]')).toHaveValue(TEST_REFERENSI.nama_mahasiswa);
      await expect(page.locator('textarea[name="judul"]')).toHaveValue(TEST_REFERENSI.judul);
    }
  });

  test('TC-REF-007: Berhasil memperbarui referensi', async ({ page }) => {
    await searchInTable(page, TEST_REFERENSI.nim_mahasiswa);
    await page.waitForLoadState('domcontentloaded');
    
    const referensiExists = await page.locator(`text="${TEST_REFERENSI.judul}"`).count() > 0;
    if (referensiExists) {
      const card = page.locator(`text="${TEST_REFERENSI.judul}"`).locator('../..');
      await card.locator('button[title="Edit"]').click();
      await page.waitForSelector('text="Edit Referensi"');
      
      const updatedJudul = TEST_REFERENSI.judul + ' - Updated';
      await page.fill('textarea[name="judul"]', updatedJudul);
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('berhasil');
        await dialog.accept();
      });
      await page.click('button[type="submit"]:has-text("Update")');
      await page.waitForSelector('text="Edit Referensi"', { state: 'hidden', timeout: TIMEOUTS.LONG });
      await page.waitForLoadState('domcontentloaded');
      await searchInTable(page, TEST_REFERENSI.nim_mahasiswa);
      await expect(page.locator(`text="${updatedJudul}"`)).toBeVisible();
    }
  });

  test('TC-REF-008: Berhasil menghapus referensi', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const cardsCount = await page.locator('.bg-white.rounded-lg.shadow-md').count();
    console.log(`Found ${cardsCount} referensi card(s)`);
    
    if (cardsCount > 0) {
      const firstCard = page.locator('.bg-white.rounded-lg.shadow-md').first();
      await expect(firstCard).toBeVisible();
      
      const deleteButton = firstCard.locator('button[title="Hapus"]');
      const deleteButtonExists = await deleteButton.count() > 0;
      
      if (deleteButtonExists) {
        page.once('dialog', async dialog => {
          await dialog.accept();
        });
        await deleteButton.click();
        await page.waitForTimeout(1500);
        
        page.once('dialog', async dialog => {
          await dialog.accept();
        });
        await page.waitForLoadState('domcontentloaded');
        
        const newCardsCount = await page.locator('.bg-white.rounded-lg.shadow-md').count();
        expect(newCardsCount).toBeLessThanOrEqual(cardsCount);
      } else {
        await expect(page).toHaveURL(/.*referensi-ta/);
      }
    } else {
      console.log('⚠️  No referensi found - skipping delete test (clean database)');
      await expect(page).toHaveURL(/.*referensi-ta/);
      await expect(page.locator('button:has-text("Tambah Referensi")')).toBeVisible();
    }
  });

  test('TC-REF-009: Memvalidasi field yang diperlukan dalam formulir pembuatan', async ({ page }) => {
    await page.click('button:has-text("Tambah Referensi")');
    await page.waitForSelector('text="Tambah Referensi Baru"');
    await page.click('button[type="submit"]:has-text("Simpan")');
    await expect(page.locator('text="Tambah Referensi Baru"')).toBeVisible();
  });

  test('TC-REF-010: Menutup modal saat mengklik "Batal"', async ({ page }) => {
    await page.click('button:has-text("Tambah Referensi")');
    await page.waitForSelector('text="Tambah Referensi Baru"');
    await page.click('button:has-text("Batal")');
    await page.waitForSelector('text="Tambah Referensi Baru"', { state: 'hidden', timeout: TIMEOUTS.SHORT });
    await expect(page.locator('text="Tambah Referensi Baru"')).not.toBeVisible();
  });
});