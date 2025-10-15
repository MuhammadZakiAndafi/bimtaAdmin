const multer = require('multer');

// Gunakan memory storage karena akan langsung upload ke Supabase
const storage = multer.memoryStorage();

// Filter untuk foto (hanya image)
const photoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar'), false);
  }
};

// Filter untuk dokumen (hanya PDF)
const documentFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa PDF'), false);
  }
};

const uploadPhoto = multer({
  storage: storage,
  fileFilter: photoFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

const uploadDocument = multer({
  storage: storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB untuk dokumen
  }
});

module.exports = {
  uploadPhoto,
  uploadDocument,
};