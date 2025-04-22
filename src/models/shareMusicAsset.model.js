const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const shareMusicAssetSchema = new mongoose.Schema(
  {
    songName: { type: String, required: true },
    myRole: {
      type: [String],
      required: true,
      enum: ['composer', 'lyricist', 'arranger', 'producer'],
    },
    creationTime: { type: String, required: true }, // can be Date if ISO date format expected
    musicImage: { type: String, required: true },
    music: { type: String, required: true },
    musicUsage: { type: String },
    musicStyle: { type: String },
    musicMood: { type: String },
    personalUse: { type: Boolean, required: true },
    personalUsePrice: { type: String, default: '' },
    commercialUse: { type: Boolean, required: true },
    commercialUsePrice: { type: String, default: '' },
    collaborationContact: { type: Boolean, required: true },
    musicInstrument: { type: String },
    tags: { type: String },
    description: { type: String, required: true },
    softwareTool: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
); // includes createdAt and updatedAt fields

module.exports = mongoose.model('ShareMusicAsset', shareMusicAssetSchema);

// add plugin that converts mongoose to json
shareMusicAssetSchema.plugin(toJSON);
shareMusicAssetSchema.plugin(paginate);

/**
 * @typedef Job
 */
const ShareMusicAsset = mongoose.model('ShareMusicAsset', shareMusicAssetSchema);

module.exports = ShareMusicAsset;
