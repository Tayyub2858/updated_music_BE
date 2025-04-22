const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = './public/uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);  // Folder to save images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);  // Allow the file
  } else {
    cb(new Error('Only image files are allowed'));  // Reject the file with an error
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 8 * 1024 * 1024 },  
  fileFilter: fileFilter,
});

module.exports = upload;
