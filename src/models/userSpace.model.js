const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

// firstName: Joi.string().required(),
// lastName: Joi.string().required(),
// occupation: Joi.string().required(),
// musicCultureRegion: Joi.array().items(Joi.string()).required(),
// hiring: Joi.array().items(Joi.string()).required(),
// company: Joi.string().required(),
// location: Joi.string().required(),
// state: Joi.string().required(),
// city: Joi.string().required(),
// websiteUrl: Joi.string(),
// aboutMe: Joi.string().required(),
// softwareTool: Joi.string(),
// profilePicture: Joi.string(),

const userSpaceSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    creationOccupation: {
      type: [String],
      enum: ['composer', 'lyricist', 'arranger', 'producer', 'singer'],
      required: true,
    },
    businessOccupation: {
      type: [String],
      required: true,
    },
    hiring: {
      type: Boolean,
    },
    collaborationLyricsLangs: {
      type: [String],
      required: true,
    },
    proficientMusicStyles: {
      type: [String],
      required: true,
    },
    skilledInstruments: {
      type: [String],
      required: true,
    },
    collaboratedSingers: {
      type: String,
      required: true,
    },
    collaboratedPublisher: {
      type: String,
      required: true,
    },
    companyOrStudio: {
      type: String,
      required: true,
    },
    websiteUrl: {
      type: String,
    },
    aboutMe: {
      type: String,
      required: true,
    },
    softwareTool: {
      type: String,
    },
    appleMusic: {
      type: String,
    },
    spotify: {
      type: String,
    },
    bandcam: {
      type: String,
    },
    soundCloud: {
      type: String,
    },
    x: {
      type: String,
    },
    facebook: {
      type: String,
    },
    iHeartRadio: {
      type: String,
    },
    Genius: {
      type: String,
    },
    location: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    profilePicture: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSpaceSchema.plugin(toJSON);
userSpaceSchema.plugin(paginate);

/**
 * @typedef UserSpace
 */
const UserSpace = mongoose.model('UserSpace', userSpaceSchema);

module.exports = UserSpace;
