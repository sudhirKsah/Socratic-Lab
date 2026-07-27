/**
 * aiService.js
 *
 * Handles all AI API calls using the OpenAI-compatible SDK.
 * Supports both streaming (SSE) and non-streaming completions.
 *
 * Automatically strips reasoning/thinking blocks (<think>...</think>) from completions
 * so JSON parsing and assistant replies stay clean.
 */

const OpenAI = require('openai');

/**
 * Build an OpenAI-compatible client for the given route config.
 * @param {{ baseURL: string, apiKey: string }} routeConfig
 */
function buildClient(routeConfig) {
  return new OpenAI({
    baseURL: routeConfig.baseURL,
    apiKey: routeConfig.apiKey,
  });
}

/**
 * Helper to strip internal reasoning/thinking tags (<think>...</think>) from AI outputs.
 */
function stripThinking(text) {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/**
 * Stream a chat completion to an Express response using SSE.
 */
async function streamCompletion({ routeConfig, systemPrompt, messages, res }) {
  const client = buildClient(routeConfig);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let fullContent = '';
  let isThinking = false;

  try {
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const stream = await client.chat.completions.create({
      model: routeConfig.model,
      messages: chatMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        // Filter out streaming <think> tags if a reasoning model emits them
        if (delta.includes('<think>')) {
          isThinking = true;
          continue;
        }
        if (delta.includes('</think>')) {
          isThinking = false;
          continue;
        }
        if (!isThinking) {
          fullContent += delta;
          sendEvent({ type: 'delta', content: delta });
        }
      }
    }

    const cleanedContent = stripThinking(fullContent);
    sendEvent({ type: 'done', fullContent: cleanedContent });
    return cleanedContent;
  } catch (err) {
    console.error('[aiService] Streaming error:', err.message);
    sendEvent({ type: 'error', message: err.message });
    throw err;
  }
}

/**
 * Non-streaming chat completion (used for evaluator & JSON generation).
 */
async function chatCompletion({ routeConfig, systemPrompt, userMessage }) {
  const client = buildClient(routeConfig);

  const response = await client.chat.completions.create({
    model: routeConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    stream: false,
    temperature: 0.3,
    max_tokens: 800,
  });

  const rawContent = response.choices[0]?.message?.content ?? '';
  return stripThinking(rawContent);
}

module.exports = { streamCompletion, chatCompletion, stripThinking };
