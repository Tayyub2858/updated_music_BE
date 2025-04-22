const express = require('express');

const auth = require('../../middlewares/auth');

const uploadController = require('../../controllers/upload.controller');
const { uploadDynamic } = require('../../middlewares/upload');

const router = express.Router();

router.route('/profile').post(auth('user'), uploadDynamic.single('profilePicture'), uploadController.uploadImage);
router.route('/music-image').post(auth('user'), uploadDynamic.single('musicImage'), uploadController.uploadImage);
router.route('/music-background').post(auth('user'), uploadDynamic.single('musicBackground'), uploadController.uploadImage);

module.exports = router;