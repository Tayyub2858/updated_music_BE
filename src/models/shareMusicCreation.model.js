const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const musicCreationSchema = new mongoose.Schema(
  {
    musicName: {
      type: String,
      required: [true, 'Music name is required.'],
    },
    myRole: {
      type: [String],
      enum: ['composer', 'lyricist', 'arranger', 'producer'],
      required: [true, 'Role is required.'],
      validate: {
        validator: (array) => array.length > 0,
        message: 'You must select at least one role.',
      },
    },
    singerName: {
      type: String,
      default: '',
    },
    publisher: {
      type: String,
      default: '',
    },
    songLanguage: {
      type: String,
      default: '',
    },
    musicUsage: {
      type: String,
      default: '',
    },
    musicStyle: {
      type: String,
      default: '',
    },
    musicMood: {
      type: String,
      default: '',
    },
    musicImage: {
      type: String,
      default: '',
      // required: [true, 'Music image is required.'],
    },
    music: {
      type: String,
      default: '',
      // required: [true, 'Music file is required.'],
    },
    musicLyric: {
      type: String,
      default: '',
      // required: [true, 'Music lyrics are required.'],
    },
    musicPlaybackBackground: {
      type: String,
      default: '',
      // required: [true, 'Playback background is required.'],
    },
    musicInstrument: {
      type: String,
      default: '',
    },
    tags: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
    },
    softwareTool: {
      type: String,
      default: '',
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
  { timestamps: true }
);
module.exports = mongoose.model('ShareMusicCreation', musicCreationSchema);

// add plugin that converts mongoose to json
musicCreationSchema.plugin(toJSON);
musicCreationSchema.plugin(paginate);

/**
 * @typedef Job
 */
const ShareMusicCreation = mongoose.model('ShareMusicCreation', musicCreationSchema);

module.exports = ShareMusicCreation;
