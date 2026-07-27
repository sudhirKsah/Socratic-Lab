import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Restore token from localStorage on module load
const stored = JSON.parse(localStorage.getItem('socraticlab-auth') || '{}')
if (stored?.state?.token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${stored.state.token}`
}

export default api

/**
 * SSE streaming helper for the message endpoint.
 * Calls onDelta(content) for each streamed chunk.
 * Calls onSessionUpdate(data) when session_update event arrives.
 * Calls onDone(fullContent) when streaming ends.
 * Calls onError(err) on failure.
 */
export async function streamMessage({ sessionId, content, token, onDelta, onSessionUpdate, onDone, onError }) {
  let fullContent = ''

  try {
    const response = await fetch(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      const err = await response.json()
      onError?.(err.error || 'Request failed')
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const evt = JSON.parse(line.slice(6))
          if (evt.type === 'delta') {
            fullContent += evt.content
            onDelta?.(evt.content, fullContent)
          } else if (evt.type === 'done') {
            onDone?.(fullContent)
          } else if (evt.type === 'session_update') {
            onSessionUpdate?.(evt)
          } else if (evt.type === 'error') {
            onError?.(evt.message)
          }
        } catch { /* malformed line, skip */ }
      }
    }
  } catch (err) {
    onError?.(err.message)
  }
}
