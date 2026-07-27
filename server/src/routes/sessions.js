const router = require('express').Router();
const {
  createSession,
  listSessions,
  getSession,
  sendMessage,
  completeSession,
  abandonSession,
} = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const lectureRoutes = require('./lecture');

// All session routes require authentication
router.use(authenticate);

router.post('/', createSession);
router.get('/', listSessions);
router.get('/:id', getSession);
router.post('/:id/messages', aiLimiter, sendMessage);   // streaming SSE (both modes Phase 2)
router.post('/:id/complete', completeSession);
router.delete('/:id', abandonSession);

// Lecture Mode Phase 1 sub-routes
router.use('/:id/lecture', lectureRoutes);

module.exports = router;

