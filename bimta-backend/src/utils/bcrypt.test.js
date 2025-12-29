const { hashPassword, comparePassword } = require('./bcrypt');

describe('Bcrypt Utils', () => {
  const plainPassword = 'passwordICBS2025';

  test('hashPassword harus menghasilkan string hash yang berbeda dari password asli', async () => {
    const hash = await hashPassword(plainPassword);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(plainPassword);
    expect(typeof hash).toBe('string');
  });

  test('comparePassword harus mengembalikan true jika password cocok', async () => {
    const hash = await hashPassword(plainPassword);
    const isMatch = await comparePassword(plainPassword, hash);
    
    expect(isMatch).toBe(true);
  });

  test('comparePassword harus mengembalikan false jika password salah', async () => {
    const hash = await hashPassword(plainPassword);
    const isMatch = await comparePassword('passwordSalah', hash);
    
    expect(isMatch).toBe(false);
  });
});