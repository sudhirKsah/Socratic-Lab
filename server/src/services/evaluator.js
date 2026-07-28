const { chatCompletion } = require('./aiService');
const { getEvaluatorRoute } = require('./subjectRouter');
const { buildEvaluatorPrompt } = require('./promptBuilder');

/**
 * Evaluate the human's last teaching message.
 *
 * @param {object} params
 * @param {string} params.subject
 * @param {string} params.userMessage
 * @param {string} params.assistantReply
 * @param {object[]} params.activeMisconceptions
 * @param {number} params.currentUnderstandingLevel
 * @param {string} [params.mode='socratic'] - 'socratic' or 'lecture'
 *
 * @returns {Promise<{
 *   delta: number,
 *   correctedConcepts: string[],
 *   reasoning: string,
 *   encouragement: string
 * }>}
 */
async function evaluate({
  subject,
  userMessage,
  assistantReply,
  activeMisconceptions,
  currentUnderstandingLevel,
  mode = 'socratic',
}) {
  const routeConfig = getEvaluatorRoute();
  const systemPrompt = buildEvaluatorPrompt(
    subject,
    userMessage,
    assistantReply,
    activeMisconceptions,
    currentUnderstandingLevel,
    mode
  );

  // The evaluator prompt is self-contained; we pass a minimal user turn
  const raw = await chatCompletion({
    routeConfig,
    systemPrompt,
    userMessage: 'Evaluate the teaching quality as instructed.',
  });

  return parseEvaluation(raw);
}


/**
 * Robustly parse the evaluator's JSON response.
 * Falls back to a neutral result if parsing fails.
 */
function parseEvaluation(raw) {
  try {
    // Strip any markdown code fences the model might add
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      delta: clampDelta(parsed.delta ?? 0),
      correctedConcepts: Array.isArray(parsed.correctedConcepts)
        ? parsed.correctedConcepts
        : [],
      reasoning: parsed.reasoning ?? '',
      encouragement: parsed.encouragement ?? 'Keep going!',
    };
  } catch (err) {
    console.warn('[evaluator] Failed to parse evaluation JSON:', err.message);
    console.warn('[evaluator] Raw response:', raw);
    // Neutral fallback — no harm done
    return {
      delta: 2,
      correctedConcepts: [],
      reasoning: 'Could not evaluate this turn.',
      encouragement: 'Keep explaining!',
    };
  }
}

function clampDelta(delta) {
  return Math.max(-5, Math.min(15, Math.round(delta)));
}

module.exports = { evaluate };
