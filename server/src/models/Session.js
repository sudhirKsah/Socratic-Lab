const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: { type: String, required: true },
    // For assistant messages: evaluator metadata about the previous user turn
    evalDelta: { type: Number, default: null },       // +/- change in understanding
    evalReasoning: { type: String, default: null },   // evaluator's explanation
    // Phase of lecture mode this message belongs to (null for socratic)
    phase: { type: Number, default: null },
  },
  { timestamps: true, _id: true }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    aiStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIStudent',
      required: true,
    },
    subject: {
      type: String,
      enum: ['Math', 'Physics', 'Chemistry', 'Programming', 'Writing'],
      required: true,
    },
    topic: {
      type: String,
      default: '', 
    },
    messages: [messageSchema],

    understandingLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    activeMisconceptions: [
      {
        concept: String,
        wrongBelief: String,
        hint: String,
        corrected: { type: Boolean, default: false },
      }
    ],

    masteryScore: {
      type: Number,
      default: null, 
    },

    status: {
      type: String,
      enum: ['active', 'complete', 'abandoned'],
      default: 'active',
    },

    // ── Session Mode ──────────────────────────────────────────────────────────
    // 'socratic' — classic back-and-forth chat, AI is stubborn from message 1
    // 'lecture'  — Phase 1: user dumps all their knowledge (text/file upload)
    //              Phase 2: AI reflects, then questions/challenges the user
    mode: {
      type: String,
      enum: ['socratic', 'lecture'],
      default: 'socratic',
    },

    // ── Lecture Mode: Phase tracking ──────────────────────────────────────────
    // phase 1: user is still in Phase 1 (teaching / uploading)
    // phase 2: AI has reflected, Phase 2 Q&A is active
    phase: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },

    // ── Lecture Mode: Phase 1 content ─────────────────────────────────────────
    // All the text the user submitted in Phase 1 (typed + any file extractions
    // concatenated together). This is the "lecture" the AI student reads.
    lectureContent: {
      type: String,
      default: null,
    },

    // Approximate word count (for UI display)
    lectureWordCount: {
      type: Number,
      default: 0,
    },

    // File attachments uploaded during Phase 1
    lectureFiles: [
      {
        originalName: String,
        mimeType: String,
        wordCount: Number,
        uploadedAt: { type: Date, default: Date.now },
      }
    ],

    // ── Lecture Mode: Student Reflection ─────────────────────────────────────
    // Generated at end of Phase 1. Shown to user before Phase 2 starts.
    // "Here's what I think I understood from your explanation..."
    studentReflection: {
      type: String,
      default: null,
    },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual: number of user turns taken
sessionSchema.virtual('turnCount').get(function () {
  return this.messages.filter((m) => m.role === 'user').length;
});

// Compute mastery score when completing the session
sessionSchema.methods.computeMasteryScore = function () {
  const correctedCount = this.activeMisconceptions.filter((m) => m.corrected).length;
  const totalMisconceptions = this.activeMisconceptions.length || 1;
  const turnEfficiency = Math.max(0, 1 - (this.turnCount - correctedCount) / 20);

  // Lecture mode bonus: user who took time to write a full lecture gets a
  // small head-start because they demonstrated prior knowledge
  const lectureBonus = this.mode === 'lecture' ? 5 : 0;

  const score = Math.round(
    this.understandingLevel * 0.6 +
    (correctedCount / totalMisconceptions) * 30 +
    turnEfficiency * 10 +
    lectureBonus
  );
  return Math.min(100, Math.max(0, score));
};

module.exports = mongoose.model('Session', sessionSchema);
