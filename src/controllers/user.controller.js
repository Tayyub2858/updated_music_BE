const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const User = require('../models/user.model'); // Import User model

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});


// Follow a user
const followUser = async (req, res) => {
  try {
    const userIdToFollow = req.params.userId; // The user being followed
    const currentUserId = req.user.id; // The currently authenticated user

    if (userIdToFollow === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Find the current user and the user to follow
    const currentUser = await userService.getUserById(currentUserId);
    const userToFollow = await userService.getUserById(userIdToFollow);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    // Check if the user is already following the other user
    if (currentUser.following.includes(userIdToFollow)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // Add the user to the following list
    currentUser.following.push(userIdToFollow);
    await currentUser.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error following user' });
  }
};

const getMyFollowing = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Get the current user id from the auth middleware

    // Find the current user by ID to get the following list (which is an array of user IDs)
    const currentUser = await userService.getUserById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the following user IDs (an array of ObjectIds)
    const followingUserIds = currentUser.following;

    if (!followingUserIds || followingUserIds.length === 0) {
      return res.status(200).json({ following: [] }); // No users to follow
    }

    // Fetch the details of users being followed by the current user
    const followingUsers = await User.find({ '_id': { $in: followingUserIds } })
      .select('name email'); // Select only name and email fields

    // Return the populated data
    res.status(200).json({ following: followingUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching following list' });
  }
};


module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  followUser,
  getMyFollowing
};
