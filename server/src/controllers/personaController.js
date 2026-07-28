const AIStudent = require('../models/AIStudent');
const { chatCompletion } = require('../services/aiService');
const { getRoute } = require('../services/subjectRouter');

async function listPersonas(req, res, next) {
  try {
    const { subject } = req.query;
    const filter = { isActive: true };
    if (subject) filter.subject = subject;

    const personas = await AIStudent.find(filter).select('-baseSystemPrompt');
    res.json({ personas });
  } catch (err) {
    next(err);
  }
}

async function getPersona(req, res, next) {
  try {
    const persona = await AIStudent.findById(req.params.id).select('-baseSystemPrompt');
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }
    res.json({ persona });
  } catch (err) {
    next(err);
  }
}

async function createPersona(req, res, next) {
  try {
    const { subject, name, avatar, gradeLevel, personalityIntensity, difficulty, backstory } = req.body;

    if (!subject || !name) {
      return res.status(400).json({ error: 'Subject and name are required' });
    }

    const persona = await AIStudent.create({
      subject,
      name,
      avatar: avatar || '🎓',
      gradeLevel: gradeLevel || 'Grade 10',
      personalityIntensity: Number(personalityIntensity) || 3,
      difficulty: difficulty || 'intermediate',
      backstory: backstory || `${name} is a ${gradeLevel || 'Grade 10'} student eager to learn ${subject}.`,
      baseSystemPrompt: `You are ${name}, a ${gradeLevel || 'Grade 10'} ${difficulty || 'intermediate'} ${subject} student.`,
      misconceptions: [],
      isActive: true,
    });

    res.status(201).json({ persona });
  } catch (err) {
    next(err);
  }
}

async function generatePersona(req, res, next) {
  try {
    const { subject = 'Math', gradeLevel = 'Grade 10', difficulty = 'intermediate', personalityIntensity = 3 } = req.body;

    const routeConfig = getRoute(subject);
    const prompt = `Generate a creative AI student persona for the subject "${subject}".
Class/Grade Level: ${gradeLevel} (e.g. Class 1-10, High School, B.Tech, College)
Difficulty level: ${difficulty}
Stubbornness intensity: ${personalityIntensity}/5

Respond with ONLY valid JSON (no markdown ticks) in this exact format:
{
  "name": "Creative student name (e.g. Aarav, Leo, Priya)",
  "avatar": "A single relevant emoji (e.g. 🎒, 🧪, 💻, 📐, ⚡)",
  "backstory": "2-3 sentences explaining their class background (${gradeLevel}), learning style, and attitude towards ${subject}."
}`;

    const raw = await chatCompletion({
      routeConfig,
      systemPrompt: prompt,
      userMessage: 'Generate persona now.',
    });

    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);

    const persona = await AIStudent.create({
      subject,
      name: data.name || 'Student',
      avatar: data.avatar || '🎓',
      gradeLevel: gradeLevel || 'Grade 10',
      personalityIntensity: Number(personalityIntensity) || 3,
      difficulty: difficulty || 'intermediate',
      backstory: data.backstory || `Learning ${subject} at ${gradeLevel} level.`,
      baseSystemPrompt: `You are ${data.name}, a ${gradeLevel} student learning ${subject}.`,
      misconceptions: [],
      isActive: true,
    });

    res.status(201).json({ persona });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPersonas, getPersona, createPersona, generatePersona };
