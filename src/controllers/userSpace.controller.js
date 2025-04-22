const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { userSpaceService } = require('../services');
const fs = require('fs');

const addSpace = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  };
  const existUserSpace = await userSpaceService.getSpace(req.user.id);
  if (existUserSpace) {
    throw new ApiError(httpStatus.CONFLICT, 'Each user can only create one user space.');
  }
  const userSpace = await userSpaceService.addSpace(payload);
  /** taging file for specific userSpaceId */
  if (userSpace) {
    try {
      const directory = `./public/uploads/${req.user.id}`;
      fs.readdirSync(directory).forEach(async (file) => {
        let extFile = file.split('.').pop();
        let currentFilename = file.split('.').shift();
        if (req.body.profilePicture == currentFilename) {
          fs.rename(`${directory}/${file}`, `${directory}/${currentFilename}-${userSpace.id}.${extFile}`, (err) => {
            if (err) console.log('Error Rename file', err);
          });

          const updateImage = {
            profilePicture: `${currentFilename}-${userSpace.id}.${extFile}`,
          };
          await userSpaceService.updateSpace(req.user.id, updateImage);
        }
      });
      userSpace.profilePicture = `profilePicture-${userSpace.id}`;
    } catch (error) {
      // Handle the ENOENT error
      if (error.code === 'ENOENT') {
        console.error(`Directory not found: ${error.message}`);
        // You can also respond with an appropriate error message if this is an API
        // return res.status(404).json({ message: 'Directory not found.' });
      } else {
        console.log('sini');
        // Handle other types of errors
        console.error('An error occurred:', error.message);
      }
    }
  }

  res.status(httpStatus.CREATED).send(userSpace);
});

const getSpace = catchAsync(async (req, res) => {
  const result = await userSpaceService.getSpace(req.user.id);
  res.send(result);
});

const updateSpace = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    updatedBy: req.user.id,
  };
  const userSpace = await userSpaceService.updateSpace(req.user.id, payload);
  res.send(userSpace);
});

const updatePicture = catchAsync(async (req, res) => {
  res.status(httpStatus.CREATED).send();
});

module.exports = {
  getSpace,
  addSpace,
  // editSpace,
  updateSpace,
  updatePicture,
};
