const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta donde se guardan archivos temporalmente antes de subir a Supabase
const uploadDir = path.join(__dirname, '../uploads');

// Crear carpeta uploads si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Conserva el nombre original
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
