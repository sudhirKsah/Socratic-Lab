import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Lightbulb, CheckCircle2, XCircle, ChevronRight, Flag, X } from 'lucide-react'
import useSessionStore from '../store/sessionStore'
import useAuthStore from '../store/authStore'
import { streamMessage } from '../services/api'

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const {
    session, messages, understandingLevel, activeMisconceptions,
    isStreaming, streamBuffer, lastEval,
    fetchSession, addUserMessage, appendStreamDelta,
    finalizeStreamedMessage, updateSession, setStreaming,
  } = useSessionStore()

  const [input, setInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchSession(id)
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamBuffer])

  // Redirect when session completes
  useEffect(() => {
    if (session?.status === 'complete') {
      setTimeout(() => navigate(`/session/${id}/complete`), 1200)
    }
  }, [session?.status])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return
    const text = input.trim()
    setInput('')
    setShowHint(false)

    addUserMessage(text)
    setStreaming(true)

    let accumulated = ''

    await streamMessage({
      sessionId: id,
      content: text,
      token,
      onDelta: (delta) => {
        accumulated += delta
        appendStreamDelta(delta)
      },
      onDone: (fullContent) => {
        // session_update comes after done in the SSE stream
      },
      onSessionUpdate: (evt) => {
        updateSession(evt)
        finalizeStreamedMessage(accumulated || evt.fullContent || '', {
          delta: evt.evalDelta,
          reasoning: evt.evalReasoning,
          encouragement: evt.encouragement,
        })
        accumulated = ''
      },
      onError: (err) => {
        console.error('Stream error:', err)
        setStreaming(false)
        finalizeStreamedMessage('(Something went wrong. Please try again.)', null)
      },
    })

    inputRef.current?.focus()
  }, [input, isStreaming, id, token])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const persona = session?.aiStudentId
  const isComplete = session?.status === 'complete'
  const subject = session?.subject
  const phase = session?.phase

  return (
    <div className="flex h-screen" style={{ background: '#0F172A' }}>

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 hidden lg:flex flex-col border-r border-white/[0.06]"
        style={{ background: '#111827' }}>

        {/* Persona header */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {persona?.avatar || '🤖'}
            </div>
            <div>
              <div className="font-semibold text-sm">{persona?.name || '...'}</div>
              <div className="text-xs text-slate-500">{subject} Student</div>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-sm"
                    style={{ background: i < (persona?.personalityIntensity || 3) ? '#F59E0B' : 'rgba(255,255,255,0.07)' }} />
                ))}
                <span className="text-xs text-slate-600 ml-1">stubborn</span>
              </div>
            </div>
          </div>

          {session?.topic && (
            <div className="text-xs text-slate-500 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.05]">
              Topic: <span className="text-slate-300 font-medium">{session.topic}</span>
            </div>
          )}

          {phase === 2 && (
            <div className="mt-2 text-xs px-2 py-1 rounded-full text-center font-semibold"
              style={{ background: 'rgba(20,184,166,0.1)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.2)' }}>
              Phase 2 · Q&A Mode
            </div>
          )}
        </div>

        {/* Understanding meter */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Understanding</span>
            <span className="text-xl font-bold font-display" style={{
              color: understandingLevel >= 70 ? '#10B981' : understandingLevel >= 40 ? '#F59E0B' : '#94A3B8'
            }}>
              {understandingLevel}<span className="text-sm font-normal text-slate-500">/100</span>
            </span>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${understandingLevel}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1.5">
            <span>Confused</span>
            <span>Mastered ✦</span>
          </div>
        </div>

        {/* Misconceptions */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Misconceptions</span>
            <span className="text-xs text-slate-600">
              {activeMisconceptions.filter(m => m.corrected).length}/{activeMisconceptions.length} fixed
            </span>
          </div>
          <div className="space-y-2">
            {activeMisconceptions.map((m, i) => (
              <div key={i}
                className={`misconception-item transition-all duration-500 ${m.corrected ? 'corrected' : 'remaining'}`}>
                <div className="flex items-start gap-2">
                  {m.corrected
                    ? <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                    : <XCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />}
                  <div>
                    <div className="font-medium text-xs text-slate-300">{m.concept}</div>
                    {m.corrected && (
                      <div className="text-xs mt-0.5" style={{ color: '#10B981' }}>Corrected ✓</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {activeMisconceptions.length === 0 && (
              <div className="text-xs text-slate-600 text-center py-4">
                Misconceptions will appear as you teach
              </div>
            )}
          </div>
        </div>

        {/* End session button */}
        <div className="p-4 border-t border-white/[0.06]">
          <button onClick={() => setShowEndModal(true)}
            className="btn-ghost w-full py-2 text-xs flex items-center justify-center gap-2 text-red-400 border-red-500/20 hover:bg-red-500/5">
            <Flag size={12} /> End Session
          </button>
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0"
          style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <div className="text-xl">{persona?.avatar || '🤖'}</div>
            <div>
              <div className="font-semibold text-sm">{persona?.name}</div>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'animate-pulse bg-amber-400' : 'bg-green-400'}`} />
                <span className="text-xs text-slate-500">{isStreaming ? 'Thinking...' : 'Online'}</span>
              </div>
            </div>
          </div>

          {/* Mobile understanding pill */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-20 meter-track">
              <div className="meter-fill" style={{ width: `${understandingLevel}%` }} />
            </div>
            <span className="text-sm font-bold">{understandingLevel}%</span>
          </div>

          <button onClick={() => setShowEndModal(true)}
            className="lg:hidden text-slate-500 hover:text-red-400 p-1.5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-1">
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg._id || i}
              message={msg}
              persona={persona}
              isLatestAI={msg.role === 'assistant' && i === messages.length - 1}
              showEval={msg.role === 'assistant' && msg.evalDelta != null && i === messages.length - 1}
              evalData={lastEval}
            />
          ))}

          {/* Streaming bubble */}
          {isStreaming && (
            <div className="flex gap-3 items-end animate-fade-up">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}>
                {persona?.avatar || '🤖'}
              </div>
              <div className="bubble-ai px-4 py-3 max-w-lg">
                {streamBuffer ? (
                  <p className="text-sm leading-relaxed">{streamBuffer}<span className="inline-block w-1 h-4 bg-amber-400 animate-pulse ml-0.5 align-middle" /></p>
                ) : (
                  <div className="flex items-center gap-1.5 py-0.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live eval feedback strip */}
        {lastEval && !isStreaming && (
          <div className="mx-4 sm:mx-6 mb-3 animate-fade-up">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
              style={{
                background: lastEval.delta > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${lastEval.delta > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
              <span className="font-bold text-sm" style={{ color: lastEval.delta > 0 ? '#10B981' : '#EF4444' }}>
                {lastEval.delta > 0 ? `+${lastEval.delta}` : lastEval.delta} pts
              </span>
              <span className="text-slate-400 flex-1">{lastEval.reasoning}</span>
              <span className="text-slate-300 font-medium hidden sm:block">{lastEval.encouragement}</span>
            </div>
          </div>
        )}

        {/* Hint panel */}
        {showHint && session?.topic && (
          <div className="mx-4 sm:mx-6 mb-3 p-4 rounded-xl text-xs animate-fade-up"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="flex items-center gap-2 mb-2 font-semibold text-amber-400">
              <Lightbulb size={13} /> Teaching hint
            </div>
            <p className="text-slate-400 leading-relaxed">
              Try addressing {persona?.name}'s most recent question with a concrete analogy or real-world example.
              If they seem confused about a core concept, break it down step by step before moving on.
            </p>
          </div>
        )}

        {/* Input area */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-white/[0.06]"
          style={{ background: 'rgba(15,23,42,0.9)' }}>
          <div className="flex gap-2 items-end">
            <button onClick={() => setShowHint(!showHint)}
              className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${showHint ? 'bg-amber-500/15 text-amber-400' : 'btn-ghost'}`}
              title="Teaching hint">
              <Lightbulb size={16} />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming || isComplete}
                placeholder={isComplete ? 'Session complete!' : `Explain to ${persona?.name || 'the student'}...`}
                rows={1}
                className="input-field w-full px-4 py-3 text-sm resize-none leading-relaxed"
                style={{ maxHeight: '120px', overflowY: 'auto' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming || isComplete}
              className="flex-shrink-0 btn-primary p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={16} />
            </button>
          </div>
          <div className="text-xs text-slate-600 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* ── End Session modal ─────────────────────────────────────────────── */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 max-w-sm w-full animate-fade-up">
            <h3 className="font-display font-bold text-lg mb-2">End this session?</h3>
            <p className="text-sm text-slate-400 mb-5">
              Your progress will be saved and you'll receive a mastery score.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndModal(false)} className="btn-ghost flex-1 py-2.5 text-sm">
                Keep Teaching
              </button>
              <button
                onClick={async () => {
                  const { default: api } = await import('../services/api')
                  await api.post(`/sessions/${id}/complete`)
                  navigate(`/session/${id}/complete`)
                }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MessageBubble({ message, persona, isLatestAI, showEval, evalData }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-3 animate-fade-up">
        <div className="bubble-user px-4 py-3 max-w-lg">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-end mb-3 animate-fade-up">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mb-0.5"
        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}>
        {persona?.avatar || '🤖'}
      </div>
      <div className="max-w-lg">
        <div className="flex items-center gap-2 mb-1.5 ml-1">
          <span className="text-xs font-semibold text-amber-400/80">{persona?.name || 'Student'}</span>
          {message.phase === 2 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(20,184,166,0.1)', color: '#14B8A6', fontSize: '10px' }}>
              Phase 2
            </span>
          )}
        </div>
        <div className="bubble-ai px-4 py-3">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
