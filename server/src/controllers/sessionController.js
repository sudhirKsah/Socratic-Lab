/**
 * sessionController.js
 *
 * Handles the full teaching session lifecycle for both modes:
 *
 * SOCRATIC MODE:
 *   create → generates initial topic misconceptions & AI opening message → live back-and-forth chat (streaming AI + evaluator) → complete
 *
 * LECTURE MODE:
 *   create (mode='lecture') →
 *   Phase 1: POST /:id/lecture/text | /file → POST /:id/lecture/finish (extracts misconceptions from lecture + generates reflection) →
 *   Phase 2: POST /:id/messages (uses Phase 2 prompt) → complete
 *
 * sendMessage() dispatches the correct system prompt based on session.mode + session.phase.
 */

const Session = require('../models/Session');
const AIStudent = require('../models/AIStudent');
const User = require('../models/User');
const { getRoute } = require('../services/subjectRouter');
const { streamCompletion, chatCompletion } = require('../services/aiService');
const { evaluate } = require('../services/evaluator');
const {
  buildStudentSystemPrompt,
  buildSocraticMisconceptionPrompt,
  buildPhase2SystemPrompt,
} = require('../services/promptBuilder');

const MASTERY_THRESHOLD = 85;

// ── POST /api/sessions ────────────────────────────────────────────────────────
async function createSession(req, res, next) {
  try {
    let { aiStudentId, customPersona, topic, mode } = req.body;

    let persona;
    if (customPersona && customPersona.name && customPersona.subject) {
      persona = await AIStudent.create({
        subject: customPersona.subject,
        name: customPersona.name,
        avatar: customPersona.avatar || '🎓',
        gradeLevel: customPersona.gradeLevel || 'Grade 10',
        personalityIntensity: Number(customPersona.personalityIntensity) || 3,
        difficulty: customPersona.difficulty || 'intermediate',
        backstory: customPersona.backstory || `${customPersona.name} is eager to learn ${customPersona.subject}.`,
        baseSystemPrompt: `You are ${customPersona.name}, a student learning ${customPersona.subject}.`,
        misconceptions: [],
        isActive: true,
      });
    } else if (aiStudentId) {
      persona = await AIStudent.findById(aiStudentId);
    }

    if (!persona || !persona.isActive) {
      return res.status(400).json({ error: 'AI student persona or customPersona is required' });
    }

    const sessionMode = mode === 'socratic' ? 'socratic' : 'lecture';

    // ── Generate initial misconceptions for Socratic mode if needed ─────────
    let initialMisconceptions = persona.misconceptions || [];
    if (sessionMode === 'socratic' && (initialMisconceptions.length === 0 || topic)) {
      try {
        const routeConfig = getRoute(persona.subject);
        const prompt = buildSocraticMisconceptionPrompt(persona, topic, persona.subject);
        const raw = await chatCompletion({
          routeConfig,
          systemPrompt: prompt,
          userMessage: 'Generate misconceptions now as JSON array.',
        });
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        initialMisconceptions = JSON.parse(cleaned);
      } catch (err) {
        console.warn('[sessionController] Dynamic Socratic misconception fallback:', err.message);
      }
    }

    // ── Generate AI opening question for Socratic Mode ──────────────────────
    let openingMessage = '';
    if (sessionMode === 'socratic') {
      try {
        const routeConfig = getRoute(persona.subject);
        const misconceptionsText = (initialMisconceptions || [])
          .map((m) => `- ${m.concept}: "${m.wrongBelief}"`)
          .join('\n');

        const openingPrompt = `You are ${persona.name}, a ${persona.gradeLevel || 'student'} learning ${persona.subject}.
${persona.backstory ? `Backstory: ${persona.backstory}` : ''}
Topic: ${topic || persona.subject}

Your misconceptions about this topic:
${misconceptionsText}

Write your FIRST opening message to your teacher (the user).
- Greet your teacher warmly as a student.
- State what you are trying to understand about ${topic || persona.subject}, and ask a specific question or state one of your misconceptions as a doubt.
- Keep it natural, conversational, 2-3 sentences max.
- Do NOT break character. Do NOT give correct answers. You are the student.

Write ONLY your opening student message. No preamble.`;

        openingMessage = await chatCompletion({
          routeConfig,
          systemPrompt: openingPrompt,
          userMessage: 'Start the teaching session now.',
        });
      } catch (err) {
        console.warn('[sessionController] Opening message fallback:', err.message);
        openingMessage = `Hi teacher! I'm trying to learn about ${topic || persona.subject}, but I'm having some trouble understanding how it works. Could you explain it to me?`;
      }
    }

    const initialMessages = [];
    if (sessionMode === 'socratic' && openingMessage) {
      initialMessages.push({
        role: 'assistant',
        content: openingMessage,
        phase: null,
      });
    }

    const session = await Session.create({
      userId: req.user._id,
      aiStudentId: persona._id,
      subject: persona.subject,
      topic: topic || '',
      messages: initialMessages,
      understandingLevel: 0,
      activeMisconceptions: initialMisconceptions.map((m) => ({
        concept: m.concept,
        wrongBelief: m.wrongBelief,
        hint: m.hint || '',
        corrected: false,
      })),
      status: 'active',
      mode: sessionMode,
      phase: 1,
    });

    await session.populate('aiStudentId', '-baseSystemPrompt');
    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/sessions ─────────────────────────────────────────────────────────
async function listSessions(req, res, next) {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .populate('aiStudentId', 'name subject avatar gradeLevel')
      .sort({ createdAt: -1 });

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/sessions/:id ─────────────────────────────────────────────────────
async function getSession(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('aiStudentId', '-baseSystemPrompt');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/sessions/:id/messages (SSE streaming endpoint) ────────────────
async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is no longer active' });
    }
    if (session.mode === 'lecture' && session.phase === 1) {
      return res.status(400).json({
        error: 'Complete Phase 1 first. Call POST /:id/lecture/finish to transition to Phase 2.',
      });
    }

    const persona = await AIStudent.findById(session.aiStudentId);

    const recentMessages = session.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let systemPrompt;
    if (session.mode === 'lecture' && session.phase === 2) {
      systemPrompt = buildPhase2SystemPrompt(
        persona,
        session.lectureContent || '',
        session.activeMisconceptions,
        session.understandingLevel,
        session.topic
      );
    } else {
      systemPrompt = buildStudentSystemPrompt(
        persona,
        session.activeMisconceptions,
        session.understandingLevel,
        session.topic
      );
    }

    const routeConfig = getRoute(session.subject);
    const userMessageForHistory = [...recentMessages, { role: 'user', content: content.trim() }];

    let aiReply = '';
    try {
      aiReply = await streamCompletion({
        routeConfig,
        systemPrompt,
        messages: userMessageForHistory,
        res,
      });
    } catch (streamErr) {
      console.error('[session] Streaming failed:', streamErr.message);
      return;
    }

    let evalResult = { delta: 0, correctedConcepts: [], reasoning: '', encouragement: '' };
    try {
      evalResult = await evaluate({
        subject: session.subject,
        userMessage: content.trim(),
        assistantReply: aiReply,
        activeMisconceptions: session.activeMisconceptions,
        currentUnderstandingLevel: session.understandingLevel,
        mode: session.mode,
      });
    } catch (evalErr) {
      console.warn('[session] Evaluator failed (non-fatal):', evalErr.message);
    }

    const newUnderstanding = Math.min(
      100,
      Math.max(0, session.understandingLevel + evalResult.delta)
    );

    const updatedMisconceptions = session.activeMisconceptions.map((m) => {
      const wasCorrected = evalResult.correctedConcepts.some(
        (c) => c.toLowerCase() === m.concept.toLowerCase()
      );
      return { ...m.toObject(), corrected: m.corrected || wasCorrected };
    });

    const msgPhase = session.mode === 'lecture' ? session.phase : null;
    session.messages.push({ role: 'user', content: content.trim(), phase: msgPhase });
    session.messages.push({
      role: 'assistant',
      content: aiReply,
      evalDelta: evalResult.delta,
      evalReasoning: evalResult.reasoning,
      phase: msgPhase,
    });

    session.understandingLevel = newUnderstanding;
    session.activeMisconceptions = updatedMisconceptions;

    if (newUnderstanding >= MASTERY_THRESHOLD && session.status === 'active') {
      session.status = 'complete';
      session.completedAt = new Date();
      session.masteryScore = session.computeMasteryScore();

      const user = await User.findById(req.user._id);
      const currentScore = user.progress?.get ? (user.progress.get(session.subject) || 0) : (user.progress?.[session.subject] || 0);
      const updatedScore = Math.max(session.masteryScore, currentScore);

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalSessions: 1, totalMasteryPoints: session.masteryScore },
        $set: { [`progress.${session.subject}`]: updatedScore },
      });
    }

    await session.save();

    const finalEvent = {
      type: 'session_update',
      understandingLevel: session.understandingLevel,
      activeMisconceptions: session.activeMisconceptions,
      evalDelta: evalResult.delta,
      evalReasoning: evalResult.reasoning,
      encouragement: evalResult.encouragement,
      status: session.status,
      masteryScore: session.masteryScore,
    };
    res.write(`data: ${JSON.stringify(finalEvent)}\n\n`);
    res.end();
  } catch (err) {
    next(err);
  }
}

// ── POST /api/sessions/:id/complete ───────────────────────────────────────────
async function completeSession(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is already completed or abandoned' });
    }

    session.status = 'complete';
    session.completedAt = new Date();
    session.masteryScore = session.computeMasteryScore();
    await session.save();

    const user = await User.findById(req.user._id);
    const currentScore = user.progress?.get ? (user.progress.get(session.subject) || 0) : (user.progress?.[session.subject] || 0);
    const updatedScore = Math.max(session.masteryScore, currentScore);

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalSessions: 1, totalMasteryPoints: session.masteryScore },
      $set: { [`progress.${session.subject}`]: updatedScore },
    });

    res.json({ session });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/sessions/:id ──────────────────────────────────────────────────
async function abandonSession(req, res, next) {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, status: 'active' },
      { status: 'abandoned' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    res.json({ message: 'Session abandoned', session });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSession,
  listSessions,
  getSession,
  sendMessage,
  completeSession,
  abandonSession,
};
