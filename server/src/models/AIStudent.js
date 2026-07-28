const mongoose = require('mongoose');

const misconceptionSchema = new mongoose.Schema(
  {
    concept: { type: String, required: true },
    wrongBelief: { type: String, required: true },  
    hint: { type: String, default: '' },             
    corrected: { type: Boolean, default: false },
  },
  { _id: false }
);

const aiStudentSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      enum: ['Math', 'Physics', 'Chemistry', 'Programming', 'Writing'],
      required: true,
    },
    name: { type: String, required: true },
    avatar: { type: String, default: '🤖' },  
    gradeLevel: { type: String, default: 'Grade 10' }, // e.g. Grade 1-10, B.Tech, Undergrad, etc.
    personalityIntensity: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
      // 1 = easily convinced, 5 = very stubborn / requires clear explanations
    },
    backstory: { type: String, default: '' },       
    misconceptions: [misconceptionSchema],
    baseSystemPrompt: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIStudent', aiStudentSchema);
