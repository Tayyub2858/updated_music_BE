const Joi = require('joi');

const getSpace = {};

const addSpace = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    creationOccupation: Joi.array().items(Joi.string().valid('composer', 'lyricist', 'arranger', 'producer','singer')).required(),
    businessOccupation: Joi.string().required(),
    hiring: Joi.boolean().required(),
    collaborationLyricsLangs: Joi.array().items(Joi.string()).required(),
    proficientMusicStyles: Joi.array().items(Joi.string()).required(),
    skilledInstruments: Joi.array().items(Joi.string()).required(),
    collaboratedSingers: Joi.string().required(),
    collaboratedPublisher: Joi.string().required(),
    websiteUrl: Joi.string(),
    companyOrStudio: Joi.string().required(),
    aboutMe: Joi.string().required(),
    softwareTool: Joi.string(),
    appleMusic: Joi.string(),
    spotify: Joi.string(),
    bandcam: Joi.string(),
    soundCloud: Joi.string(),
    x: Joi.string(),
    facebook: Joi.string(),
    iHeartRadio: Joi.string(),
    Genius: Joi.string(),
    location: Joi.string(),
    state: Joi.string(),
    city: Joi.string(),
    profilePicture: Joi.string(),
  }),
};

const editSpace = {};

const updateSpace = {
  body: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    creationOccupation: Joi.array().items(Joi.string().valid('composer', 'lyricist', 'arranger', 'producer', 'singer')),
    businessOccupation: Joi.string(),
    hiring: Joi.boolean(),
    collaborationLyricsLangs: Joi.array().items(Joi.string()),
    proficientMusicStyles: Joi.array().items(Joi.string()),
    skilledInstruments: Joi.array().items(Joi.string()),
    collaboratedSingers: Joi.string(),
    collaboratedPublisher: Joi.string(),
    companyOrStudio: Joi.string(),
    websiteUrl: Joi.string(),
    aboutMe: Joi.string(),
    softwareTool: Joi.string(),
    appleMusic: Joi.string(),
    spotify: Joi.string(),
    bandcam: Joi.string(),
    soundCloud: Joi.string(),
    x: Joi.string(),
    facebook: Joi.string(),
    iHeartRadio: Joi.string(),
    Genius: Joi.string(),
    location: Joi.string(),
    state: Joi.string(),
    city: Joi.string(),
    profilePicture: Joi.string(),
  }),
};

module.exports = {
  getSpace,
  addSpace,
  editSpace,
  updateSpace,
};
