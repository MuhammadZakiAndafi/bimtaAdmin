const pool = require('./database');

describe('Database Configuration Coverage', () => {
  let consoleLogSpy, consoleErrorSpy, exitSpy;

  beforeAll(() => {
    // Mocking console dan process.exit agar tidak menghentikan test runner
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test('harus mencakup baris pool.on(connect)', () => {
    // Memicu event 'connect' secara manual
    pool.emit('connect');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Database connected successfully'));
  });

  test('harus mencakup baris pool.on("error") dan process.exit', () => {
    const mockError = new Error('Koneksi Terputus');
    
    // Memicu event 'error' secara manual
    pool.emit('error', mockError);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unexpected error on idle client'),
      mockError
    );
    // Memastikan baris process.exit(-1) dijalankan
    expect(exitSpy).toHaveBeenCalledWith(-1);
  });

  test('harus mengekspor objek pool yang valid', () => {
    expect(pool).toBeDefined();
    expect(pool.options.max).toBe(20);
  });
});