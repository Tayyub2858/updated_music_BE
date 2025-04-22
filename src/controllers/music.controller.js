const httpStatus = require('http-status');
const pick = require('../utils/pick');
const regexFilter = require('../utils/regexFilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { musicService } = require('../services');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const Music = require('../models/music.model');
const User = require('../models/user.model'); // Import User model
const { uploadFileToS3 } = require('../utils/s3Upload');

const uploadMusic = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const userName = req.user.name;
  const files = req.files;

  const uploadedUrls = {};

  // Upload files to S3
  for (const field in files) {
    const file = files[field][0];
    const { url } = await uploadFileToS3(file, userId);
    uploadedUrls[field] = url;
  }

  // Prepare payload for DB
  const payload = {
    ...req.body,
    createdBy: userId,
    userName: userName,
    musicImage: uploadedUrls.musicImage || null,
    musicAudio: uploadedUrls.musicAudio || null,
    musicBackground: uploadedUrls.musicBackground || null,
  };

  // Save metadata in DB
  const music = await musicService.uploadMusic(payload);

  // Return response
  res.status(httpStatus.CREATED).send(music);
});

const uploadLyrics = catchAsync(async (req, res) => {
  const userId = req.user?.id || 'anonymous';
  const files = req.files;
  const uploaded = {};

  // Upload each file field (e.g., musicImage) to S3
  for (const field in files) {
    const file = files[field][0]; // assuming maxCount: 1
    const s3Response = await uploadFileToS3(file, userId);
    uploaded[field] = s3Response.url;
  }

  // Construct the final payload
  const payload = {
    ...req.body,
    createdBy: userId,
    userName: req.user?.name,
    musicImage: uploaded.musicImage || null,
    musicAudio: uploaded.musicAudio || null,
    musicBackground: uploaded.musicBackground || null,
  };

  const lyrics = await musicService.uploadLyrics(payload);
  res.status(httpStatus.CREATED).send(lyrics);
});

const getMusicBox = catchAsync(async (req, res) => {
  const filter = regexFilter(req.query, ['songName', 'singerName', 'userName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await musicService.queryMusicBox(filter, options);
  res.send(result);

});


const getMusicById = catchAsync(async (req, res) => {
  const result = await musicService.getMusicById(req.params.id)
  res.send(result)
})


const getMyMusic = catchAsync(async (req, res) => {
  const music = await musicService.getMyMusic(req.user.id);
  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Music not found');
  }
  res.send(music);
});

const getPopUpPage = catchAsync(async (req, res) => {
  console.log('req.params.musicId:', req.params.musicId);
  const music = await musicService.getMusicById(req.params.musicId);
  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Music not found');
  }
  const filter = {
    musicStyle: music.musicStyle,
    _id: { $ne: new ObjectId(music.id || music._id) },
  };
  const recommendation = await musicService.getMusicByGenre(filter);
  res.send({
    music: music,
    recommendation: recommendation,
  });
});

