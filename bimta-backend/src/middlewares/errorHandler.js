const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Ukuran file terlalu besar',
    });
  }

  // PostgreSQL error
  if (err.code === '23505') {
    return res.status(400).json({
      success: false,
      message: 'Data sudah ada (duplikat)',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Data yang direferensikan tidak ditemukan',
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
  });
};

module.exports = errorHandler;