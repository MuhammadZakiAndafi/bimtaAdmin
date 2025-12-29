const User = require('./User');
const pool = require('../config/database');

jest.mock('../config/database');

describe('User Model', () => {
  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    test('harus mengambil semua user tanpa filter', async () => {
      pool.query.mockResolvedValue({ rows: [{ user_id: '1' }] });
      const result = await User.findAll();
      expect(result).toHaveLength(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE 1=1'), []);
    });

    test('harus menerapkan semua filter (role, status, search)', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const filters = { role: 'admin', status_user: 'active', search: 'ari' };
      
      await User.findAll(filters);
      
      // Memastikan semua parameter filter masuk ke query
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND role = $1 AND status_user = $2 AND (nama ILIKE $3'),
        ['admin', 'active', '%ari%']
      );
    });
  });

  describe('CRUD Operations', () => {
    test('findById & findByUserIdWithPassword harus bekerja', async () => {
      pool.query.mockResolvedValue({ rows: [{ user_id: 'admin01' }] });
      await User.findById('admin01');
      await User.findByUserIdWithPassword('admin01');
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test('create harus memasukkan data baru', async () => {
      const userData = { user_id: '1', nama: 'A', no_whatsapp: '1', sandi: '1', role: '1', photo_url: '1', status_user: '1' };
      pool.query.mockResolvedValue({ rows: [userData] });
      const result = await User.create(userData);
      expect(result.user_id).toBe('1');
    });

    test('update & updatePassword harus menjalankan query UPDATE', async () => {
      pool.query.mockResolvedValue({ rows: [{ user_id: '1' }] });
      await User.update('1', { nama: 'Baru' });
      await User.updatePassword('1', 'hash');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users'), expect.any(Array));
    });

    test('delete harus menghapus user', async () => {
      pool.query.mockResolvedValue({ rows: [{ user_id: '1' }] });
      await User.delete('1');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE'), ['1']);
    });
  });

  describe('Statistics', () => {
    test('countByRole & countByStatus harus mengembalikan data group by', async () => {
      pool.query.mockResolvedValue({ rows: [{ role: 'admin', total: 1 }] });
      await User.countByRole();
      await User.countByStatus();
      expect(pool.query).toHaveBeenCalledTimes(2);
    });
  });
});