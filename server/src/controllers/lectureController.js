const Session = require('../models/Session');
const AIStudent = require('../models/AIStudent');
const { extractText, countWords } = require('../services/fileExtractor');
const { chatCompletion } = require('../services/aiService');
const { getRoute } = require('../services/subjectRouter');
const {
  buildDynamicMisconceptionExtractorPrompt,
  buildLectureReflectionPrompt,
} = require('../services/promptBuilder');

async function addLectureText(req, res, next) {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.mode !== 'lecture') {
      return res.status(400).json({ error: 'This session is not in Lecture Mode' });
    }
    if (session.phase !== 1) {
      return res.status(400).json({ error: 'Phase 1 is already complete' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is not active' });
    }

    const trimmed = content.trim();
    session.lectureContent = session.lectureContent
      ? session.lectureContent + '\n\n' + trimmed
      : trimmed;

    session.lectureWordCount = countWords(session.lectureContent);
    await session.save();

    res.json({
      message: 'Text added to lecture',
      lectureWordCount: session.lectureWordCount,
    });
  } catch (err) {
    next(err);
  }
}

async function addLectureFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.mode !== 'lecture') {
      return res.status(400).json({ error: 'This session is not in Lecture Mode' });
    }
    if (session.phase !== 1) {
      return res.status(400).json({ error: 'Phase 1 is already complete' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is not active' });
    }

    const { buffer, mimetype, originalname } = req.file;

    let extracted;
    try {
      extracted = await extractText(buffer, mimetype, originalname);
    } catch (extractErr) {
      return res.status(422).json({ error: extractErr.message });
    }

    const separator = `\n\n--- [From file: ${originalname}] ---\n\n`;
    session.lectureContent = session.lectureContent
      ? session.lectureContent + separator + extracted.text
      : extracted.text;

    session.lectureWordCount = countWords(session.lectureContent);

    session.lectureFiles.push({
      originalName: originalname,
      mimeType: mimetype,
      wordCount: extracted.wordCount,
    });

    await session.save();

    res.json({
      message: 'File processed and added to lecture',
      fileName: originalname,
      extractedWords: extracted.wordCount,
      lectureWordCount: session.lectureWordCount,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/sessions/:id/lecture/finish ────────────────────────────────────
// User signals they are done with Phase 1.
// 1. Dynamic Extraction: AI reads lectureContent and extracts 3-4 dynamic misconceptions.
// 2. Reflection: AI generates student reflection with these misconceptions.
// 3. Transition: Phase 2 starts with student reflection as first message.
async function finishPhase1(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.mode !== 'lecture') {
      return res.status(400).json({ error: 'This session is not in Lecture Mode' });
    }
    if (session.phase !== 1) {
      return res.status(400).json({ error: 'Phase 1 is already complete' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is not active' });
    }
    if (!session.lectureContent || session.lectureWordCount < 20) {
      return res.status(400).json({
        error: 'Please add some content to your lecture before finishing Phase 1 (minimum ~20 words)',
      });
    }

    const persona = await AIStudent.findById(session.aiStudentId);
    const routeConfig = getRoute(session.subject);

    // ── STEP 1: Dynamically extract misconceptions from lecture content ──────
    const extractionPrompt = buildDynamicMisconceptionExtractorPrompt(
      persona,
      session.lectureContent,
      session.topic,
      session.subject
    );

    let extractedMisconceptions = [];
    try {
      const rawExtraction = await chatCompletion({
        routeConfig,
        systemPrompt: extractionPrompt,
        userMessage: 'Extract misconceptions now as JSON array.',
      });

      const cleanedJson = rawExtraction
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      extractedMisconceptions = JSON.parse(cleanedJson);
    } catch (extractErr) {
      console.warn('[lectureController] Dynamic misconception extraction fallback:', extractErr.message);
      // Fallback if parsing fails
      extractedMisconceptions = (persona && persona.misconceptions && persona.misconceptions.length > 0)
        ? persona.misconceptions
        : [
            {
              concept: 'Core concept application',
              wrongBelief: 'Misinterpreted key principle in the lecture',
              hint: 'Clarify with a concrete example',
            },
          ];
    }

    // Update active misconceptions on session
    session.activeMisconceptions = extractedMisconceptions.map((m) => ({
      concept: m.concept,
      wrongBelief: m.wrongBelief,
      hint: m.hint || '',
      corrected: false,
    }));

    // ── STEP 2: Generate student reflection ────────────────────────────────
    const reflectionPrompt = buildLectureReflectionPrompt(
      persona,
      session.lectureContent,
      session.activeMisconceptions,
      session.topic
    );

    const reflection = await chatCompletion({
      routeConfig,
      systemPrompt: reflectionPrompt,
      userMessage: 'Please write your student reflection now.',
    });

    // ── STEP 3: Transition to Phase 2 ──────────────────────────────────────
    session.studentReflection = reflection;
    session.phase = 2;

    session.messages.push({
      role: 'assistant',
      content: reflection,
      phase: 2,
    });

    await session.save();

    res.json({
      message: 'Phase 1 complete. Phase 2 has started.',
      studentReflection: reflection,
      activeMisconceptions: session.activeMisconceptions,
      phase: 2,
      lectureWordCount: session.lectureWordCount,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { addLectureText, addLectureFile, finishPhase1 };
