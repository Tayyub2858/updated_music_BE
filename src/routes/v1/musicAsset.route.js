const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const shareMusicValidation = require('../../validations/shareMusic.validation');
const shareMusicController = require('../../controllers/shareMusic.controller');

const router = express.Router();

router.route('/').post(auth('user'),shareMusicController.shareAsset);
router.route('/').get(auth('user', "recruiter"), shareMusicController.getAssets);
router.route('/:id').get(auth('user', "recruiter"), shareMusicController.getAssetsById)
router.route('/cart/:id').post(auth('user', 'recruiter'), shareMusicController.addToCart)
router.route('/my/cart').get(auth('user', 'recruiter'), shareMusicController.getCart)
router.route('/delete/cart/:assetId').delete(auth('user', 'recruiter'), shareMusicController.deleteCart)
router.route('/add/sale').post(auth('user', 'recruiter'), shareMusicController.finalItem)
router.route('/get/sales').get(auth('user', 'recruiter'), shareMusicController.getSales)

module.exports = router;
