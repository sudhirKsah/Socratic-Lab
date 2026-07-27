/**
 * subjectRouter.js
 *
 * Maps a subject to the best available AI provider + model.
 *
 * Strategy:
 *  - Groq / OpenRouter configurable per route.
 *  - Programming / Math / Science models on Groq / OpenRouter.
 */

const ROUTES = {
  Math: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKeyEnv: 'GROQ_API_KEY',
    supportsStreaming: true,
  },
  Physics: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKeyEnv: 'GROQ_API_KEY',
    supportsStreaming: true,
  },
  Chemistry: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKeyEnv: 'GROQ_API_KEY',
    supportsStreaming: true,
  },
  Programming: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKeyEnv: 'GROQ_API_KEY',
    supportsStreaming: true,
  },
  Writing: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKeyEnv: 'GROQ_API_KEY',
    supportsStreaming: true,
  },
};

// OpenRouter alternative for coding/deep reasoning if OPENROUTER_API_KEY is provided
if (process.env.OPENROUTER_API_KEY) {
  ROUTES.Programming = {
    provider: 'openrouter',
    model: 'qwen/qwen-2.5-coder-32b-instruct',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    supportsStreaming: true,
  };
}

// DeepSeek alternative if DEEPSEEK_API_KEY is provided
if (process.env.DEEPSEEK_API_KEY) {
  const deepseekRoute = {
    provider: 'deepseek',
    model: 'deepseek-chat',
    baseURL: 'https://api.deepseek.com/v1',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    supportsStreaming: true,
  };
  ROUTES.Math = deepseekRoute;
  ROUTES.Physics = deepseekRoute;
  ROUTES.Chemistry = deepseekRoute;
}

const EVALUATOR_ROUTE = {
  provider: 'groq',
  model: 'llama-3.1-8b-instant',
  baseURL: 'https://api.groq.com/openai/v1',
  apiKeyEnv: 'GROQ_API_KEY',
  supportsStreaming: false,
};

/**
 * Get the route config for a given subject.
 */
function getRoute(subject) {
  const route = ROUTES[subject] || ROUTES.Programming;
  const apiKey = process.env[route.apiKeyEnv] || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      `Missing API key for ${subject}. Set ${route.apiKeyEnv} or GROQ_API_KEY in server/.env`
    );
  }
  return { ...route, apiKey };
}

/**
 * Get the evaluator route config.
 */
function getEvaluatorRoute() {
  const route = EVALUATOR_ROUTE;
  const apiKey = process.env[route.apiKeyEnv] || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(`Missing GROQ_API_KEY for evaluator`);
  }
  return { ...route, apiKey };
}

module.exports = { getRoute, getEvaluatorRoute, ROUTES };
