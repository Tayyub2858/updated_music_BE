const httpStatus = require('http-status');
const { Music, LyricsMusic } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} musicBody
 * @returns {Promise<User>}
 * 
 * @param {Object} lyricBody
 * @returns {Promise<User>}
 */
const uploadMusic = async (musicBody) => {
  return Music.create(musicBody);
};

const uploadLyrics = async(lyricBody) =>{
  return LyricsMusic.create(lyricBody);
}
/**
 * Query for music box
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMusicBox = async (filter, options) => {
  const musicBox = await Music.paginate(filter, options);
  return musicBox;
};

/**
 * Get music by id
 * @param {ObjectId} id
 * @returns {Promise<Music>}
 */
const getMusicById = async (id) => {
  return Music.findById(id);
};

/**
 * Get music recommendation by music genre
 * @param {string} genre
 * @returns {Promise<Music>}
 */
const getMusicByGenre = async (filter) => {
  return Music.find(filter);
};


/**
 * Update music by id
 * @param {ObjectId} musicId
 * @param {Object} updateBody
 * @returns {Promise<Music>}
 */
const updateMusic = async (musicId, updateBody) => {
  const music = await Music.findById(musicId);
  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Music not found');
  }

  // Apply updates to the music object
  Object.assign(music, updateBody);

  // Save the updated music document
  await music.save();

  return music;
};


const deleteMusic = async (musicId) => {
  const music = await Music.findByIdAndDelete(musicId);
  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Music not found');
  }
  return music;
};


const getMyMusic = async (userId) => {
  return Music.find({ createdBy : userId })
};

module.exports = {
  uploadMusic,
  uploadLyrics,
  queryMusicBox,
  getMusicById,
  getMusicByGenre,
  updateMusic,
  deleteMusic,
  getMyMusic
};
