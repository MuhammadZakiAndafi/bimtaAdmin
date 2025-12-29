// tests/helpers/test-helpers.js
const { expect } = require('@playwright/test');
const { ADMIN_CREDENTIALS, ROUTES, TIMEOUTS } = require('../fixtures/test-data');

/**
 * Login helper function
 */
async function login(page, credentials = ADMIN_CREDENTIALS) {
  await page.goto(ROUTES.LOGIN);
  await page.waitForLoadState('domcontentloaded');  // Faster than networkidle
  
  // Fill login form
  await page.fill('input[name="user_id"]', credentials.user_id);
  await page.fill('input[name="password"]', credentials.password);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Logout helper function
 */
async function logout(page) {
  // Click logout button in sidebar
  await page.click('button:has-text("Logout")');
  
  // Wait for redirect to login page
  await page.waitForURL('**/login', { timeout: TIMEOUTS.MEDIUM });
  
  // Verify we're on login page
  await expect(page).toHaveURL(/.*login/);
}

/**
 * Navigate to specific page
 */
async function navigateTo(page, route) {
  await page.goto(route);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Wait for element to be visible
 */
async function waitForElement(page, selector, timeout = TIMEOUTS.MEDIUM) {
  await page.waitForSelector(selector, { 
    state: 'visible', 
    timeout 
  });
}

/**
 * Fill form field
 */
async function fillField(page, selector, value) {
  await page.fill(selector, value);
}

/**
 * Click button or element
 */
async function clickElement(page, selector) {
  await page.click(selector);
}

/**
 * Upload file
 */
async function uploadFile(page, selector, filePath) {
  await page.setInputFiles(selector, filePath);
}

/**
 * Wait for API response
 */
async function waitForAPIResponse(page, urlPattern, timeout = TIMEOUTS.MEDIUM) {
  return await page.waitForResponse(
    response => response.url().includes(urlPattern) && response.status() === 200,
    { timeout }
  );
}

/**
 * Check if element exists
 */
async function elementExists(page, selector) {
  return await page.locator(selector).count() > 0;
}

/**
 * Get text content of element
 */
async function getTextContent(page, selector) {
  return await page.locator(selector).textContent();
}

/**
 * Take screenshot with custom name
 */
async function takeScreenshot(page, name) {
  await page.screenshot({ 
    path: `./test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Wait for loading spinner to disappear
 */
async function waitForLoadingComplete(page) {
  // Wait for loading spinner to appear (if exists)
  try {
    await page.waitForSelector('.animate-spin', { 
      state: 'visible', 
      timeout: 2000 
    });
  } catch (e) {
    // Loading might be too fast, that's okay
  }
  
  // Wait for loading spinner to disappear
  await page.waitForSelector('.animate-spin', { 
    state: 'hidden', 
    timeout: TIMEOUTS.LONG 
  }).catch(() => {
    // If no spinner found, continue
  });
  
  // Additional wait for network to be idle
  await page.waitForLoadState('networkidle');
}

/**
 * Open modal by button text
 */
async function openModal(page, buttonText) {
  await page.click(`button:has-text("${buttonText}")`);
  await waitForElement(page, '[role="dialog"], .fixed.inset-0');
}

/**
 * Close modal
 */
async function closeModal(page) {
  // Try multiple ways to close modal
  try {
    await page.click('button:has-text("Batal")');
  } catch {
    try {
      await page.click('button:has-text("×")');
    } catch {
      await page.keyboard.press('Escape');
    }
  }
  
  // Wait for modal to close
  await page.waitForSelector('[role="dialog"], .fixed.inset-0', { 
    state: 'hidden',
    timeout: TIMEOUTS.SHORT 
  }).catch(() => {});
}

/**
 * Search in table
 */
async function searchInTable(page, searchTerm) {
  await page.fill('input[placeholder*="Cari"]', searchTerm);
  await page.waitForTimeout(500); // Wait for debounce
  await waitForLoadingComplete(page);
}

/**
 * Select dropdown option
 */
async function selectDropdown(page, selector, value) {
  await page.selectOption(selector, value);
}

/**
 * Get table row count
 */
async function getTableRowCount(page) {
  return await page.locator('tbody tr').count();
}

/**
 * Verify success message
 */
async function verifySuccessMessage(page, expectedMessage) {
  // Wait for alert or notification
  await page.waitForTimeout(500);
  
  // Check for browser alert (if using window.alert)
  page.on('dialog', async dialog => {
    expect(dialog.message()).toContain(expectedMessage);
    await dialog.accept();
  });
}

/**
 * Create test PDF file for testing
 */
function createTestPDF() {
  const fs = require('fs');
  const path = require('path');
  
  const testDir = path.join(__dirname, '../test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const pdfPath = path.join(testDir, 'test-document.pdf');
  
  // Create a minimal PDF file (simplified)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
409
%%EOF`;
  
  fs.writeFileSync(pdfPath, pdfContent);
  return pdfPath;
}

/**
 * Clean up test files
 */
function cleanupTestFiles() {
  const fs = require('fs');
  const path = require('path');
  
  const testDir = path.join(__dirname, '../test-files');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

module.exports = {
  login,
  logout,
  navigateTo,
  waitForElement,
  fillField,
  clickElement,
  uploadFile,
  waitForAPIResponse,
  elementExists,
  getTextContent,
  takeScreenshot,
  waitForLoadingComplete,
  openModal,
  closeModal,
  searchInTable,
  selectDropdown,
  getTableRowCount,
  verifySuccessMessage,
  createTestPDF,
  cleanupTestFiles
};