const httpStatus = require('http-status');
const { Job, AppliedJobs } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a job
 * @param {Object} body
 * @returns {Promise<Job>}
 */
const postJob = async (body) => {
  return Job.create(body);
};

/**
 * Query for music box
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryJobs = async (filter, options) => {
  const jobs = await Job.paginate(filter, options);
  return jobs;
};

const getJobs = async (page, limit) => {
  const skip = (page - 1) * limit;

  const jobs = await Job.find()
    .select('applicantName applicantAvata status createdOn applicantBackgroundImage applicantSelectedSongs budget category createdAt createdBy cultureArea description isHaveLyric id lyricLanguage musicUse preferredLocation projectTitle timeFrame savedBy')
    .skip(skip)
    .limit(limit);


  const total = await Job.countDocuments();

  return {
    jobs,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalJobs: total
  };
};


/**
 * Get job by id
 * @param {ObjectId} id
 * @returns {Promise<Job>}
 */
const getJobById = async (id) => {
  return Job.findById(id);
};

/**
 * Apply a job
 * @param {Object} body
 * @returns {Promise<AppliedJobs>}
 */
const applyJob = async (body) => {
  return AppliedJobs.create(body);
};

/**
 * Delete a job by id
 * @param {ObjectId} jobId
 * @returns {Promise<void>}
 */
const deleteJob = async (jobId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }

  // Delete the job from the database
  await job.remove();
};

/**
 * Update a job by id
 * @param {ObjectId} jobId
 * @param {Object} updateData
 * @returns {Promise<Job>}
 */
const updateJob = async (jobId, updateData) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }

  Object.assign(job, updateData);
  await job.save();  // Save the updated job to the database

  return job;
};

const getMyJobs = async (userId) => {
  const jobs = await Job.find({ createdBy: userId });
  return jobs;
};


const changeJobStatus = async (jobId, status) => {
  const job = await Job.findByIdAndUpdate(
    jobId,
    { status: status },
    { new: true }
  );

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }

  return job;
};


const getAppliedJobs = async (userId) => {
  const appliedJobs = await AppliedJobs.find({ createdBy: userId });
  const jobIds = appliedJobs.map(job => job.jobId);
  const jobs = await Job.find({ _id: { $in: jobIds } });
  return jobs;
};

const getApplicationByJobIdAndUserId = async (jobId, userId) => {
  const application = await AppliedJobs.findOne({ jobId, createdBy: userId });
  return application;
};




module.exports = {
  postJob,
  queryJobs,
  getJobById,
  applyJob,
  deleteJob,
  updateJob,
  getJobs,
  getMyJobs,
  changeJobStatus,
  getAppliedJobs,
  getApplicationByJobIdAndUserId
};
