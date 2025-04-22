const httpStatus = require('http-status');
const pick = require('../utils/pick');
const regexFilter = require('../utils/regexFilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { jobService, musicService } = require('../services');
const { Job } = require('../models');
//const upload = require('../config/multer');  

const postJob = catchAsync(async (req, res) => {

  console.log('Req.body in application post job:', req.body);
  const avatarPath = req.body.applicantAvatar || null;
  const backgroundImagePath = req.body.applicantBackgroundImage || null;

  const createdBy = req.user.id;

  // Prepare payload for job creation
  const payload = {
    ...req.body,
    createdBy,
    avatar: avatarPath,
    backgroundImage: backgroundImagePath,
    createdOn: new Date(),
  };

  const job = await jobService.postJob(payload);
  res.status(httpStatus.CREATED).send(job);
});

const getJobs = catchAsync(async (req, res) => {
  const likeFilter = regexFilter(req.query, ['projectTitle']);
  const pickFilter = pick(req.query, ['preferredLocation', 'category']);

  const categoryFilter = Array.isArray(pickFilter.category) ? pickFilter.category : [];

  const filter = {
    ...likeFilter,
    ...pickFilter,
    category: categoryFilter.length > 0 ? { $in: categoryFilter } : undefined,
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await jobService.queryJobs(filter, options);
  console.log('Result:', result);
  res.send(result);
});

// const saveJob = catchAsync(async (req, res) => {
//   const job = await Job.findById(req.params.jobId);
//   if(job.savedBy.includes(req.user.id)) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Job already saved');
//   }
//   const savedJob = await Job.findByIdAndUpdate(
//     req.params.jobId,
//     { $push: { savedBy: req.user.id } },
//     { new: true }
//   );
  
//   if (!savedJob) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
//   }
 

//   // console.log(job , 'job after saving');
//   res.send(savedJob);
// });

const saveJob = catchAsync(async (req, res) => {
  const { jobId } = req.params;

  // Use $addToSet to ensure the user ID is added only once
  const savedJob = await Job.findByIdAndUpdate(
    jobId,
    { $addToSet: { savedBy: req.user.id } }, // $addToSet avoids duplicates
    { new: true }
  );

  if (!savedJob) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }

  res.send(savedJob);
});


const getMyJobs = catchAsync(async (req, res) => {
  console.log(req.user.id)
  const result = await jobService.getMyJobs(req.user.id);
  res.send(result);
})



const changeJobStatus = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { status } = req.body;
  const updatedJob = await jobService.changeJobStatus(jobId, status);
  res.send(updatedJob);
})


const getJob = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const result = await jobService.getJobs(page, limit);
  res.send(result);
});


const getJobById = catchAsync(async (req, res) => {
  const job = await jobService.getJobById(req.params.jobId);
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  res.send(job);
});

const applyJob = catchAsync(async (req, res) => {
  const payload = {
    ...req.body.applyJob,
    createdBy: req.user.id, // Associate the application with the current user
  };

  // Check if the user has already applied for the job
  const existingApplication = await jobService.getApplicationByJobIdAndUserId(
    req.body.applyJob.jobId,
    req.user.id
  );

  if (existingApplication) {
    return res.status(httpStatus.CONFLICT).send({
      message: 'You already applied to this job',
    });
  }

  // Verify all music IDs exist
  for (const musicId of payload.musicIds) {
    const music = await musicService.getMusicById(musicId);
    if (!music) {
      throw new ApiError(httpStatus.NOT_FOUND, 'There is some Music that cannot be found');
    }
  }

  // Apply for the job
  const appliedJob = await jobService.applyJob(payload);
  res.status(httpStatus.CREATED).send(appliedJob);
});

const getAppliedJobs = catchAsync(async (req, res) => {
  const result = await jobService.getAppliedJobs(req.user.id);
  res.status(httpStatus.OK).send(result);
});


const deleteJob = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const job = await jobService.getJobById(jobId);

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }

  if (job.createdBy.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to delete this job');
  }

  // Delete the job
  await jobService.deleteJob(jobId);

  res.status(httpStatus.OK).send({ message: 'Job deleted successfully' });
});

const updateJob = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const updateData = req.body;

  const job = await jobService.getJobById(jobId);

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }

  if (job.createdBy.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this job');
  }

  // Update the job
  const updatedJob = await jobService.updateJob(jobId, updateData);

  res.status(httpStatus.OK).send({ message: 'Job updated successfully', job: updatedJob });
});

module.exports = {
  postJob,
  getJobs,
  getJobById,
  applyJob,
  deleteJob,
  updateJob,
  getJob,
  saveJob,
  getMyJobs,
  changeJobStatus,
  getAppliedJobs
};
