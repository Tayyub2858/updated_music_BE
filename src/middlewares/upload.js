// const util = require('util');
// const multer = require('multer');
// const maxSize = 30 * 1024 * 1024; //2mb
// const fs = require('fs');
// const readdir = util.promisify(fs.readdir);
// const unlink = util.promisify(fs.unlink);

// const uploadDynamic = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       const directory = `./public/uploads/${req.user.id}`;
//       console.log('direc');

//       if (!fs.existsSync(directory)) {
//         fs.mkdirSync(directory, { recursive: true });
//       }

//       cb(null, directory);
//     },
//     filename: async (req, file, cb) => {
//       // const validateFile = await checkFileType(file);
//       const validateFile = file;
//       const directory = `./public/uploads/${req.user.id}`;
//       const fileType = file.originalname.split('.').pop();
//       const fileName = file.fieldname;
//       console.log(file);
//       const fileDiretory = `${directory}/${fileName}`;
//       console.log('valid');
//       if (validateFile) {
//         await readdir(directory, function (err, files) {
//           if (err) {
//             console.log('error read directory files while upload');
//             console.log(err);
//           }

//           if (files.length >= 1) {
//             files.forEach(async (file) => {
//               let extFile = file.split('.').pop();
//               let existFilename = file.split('.').shift();
//               if (existFilename == fileName) {
//                 await unlink(`${fileDiretory}.${extFile}`);
//               }
//             });
//           }

//           cb(null, `${fileName}.${fileType}`);
//         });
//       } else {
//         cb(new Error(`Unacceptable file ${fileName} format`), false);
//       }
//     },
//   }),
//   limits: { fileSize: maxSize },
// });

// const checkFileType = async (file) => {
//   const filetypes = /jpeg|jpg|png/;
//   const fileType = file.originalname.split('.').pop();
//   const extname = filetypes.test(fileType.toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return true;
//   } else {
//     return false;
//   }
// };

// // let uploadFile = util.promisify(uploadDynamic);
// module.exports = {
//   uploadDynamic,
// };


// utils/uploadDynamic.js

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');

const maxSize = 30 * 1024 * 1024; // 30MB

// AWS SDK v3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Allow only image and audio formats
const allowedMimes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
];

// Multer memory storage
const uploadDynamic = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  },
});

// Helper function to upload a file to S3
async function uploadFileToS3(file, userId = 'anonymous') {
  const ext = path.extname(file.originalname);
  const fileName = file.fieldname;
  let folder = 'uploads/others';

  if (file.fieldname === 'musicImage') folder = 'uploads/images';
  else if (file.fieldname === 'musicAudio') folder = 'uploads/audio';
  else if (file.fieldname === 'musicBackground') folder = 'uploads/backgrounds';

  const finalFileName = `${Date.now()}-${file.originalname}`;
  const key = `${folder}/${userId}/${finalFileName}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(params));

  return {
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    key,
  };
}

module.exports = {
  uploadDynamic,       // use in routes: uploadDynamic.fields([{ name: 'musicImage' }, ...])
  uploadFileToS3,      // call manually in your controller for each file
};
