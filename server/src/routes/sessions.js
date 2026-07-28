const router = require('express').Router();
const {
  createSession,
  listSessions,
  getSession,
  sendMessage,
  completeSession,
  deleteSession,
} = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const lectureRoutes = require('./lecture');

router.use(authenticate);

router.post('/', createSession);
router.get('/', listSessions);
router.get('/:id', getSession);
router.post('/:id/messages', aiLimiter, sendMessage);   // streaming SSE (both modes Phase 2)
router.post('/:id/complete', completeSession);
router.delete('/:id', deleteSession);

router.use('/:id/lecture', lectureRoutes);

module.exports = router;
