// const express = require('express');
// const auth = require('../../middlewares/auth');
// const validate = require('../../middlewares/validate');
// const musicValidation = require('../../validations/music.validation');
// const musicController = require('../../controllers/music.controller');
// const recommendationController = require('../../controllers/recommendation.controller');
// const multer = require('multer');
// const fs = require('fs');
// const router = express.Router();

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadDir = `./public/uploads/${req.user.id || null}`;
//         fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir, { recursive: true });
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         const fileExt = file.mimetype.split('/')[1];
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 50 * 1024 * 1024 },
//     fileFilter: (req, file, cb) => {
//         cb(null, true);
//     }
// });

// router.route('/upload').post(auth('user'),
//     upload.fields([
//         { name: 'musicImage', maxCount: 1 },
//         { name: 'musicAudio', maxCount: 1 },
//         { name: 'musicBackground', maxCount: 1 }
//     ]), musicController.uploadMusic);

// // post lyrics Musics 
// router.route('/lyrics').post(
//     auth('user'),
//     upload.fields([{ name: "musicImage", maxCount: 1 }]),
//     musicController.uploadLyrics
// ); 


// router.route('/small-box').get(auth('user'), validate(musicValidation.getMusicBox), musicController.getMusicBox);
// router.route('/get-music').get(auth('user', 'recruiter'), musicController.getMyMusic);
// router.route('/get-music/:id').get(auth('user'), validate(musicValidation.getMusicById), musicController.getMusicById)
// router.route('/pop-up-page/:musicId').get(auth('user'), musicController.getPopUpPage);
// router.route('/delete-music/:musicId').delete(auth('user'), musicController.deleteMusic);
// router.route('/update-music/:musicId').put(
//     auth('user'),
//     upload.fields([
//         { name: 'musicImage', maxCount: 1 },
//         { name: 'musicAudio', maxCount: 1 },
//         { name: 'musicBackground', maxCount: 1 }
//     ]),
//     musicController.updateMusic
// );

// // Routes for like and comment functionality
// router.route('/like/:musicId').post(auth('user'), musicController.likeMusic);
// router.route('/comment/:musicId').post(auth('user'), validate(musicValidation.commentMusic), musicController.commentOnMusic);
// router.route('/foryou').get(auth('user'), recommendationController.getRecommendations);
// router.route('/rating/:musicId').post(auth('user'), musicController.addRating);
// router.route('/liked-songs')
//     .get(auth('user'), musicController.getLikedSongs);

// module.exports = router;


const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const musicValidation = require('../../validations/music.validation');
const musicController = require('../../controllers/music.controller');
const recommendationController = require('../../controllers/recommendation.controller');
const { upload } = require('../../utils/s3Upload');
const router = express.Router();

// Upload music files to S3
router.route('/upload').post(
    auth('user'),
    upload.fields([
        { name: 'musicImage', maxCount: 1 },
        { name: 'musicAudio', maxCount: 1 },
        { name: 'musicBackground', maxCount: 1 },
    ]),
    musicController.uploadMusic
);

// Upload lyrics with image
router.route('/lyrics').post(
    auth('user'),
    upload.fields([{ name: 'musicImage', maxCount: 1 }]),
    musicController.uploadLyrics
);

// Music data routes
router.route('/small-box').get(auth('user'), validate(musicValidation.getMusicBox), musicController.getMusicBox);
router.route('/get-music').get(auth('user', 'recruiter'), musicController.getMyMusic);
router.route('/get-music/:id').get(auth('user'), validate(musicValidation.getMusicById), musicController.getMusicById);
router.route('/pop-up-page/:musicId').get(auth('user'), musicController.getPopUpPage);
router.route('/delete-music/:musicId').delete(auth('user'), musicController.deleteMusic);

// Update music on S3
router.route('/update-music/:musicId').put(
    auth('user'),
    upload.fields([
        { name: 'musicImage', maxCount: 1 },
        { name: 'musicAudio', maxCount: 1 },
        { name: 'musicBackground', maxCount: 1 },
    ]),
    musicController.updateMusic
);

// Like, Comment, Recommendation, Rating
router.route('/like/:musicId').post(auth('user'), musicController.likeMusic);
router.route('/comment/:musicId').post(auth('user'), validate(musicValidation.commentMusic), musicController.commentOnMusic);
router.route('/foryou').get(auth('user'), recommendationController.getRecommendations);
router.route('/rating/:musicId').post(auth('user'), musicController.addRating);
router.route('/liked-songs').get(auth('user'), musicController.getLikedSongs);

module.exports = router;

