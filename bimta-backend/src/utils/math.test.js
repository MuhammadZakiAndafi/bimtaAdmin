// Impor fungsi yang ingin Anda tes
const { add, subtract } = require('./math');

// 'describe' mengelompokkan tes-tes terkait
describe('Fungsi Matematika', () => {

  // 'test' atau 'it' adalah unit tes individual
  test('Fungsi add harus menjumlahkan dua angka', () => {
    // 'expect' adalah ekspektasi Anda
    // '.toBe' adalah "matcher" (hasil yang diharapkan)
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 10)).toBe(9);
    expect(add(0, 0)).toBe(0);
  });

  test('Fungsi subtract harus mengurangkan dua angka', () => {
    expect(subtract(10, 5)).toBe(5);
    expect(subtract(5, 10)).toBe(-5);
  });

});