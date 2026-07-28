const router = require('express').Router({ mergeParams: true }); // inherit :id from parent
const multer = require('multer');
const { addLectureText, addLectureFile, finishPhase1 } = require('../controllers/lectureController');
const { aiLimiter } = require('../middleware/rateLimiter');

// Use memory storage — we process the buffer directly (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are supported'));
    }
  },
});

router.post('/text', addLectureText);
router.post('/file', aiLimiter, upload.single('file'), addLectureFile);
router.post('/finish', aiLimiter, finishPhase1);

module.exports = router;
