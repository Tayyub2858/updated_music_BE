const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const { PassThrough } = require('stream');

// AWS SDK v3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const allowedMimes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
];

// Multer memory storage (we manually upload to S3 later)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: function (req, file, cb) {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type!'), false);
    }
  },
});

// Upload file to S3 manually
async function uploadFileToS3(file, userId = 'anonymous') {
  const fileExt = path.extname(file.originalname);
  let folder = 'music/others';

  if (file.fieldname === 'musicImage') folder = 'music/images';
  if (file.fieldname === 'musicAudio') folder = 'music/audio';
  if (file.fieldname === 'musicBackground') folder = 'music/backgrounds';

  const filename = `${Date.now()}-${file.originalname}`;
  const key = `${folder}/${userId}/${filename}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: 'public-read',
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return {
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    key,
  };
}

module.exports = {
  upload, // for use in routes like upload.single('musicAudio')
  uploadFileToS3,
};
