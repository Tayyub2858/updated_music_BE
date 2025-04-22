const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userSpaceValidation = require('../../validations/userSpace.validation');
const userSpaceController = require('../../controllers/userSpace.controller');

const router = express.Router();

router.route('/').get(auth('user'), validate(userSpaceValidation.getSpace), userSpaceController.getSpace);
router.route('/add').post(auth('user'), validate(userSpaceValidation.addSpace), userSpaceController.addSpace);
// router.route('/edit').get(auth('users'), validate(userSpaceValidation.editSpace), userSpaceController.uploadMusic);
router.route('/update').patch(auth('user'), validate(userSpaceValidation.updateSpace), userSpaceController.updateSpace);
// router
//   .route('/:userId')
//   .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
//   .patch(auth('admin'), validate(userValidation.updateUser), userController.updateUser)
//   .delete(auth('admin'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
