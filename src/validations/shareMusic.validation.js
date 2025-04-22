const Joi = require('joi');
const { objectId } = require('./custom.validation');

const shareAsset = {
  body: Joi.object({
    songName: Joi.string().required(),
    myRole: Joi.array().items(Joi.string().valid('composer', 'lyricist', 'arranger', 'producer')).required(),
    creationTime: Joi.string().required(), // assumes ISO date format (e.g., "2023-03-21")
    musicImage: Joi.string().required(),
    music: Joi.string().required(),
    musicUsage: Joi.string().optional(),
    musicStyle: Joi.string().optional(),
    musicMood: Joi.string().optional(),
    personalUse: Joi.boolean().required(),
    personalUsePrice: Joi.string().allow('').optional(), // allow empty if price is not needed
    commercialUse: Joi.boolean().required(),
    commercialUsePrice: Joi.string().allow('').optional(),
    collaborationContact: Joi.boolean().required(),
    musicInstrument: Joi.string().optional(),
    tags: Joi.string().optional(),
    description: Joi.string().required(),
    softwareTool: Joi.string().optional(),
  }),
};

const getAssets = {};

const shareCreation = {
  body: Joi.object({
    musicName: Joi.string().required().messages({ 'any.required': 'Music name is required.' }),
    myRole: Joi.array()
      .items(Joi.string().valid('composer', 'lyricist', 'arranger', 'producer'))
      .min(1)
      .required()
      .messages({
        'array.min': 'You must select at least one role.',
        'any.required': 'Role is required.',
      }),
    singerName: Joi.string().optional().allow(''),
    publisher: Joi.string().optional().allow(''),
    songLanguage: Joi.string().optional().allow(''),
    musicUsage: Joi.string().optional().allow(''),
    musicStyle: Joi.string().optional().allow(''),
    musicMood: Joi.string().optional().allow(''),
    musicImage: Joi.string().optional().allow(''),
    music: Joi.string().optional().allow(''),
    musicLyric: Joi.string().optional().allow(''),
    musicPlaybackBackground: Joi.string().optional().allow(''),
    musicInstrument: Joi.string().optional().allow(''),
    // musicImage: Joi.string().required().messages({ 'any.required': 'Music image is required.' }),
    // music: Joi.string().required().messages({ 'any.required': 'Music file is required.' }),
    // musicLyric: Joi.string().required().messages({ 'any.required': 'Music lyrics are required.' }),
    // musicPlaybackBackground: Joi.string().required().messages({ 'any.required': 'Playback background is required.' }),
    // musicInstrument: Joi.string().optional().allow(''),
    tags: Joi.string().optional().allow(''),
    description: Joi.string().required().messages({ 'any.required': 'Description is required.' }),
    softwareTool: Joi.string().optional().allow(''),
  }),
};

const getCreation = {};

module.exports = {
  shareAsset,
  getAssets,
  shareCreation,
  getCreation,
};
