// tests/e2e/user-workflow.spec.js
const { test, expect } = require('@playwright/test');
const APIHelper = require('../helpers/api-helper');

test.describe('User Management Complete Workflow', () => {
  let api;
  let testUserId;

  test.beforeAll(async () => {
    api = new APIHelper();
    await api.init();
    await api.login('admin001', 'sandi123');
  });

  test.afterAll(async () => {
    // Cleanup
    if (testUserId) {
      await api.delete(`/api/users/${testUserId}`);
    }
    await api.dispose();
  });

  test('Complete User Lifecycle: Create → Read → Update → Delete', async () => {
    testUserId = `workflow_test_${Date.now()}`;

    // STEP 1: CREATE USER
    console.log('📝 Step 1: Creating user...');
    const createResponse = await api.post('/api/users', {
      user_id: testUserId,
      nama: 'Workflow Test User',
      no_whatsapp: '081234567890',
      role: 'mahasiswa',
      password: 'Test123!',
    });

    const createData = await createResponse.json();
    expect(createResponse.status()).toBe(201);
    expect(createData.success).toBe(true);
    expect(createData.data.user_id).toBe(testUserId);
    console.log('✅ User created');

    // STEP 2: READ USER (Verify creation)
    console.log('📖 Step 2: Reading user...');
    const readResponse = await api.get(`/api/users/${testUserId}`);
    const readData = await readResponse.json();
    
    expect(readResponse.ok()).toBeTruthy();
    expect(readData.data.user_id).toBe(testUserId);
    expect(readData.data.nama).toBe('Workflow Test User');
    expect(readData.data.status_user).toBe('active');
    console.log('✅ User verified');

    // STEP 3: UPDATE USER
    console.log('✏️ Step 3: Updating user...');
    const updateResponse = await api.put(`/api/users/${testUserId}`, {
      nama: 'Updated Workflow User',
      no_whatsapp: '089876543210',
    });

    const updateData = await updateResponse.json();
    expect(updateResponse.ok()).toBeTruthy();
    expect(updateData.data.nama).toBe('Updated Workflow User');
    expect(updateData.data.no_whatsapp).toBe('089876543210');
    console.log('✅ User updated');

    // STEP 4: RESET PASSWORD
    console.log('🔑 Step 4: Resetting password...');
    const resetResponse = await api.patch(`/api/users/${testUserId}/reset-password`, {
      new_password: 'NewPassword123!',
    });

    const resetData = await resetResponse.json();
    expect(resetResponse.ok()).toBeTruthy();
    expect(resetData.success).toBe(true);
    console.log('✅ Password reset');

    // STEP 5: DEACTIVATE USER
    console.log('⏸️ Step 5: Deactivating user...');
    const deactivateResponse = await api.put(`/api/users/${testUserId}`, {
      status_user: 'inactive',
    });

    const deactivateData = await deactivateResponse.json();
    expect(deactivateResponse.ok()).toBeTruthy();
    expect(deactivateData.data.status_user).toBe('inactive');
    console.log('✅ User deactivated');

    // STEP 6: REACTIVATE USER
    console.log('▶️ Step 6: Reactivating user...');
    const reactivateResponse = await api.put(`/api/users/${testUserId}`, {
      status_user: 'active',
    });

    const reactivateData = await reactivateResponse.json();
    expect(reactivateResponse.ok()).toBeTruthy();
    expect(reactivateData.data.status_user).toBe('active');
    console.log('✅ User reactivated');

    // STEP 7: DELETE USER
    console.log('🗑️ Step 7: Deleting user...');
    const deleteResponse = await api.delete(`/api/users/${testUserId}`);
    const deleteData = await deleteResponse.json();

    expect(deleteResponse.ok()).toBeTruthy();
    expect(deleteData.success).toBe(true);
    console.log('✅ User deleted');

    // STEP 8: VERIFY DELETION
    console.log('🔍 Step 8: Verifying deletion...');
    const verifyResponse = await api.get(`/api/users/${testUserId}`);
    expect(verifyResponse.status()).toBe(404);
    console.log('✅ Deletion verified');

    console.log('\n✨ Complete workflow test passed!');
  });

  test('Bulk User Operations', async () => {
    const userIds = [];

    // Create multiple users
    for (let i = 1; i <= 3; i++) {
      const userId = `bulk_test_${Date.now()}_${i}`;
      userIds.push(userId);

      const response = await api.post('/api/users', {
        user_id: userId,
        nama: `Bulk User ${i}`,
        no_whatsapp: `08123456789${i}`,
        role: 'mahasiswa',
        password: 'Test123!',
      });

      expect(response.status()).toBe(201);
    }

    // Verify all created
    const listResponse = await api.get('/api/users');
    const listData = await listResponse.json();
    
    const createdUsers = listData.data.filter(u => 
      userIds.includes(u.user_id)
    );
    expect(createdUsers.length).toBe(3);

    // Cleanup all
    for (const userId of userIds) {
      await api.delete(`/api/users/${userId}`);
    }
  });
});