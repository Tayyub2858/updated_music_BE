const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const jobValidation = require('../../validations/job.validation');
const jobController = require('../../controllers/job.controller');
const upload = require('../../config/multer');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();

// Separate route for uploading images
router.route('/upload-images').post(
  auth('recruiter'),
  upload.fields([{ name: 'applicantAvatar', maxCount: 1 }, { name: 'applicantBackgroundImage', maxCount: 1 }]),
  catchAsync(async (req, res) => {
    // Handle image upload and respond
    console.log('Req.files:', req.files);
    const avatarPath = req.files['applicantAvatar'] ? `/uploads/${req.files['applicantAvatar'][0].filename}` : null;
    const backgroundImagePath = req.files['applicantBackgroundImage'] ? `/uploads/${req.files['applicantBackgroundImage'][0].filename}` : null;

    if (!avatarPath && !backgroundImagePath) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    return res.status(200).json({
      message: 'Files uploaded successfully',
      avatar: avatarPath,
      backgroundImage: backgroundImagePath
    });
  })
);


// router.route('/myJobs').get(auth('recruiters'), jobController.getMyJobs);
router.get('/my-jobs', auth('recruiter'), jobController.getMyJobs)

router.route('/update-job-status/:jobId').put(auth('recruiter'), validate(jobValidation.changeJobStatus), jobController.changeJobStatus);

// New DELETE route to delete a job
router.route('/:jobId').delete(auth('recruiter'), validate(jobValidation.getJobById), jobController.deleteJob);

// New PUT route to update a jobrecruiters
router.route('/:jobId').put(auth('recruiter'), validate(jobValidation.getJobById), jobController.updateJob);

router.post('/add',
  auth('recruiter'),
  validate(jobValidation.postJob),
  jobController.postJob
);

// router.get('/' ,validate(jobValidation.getJobs), jobController.getJob);
router.get('/', jobController.getJob);
router.get('/:jobId', auth('user'), validate(jobValidation.getJobById), jobController.getJobById)
router.put('/:jobId', auth('user'), validate(jobValidation.getJobById), jobController.saveJob)
router.post('/apply/:jobId', auth('user'), validate(jobValidation.applyJob), jobController.applyJob);

router.get('/get/applied', auth('user'), jobController.getAppliedJobs);



module.exports = router;
