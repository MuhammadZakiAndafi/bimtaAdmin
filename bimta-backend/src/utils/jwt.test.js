const { generateToken, verifyToken } = require('./jwt');

process.env.JWT_SECRET = 'super_secret_bimta_key';
process.env.JWT_EXPIRES_IN = '1h';

describe('JWT Utils', () => {
  const payload = { 
    user_id: 'admin01', 
    nama: 'Ari Raihan', 
    role: 'admin' 
  };

  test('generateToken harus menghasilkan string token JWT', () => {
    const token = generateToken(payload);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    // Token JWT biasanya terdiri dari 3 bagian yang dipisahkan oleh titik
    expect(token.split('.').length).toBe(3);
  });

  test('verifyToken harus mengembalikan payload yang benar dari token yang valid', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    
    expect(decoded).toMatchObject(payload);
    expect(decoded.user_id).toBe('admin01');
  });

  test('verifyToken harus melempar error jika token tidak valid atau expired', () => {
    const invalidToken = 'token.palsu.disini';
    
    expect(() => {
      verifyToken(invalidToken);
    }).toThrow();
  });
});