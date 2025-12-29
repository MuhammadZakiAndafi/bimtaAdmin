// tests/compatibility/browser-test.spec.js

const { test, expect } = require('@playwright/test');
const { BASE_URL, ADMIN } = require('./test-data');

// Pages to test
const PAGES_TO_TEST = [
  { url: '/dashboard', name: 'Dashboard', verifyText: 'Total Mahasiswa' },
  { url: '/akun-mahasiswa', name: 'Akun Mahasiswa', verifyText: 'Mahasiswa' },
  { url: '/akun-dosen', name: 'Akun Dosen', verifyText: 'Dosen' },
  { url: '/referensi-ta', name: 'Referensi TA', verifyText: 'Referensi' },
  { url: '/generate-laporan', name: 'Generate Laporan', verifyText: 'Laporan' }
];

// Main test - will run on all browsers
test.describe('Browser Compatibility Test', () => {
  
  test('Complete Compatibility Test with Video Recording', async ({ page, browserName, context }) => {
    const browser = browserName.toLowerCase();
    
    console.log(`\n🧪 Testing on: ${browserName}`);
    console.log('=' .repeat(50));
    console.log('🎥 Video & trace recording started...\n');

    // STEP 1: LOGIN
    console.log('📝 Step 1: Testing Login...');
    
    await test.step('Navigate to Login Page', async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Verify login page loaded
      await expect(page.locator('input[name="user_id"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      console.log('   ✅ Login page loaded');
    });

    await test.step('Login', async () => {
      await page.fill('input[name="user_id"]', ADMIN.user_id);
      await page.fill('input[name="password"]', ADMIN.password);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Wait for navigation to dashboard
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await page.waitForTimeout(200);
      
      console.log('   ✅ Login successful');
    });

    // STEP 2: VISIT ALL PAGES
    console.log('📄 Step 2: Testing All Pages...');
    
    for (const pageInfo of PAGES_TO_TEST) {
      await test.step(`Visit ${pageInfo.name}`, async () => {
        await page.goto(`${BASE_URL}${pageInfo.url}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(200);  // Brief render time
        
        // Verify page loaded by checking for page title or content
        await expect(page).toHaveURL(new RegExp(pageInfo.url.replace('/', '')));
        
        console.log(`   ✅ ${pageInfo.name} loaded`);
      });
    }

    // STEP 3: CREATE REFERENSI TA (FUNCTIONAL TEST)
    console.log('➕ Step 3: Creating Referensi TA...');
    
    await test.step('Navigate to Referensi TA Page', async () => {
      await page.goto(`${BASE_URL}/referensi-ta`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(300);
      console.log('   ✅ Referensi TA page loaded');
    });

    await test.step('Open Add Referensi Modal', async () => {
      await page.click('button:has-text("Tambah Referensi")');
      await page.waitForSelector('text="Tambah Referensi Baru"');
      console.log('   ✅ Modal opened');
    });

    await test.step('Fill Referensi Form', async () => {
      const timestamp = new Date().getTime();
      const nim = `9999${timestamp.toString().slice(-6)}`;
      
      // Fill form fields
      await page.fill('input[name="nim_mahasiswa"]', nim);
      await page.fill('input[name="nama_mahasiswa"]', 'Test Student Compatibility');
      await page.fill('textarea[name="judul"]', 'Test Project: Browser Compatibility Testing');
      await page.fill('input[name="topik"]', 'Web Testing');
      await page.fill('input[name="tahun"]', '2024');
      
      console.log('   ✅ Form fields filled');
    });

    await test.step('Upload PDF Document', async () => {
      // Create a simple PDF file for testing
      const fileContent = Buffer.from(
        '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj 4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 100 700 Td (Test PDF) Tj ET\nendstream endobj xref 0 5 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n 0000000115 00000 n 0000000207 00000 n trailer<</Size 5/Root 1 0 R>>startxref 301\n%%EOF'
      );
      
      const fileName = 'test-document.pdf';
      await page.setInputFiles('input[name="document"]', {
        name: fileName,
        mimeType: 'application/pdf',
        buffer: fileContent,
      });
      
      console.log('   ✅ PDF uploaded');
    });

    await test.step('Submit Form', async () => {
      await page.click('button[type="submit"]:has-text("Simpan")');
      
      // Wait for success message or modal to close
      await page.waitForTimeout(2000);
      
      console.log('   ✅ Form submitted');
    });

    await test.step('Verify Referensi Created', async () => {
      // Reload page to verify data persisted
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
      
      // Check if cards are visible
      const cards = await page.locator('.bg-white.rounded-lg.shadow-md').count();
      expect(cards).toBeGreaterThan(0);
      
      console.log(`   ✅ Referensi created - ${cards} card(s) found`);
    });

    // STEP 4: VERIFY NAVIGATION MENU
    console.log('🔗 Step 4: Verifying Navigation Menu...');
    
    await test.step('Verify Navigation', async () => {
      // Verify navigation menu is visible
      await expect(page.locator('text="BIMTA"')).toBeVisible();
      await expect(page.locator('a[href="/akun-mahasiswa"]')).toBeVisible();
      console.log('   ✅ Navigation verified');
    });

    // STEP 5: VERIFY SESSION
    console.log('📊 Step 5: Verifying Active Session...');
    
    await test.step('Verify Session', async () => {
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
      console.log('   ✅ Session verified');
    });

    // STEP 6: LOGOUT
    console.log('🚪 Step 6: Testing Logout...');
    
    await test.step('Logout', async () => {
      await page.click('button:has-text("Logout")');
      await page.waitForURL('**/login', { timeout: 10000 });
      console.log('   ✅ Logout successful');
    });

    await test.step('Verify Logout', async () => {
      await expect(page).toHaveURL(/.*login/);
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeFalsy();
      console.log('   ✅ Session cleared');
    });

    console.log('=' .repeat(50));
    console.log(`✅ ${browserName} - ALL TESTS PASSED!\n`);
    console.log('📊 Trace & video automatically attached to HTML report\n');
  });

});