const deleteMusic = catchAsync(async (req, res) => {
  const { musicId } = req.params;

  const music = await musicService.getMusicById(musicId);

  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Music not found');
  }

  const directory = `./public/uploads/${req.user.id}`;

  if (music.musicImage) {
    const imagePath = `${directory}/${music.musicImage}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  if (music.musicAudio) {
    const audioPath = `${directory}/${music.musicAudio}`;
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }

  if (music.musicBackground) {
    const backgroundPath = `${directory}/${music.musicBackground}`;
    if (fs.existsSync(backgroundPath)) {
      fs.unlinkSync(backgroundPath);
    }
  }

  await musicService.deleteMusic(musicId);

  res.status(httpStatus.OK).send({
    message: 'Music deleted successfully',  // Success message
  });
});

const updateMusic = catchAsync(async (req, res) => {
  const { musicId } = req.params;

  const music = await musicService.getMusicById(musicId);
  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Music not found');
  }

  const updateData = { ...req.body };

  const directory = `./public/uploads/${req.user.id}`;

  if (req.files['musicImage']) {
    if (music.musicImage) {
      const oldImagePath = `${directory}/${music.musicImage}`;
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    updateData.musicImage = req.files['musicImage'][0].path;
  }

  if (req.files['musicAudio']) {
    if (music.musicAudio) {
      const oldAudioPath = `${directory}/${music.musicAudio}`;
      if (fs.existsSync(oldAudioPath)) {
        fs.unlinkSync(oldAudioPath);
      }
    }
    updateData.musicAudio = req.files['musicAudio'][0].path;
  }

  if (req.files['musicBackground']) {
    if (music.musicBackground) {
      const oldBackgroundPath = `${directory}/${music.musicBackground}`;
      if (fs.existsSync(oldBackgroundPath)) {
        fs.unlinkSync(oldBackgroundPath);
      }
    }
    updateData.musicBackground = req.files['musicBackground'][0].path;
  }

  const updatedMusic = await musicService.updateMusic(musicId, updateData);

  res.status(httpStatus.OK).send(updatedMusic);
});

const likeMusic = async (req, res) => {
  const { musicId } = req.params; // Get the song ID from the request parameters
  const currentUserId = req.user.id; // Get the current user's ID from the request (assuming it's available in req.user)

  try {
    // Find the song by its ID
    const song = await Music.findById(musicId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Find the current user
    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the song is already liked by the user
    if (song.likes.includes(currentUserId)) {
      return res.status(400).json({ message: 'Song already liked' });
    }

    // Add the current user's ID to the likes array on the song
    song.likes.push(currentUserId);
    await song.save();

    // Add the song to the likedSongs array for the user
    user.likedSongs.push(musicId);
    await user.save();

    // Respond with a success message
    res.status(200).json({
      message: 'Song liked successfully',
      user: {
        name: user.name,
        email: user.email
      },
      likedSongs: user.likedSongs,
      songLikes: song.likes.length // Show the number of users who liked the song
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error liking song' });
  }
};

module.exports = { likeMusic };



const commentOnMusic = catchAsync(async (req, res) => {
  const { musicId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  const music = await musicService.getMusicById(musicId);
  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Music not found');
  }

  const newComment = {
    userId,
    comment,
    createdAt: new Date(),
  };

  music.comments.push(newComment);
  await music.save();

  res.status(httpStatus.CREATED).send({ message: 'Comment added successfully', comment: newComment });
});



const addRating = async (req, res) => {
  const { musicId } = req.params; // Get musicId from URL parameter
  const { rating } = req.body;    // Get rating from request body
  const userId = req.user.id;     // Assuming user authentication has been done and user ID is available

  console.log('Rating value:', rating);
  // Validate the rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    // Convert musicId to ObjectId before querying
    const music = await musicService.getMusicById(musicId);

    console.log('musicId:', musicId)
    console.log('music:', music);
    if (!music) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const existingRating = music.ratings.find(r => r.userId.toString() === userId);

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.createdAt = Date.now(); // Update the timestamp
    } else {
      music.ratings.push({ userId, rating });
    }

    // Save the updated music document
    await music.save();

    const averageRating = music.calculateAverageRating();

    res.status(200).json({
      message: 'Rating added successfully',
      averageRating,
      ratings: music.ratings, // Return the updated list of ratings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while adding rating' });
  }
};

const getLikedSongs = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find the current user and populate the liked songs
    const currentUser = await User.findById(currentUserId)
      .populate('likedSongs', 'songName singerName') // Populate liked songs with specific fields
      .select('name email'); // Return user fields like name and email


    console.log('Current user:', currentUser);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user has no liked songs, return an empty array
    if (!currentUser.likedSongs || currentUser.likedSongs.length === 0) {
      return res.status(200).json({ likedSongs: [] });
    }

    // Return the list of liked songs
    res.status(200).json({
      likedSongs: currentUser.likedSongs, // This will include populated songName, singerName, etc.
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching liked songs' });
  }
};

module.exports = {
  uploadMusic,
  uploadLyrics,
  getMusicBox,
  getPopUpPage,
  deleteMusic,
  updateMusic,
  getMusicById,
  commentOnMusic,
  likeMusic,
  addRating,
  getLikedSongs,
  getMyMusic
};
