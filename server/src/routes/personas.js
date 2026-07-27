const router = require('express').Router();
const { listPersonas, getPersona, createPersona, generatePersona } = require('../controllers/personaController');

router.get('/', listPersonas);
router.get('/:id', getPersona);
router.post('/', createPersona);
router.post('/generate', generatePersona);

module.exports = router;
