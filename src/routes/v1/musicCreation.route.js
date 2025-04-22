const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const shareMusicValidation = require('../../validations/shareMusic.validation');
const shareMusicController = require('../../controllers/shareMusic.controller');

const router = express.Router();

router.route('/').post(auth('users'), validate(shareMusicValidation.shareCreation), shareMusicController.shareCreation);
router.route('/:id').get(auth('user', 'recruiter'), validate(shareMusicValidation.getCreation), shareMusicController.getCreationbyId);
router.route('/').get(auth('user', 'recruiter'), validate(shareMusicValidation.getCreation), shareMusicController.getCreation);

// router
//   .route('/:userId')
//   .get(auth('admin'), validate(userValidation.getUser), userController.getUser)
//   .patch(auth('admin'), validate(userValidation.updateUser), userController.updateUser)
//   .delete(auth('admin'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
