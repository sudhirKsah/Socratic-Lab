import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Send, Lightbulb, CheckCircle2, XCircle, ChevronRight, Flag, X, Award, ArrowLeft, Target, Sparkles, Mic, MicOff, Volume2, VolumeX, Trash2, FileText, Copy, Check } from 'lucide-react'
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
    finalizeStreamedMessage, updateSession, setStreaming, deleteSession,
  } = useSessionStore()

  const [input, setInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [copiedNotes, setCopiedNotes] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [wasInitiallyActive, setWasInitiallyActive] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speakingMsgKey, setSpeakingMsgKey] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    fetchSession(id).then((fetchedSession) => {
      if (fetchedSession?.status === 'complete') {
        setWasInitiallyActive(false)
      }
    })
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamBuffer])

  // Redirect to completion screen ONLY if session completed during live active chat
  useEffect(() => {
    if (session?.status === 'complete' && wasInitiallyActive) {
      const timer = setTimeout(() => navigate(`/session/${id}/complete`), 1500)
      return () => clearTimeout(timer)
    }
  }, [session?.status, wasInitiallyActive])

  // Toggle Speech for a specific message
  const toggleSpeakText = useCallback((msgKey, text) => {
    if (!window.speechSynthesis) return

    if (speakingMsgKey === msgKey) {
      window.speechSynthesis.cancel()
      setSpeakingMsgKey(null)
      return
    }

    window.speechSynthesis.cancel()
    if (!text) return

    try {
      const clean = text.replace(/[*#_`]/g, '').trim()
      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.rate = 1.0
      utterance.pitch = 1.05

      utterance.onend = () => setSpeakingMsgKey(null)
      utterance.onerror = () => setSpeakingMsgKey(null)

      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google')) && v.lang.startsWith('en'))
      if (preferred) utterance.voice = preferred

      setSpeakingMsgKey(msgKey)
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('TTS error:', e)
      setSpeakingMsgKey(null)
    }
  }, [speakingMsgKey])

  // Automatic Speech after streaming completes if voiceEnabled is ON
  const autoSpeak = useCallback((text) => {
    if (!voiceEnabled || !window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    try {
      const clean = text.replace(/[*#_`]/g, '').trim()
      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.rate = 1.0
      utterance.pitch = 1.05
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google')) && v.lang.startsWith('en'))
      if (preferred) utterance.voice = preferred
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('TTS error:', e)
    }
  }, [voiceEnabled])

  // Toggle Speech-to-Text Mic
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Google Chrome or Microsoft Edge!')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (transcript) {
          setInput(transcript)
        }
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)

      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
    } catch (err) {
      console.error('Speech recognition error:', err)
      setIsListening(false)
    }
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming || session?.status === 'complete') return
    const text = input.trim()
    setInput('')
    setShowHint(false)
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }

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
      onDone: () => {},
      onSessionUpdate: (evt) => {
        updateSession(evt)
        const finalContent = accumulated || evt.fullContent || ''
        finalizeStreamedMessage(finalContent, {
          delta: evt.evalDelta,
          reasoning: evt.evalReasoning,
          encouragement: evt.encouragement,
        })
        autoSpeak(finalContent)
        accumulated = ''
      },
      onError: (err) => {
        console.error('Stream error:', err)
        setStreaming(false)
        finalizeStreamedMessage('(Something went wrong. Please try again.)', null)
      },
    })

    inputRef.current?.focus()
  }, [input, isStreaming, id, token, session?.status, isListening, autoSpeak])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleDeleteSession = async () => {
    setIsDeleting(true)
    await deleteSession(id)
    setIsDeleting(false)
    navigate('/sessions')
  }

  const handleCopyNotes = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedNotes(true)
    setTimeout(() => setCopiedNotes(false), 2000)
  }

  const persona = session?.aiStudentId
  const isComplete = session?.status === 'complete'
  const subject = session?.subject
  const phase = session?.phase

  const currentTargetMisconception = activeMisconceptions.find((m) => !m.corrected)

  return (
    <div className="flex h-screen" style={{ background: '#0F172A' }}>

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 hidden lg:flex flex-col border-r border-white/[0.06]"
        style={{ background: '#111827' }}>

        {/* Persona header */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Link to="/sessions" className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
              <ArrowLeft size={12} /> Back to Sessions
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {persona?.avatar || '🤖'}
            </div>
            <div>
              <div className="font-semibold text-sm">{persona?.name || 'Student'}</div>
              <div className="text-xs text-slate-500">{persona?.gradeLevel || subject} Student</div>
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

          {/* View Lecture Notes Pill button */}
          {session?.lectureContent && (
            <button
              onClick={() => setShowNotesModal(true)}
              className="mt-2.5 w-full text-xs px-3 py-2 rounded-lg font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-all flex items-center justify-center gap-1.5">
              <FileText size={13} /> View Full Lecture Notes
            </button>
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
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.wrongBelief}</div>
                    {m.corrected && (
                      <div className="text-xs font-semibold mt-1" style={{ color: '#10B981' }}>Corrected ✓</div>
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

        {/* End / View Report / Delete button */}
        <div className="p-4 border-t border-white/[0.06] space-y-2">
          {isComplete ? (
            <button onClick={() => navigate(`/session/${id}/complete`)}
              className="btn-teal w-full py-2 text-xs flex items-center justify-center gap-2">
              <Award size={13} /> View Mastery Score Report
            </button>
          ) : (
            <button onClick={() => setShowEndModal(true)}
              className="btn-ghost w-full py-2 text-xs flex items-center justify-center gap-2 text-red-400 border-red-500/20 hover:bg-red-500/5">
              <Flag size={12} /> End Session
            </button>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-1.5 text-xs text-slate-500 hover:text-red-400 flex items-center justify-center gap-1.5 transition-colors">
            <Trash2 size={12} /> Delete Session
          </button>
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0"
          style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <Link to="/sessions" className="text-slate-400 hover:text-slate-200 lg:hidden pr-2 border-r border-white/10">
              <ArrowLeft size={16} />
            </Link>
            <div className="text-xl">{persona?.avatar || '🤖'}</div>
            <div>
              <div className="font-semibold text-sm">{persona?.name}</div>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-emerald-400' : isStreaming ? 'animate-pulse bg-amber-400' : 'bg-green-400'}`} />
                <span className="text-xs text-slate-500">{isComplete ? 'Session Completed' : isStreaming ? 'Thinking...' : 'Online'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session?.lectureContent && (
              <button
                onClick={() => setShowNotesModal(true)}
                className="hidden md:flex text-xs px-3 py-1.5 rounded-lg font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-all items-center gap-1.5">
                <FileText size={14} /> Full Notes
              </button>
            )}

            {/* Free Voice Output Toggle */}
            <button
              onClick={() => {
                const next = !voiceEnabled
                setVoiceEnabled(next)
                if (!next) window.speechSynthesis?.cancel()
              }}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                voiceEnabled
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'bg-white/5 text-slate-500 hover:text-slate-300'
              }`}
              title={voiceEnabled ? 'AI Auto-Voice Enabled (Click to Mute)' : 'AI Auto-Voice Muted (Click to Enable)'}>
              {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="hidden sm:inline">{voiceEnabled ? 'Auto-Voice ON' : 'Auto-Voice OFF'}</span>
            </button>

            {isComplete && (
              <button
                onClick={() => navigate(`/session/${id}/complete`)}
                className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5">
                <Award size={14} /> Score Report ({session?.masteryScore || understandingLevel}%)
              </button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete Session">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Completed session notification banner */}
        {isComplete && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>This session is completed with a <strong>{session?.masteryScore || understandingLevel}% Mastery Score</strong>. You are reviewing past dialogue in read-only mode.</span>
            </div>
            <button
              onClick={() => navigate(`/session/${id}/complete`)}
              className="font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              Score Card <ChevronRight size={12} />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-1">
          {messages.map((msg, i) => {
            const msgKey = msg._id || i
            const isSpeaking = speakingMsgKey === msgKey
            return (
              <MessageBubble
                key={msgKey}
                message={msg}
                persona={persona}
                isSpeaking={isSpeaking}
                onToggleSpeak={() => toggleSpeakText(msgKey, msg.content)}
              />
            )
          })}

          {/* Streaming bubble */}
          {isStreaming && (
            <div className="flex gap-3 items-end animate-fade-up">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mb-0.5"
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
        {lastEval && !isStreaming && !isComplete && (
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

        {/* Dynamic Teaching Hint panel */}
        {showHint && !isComplete && (
          <div className="mx-4 sm:mx-6 mb-3 p-4 rounded-xl text-xs animate-fade-up"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-semibold text-amber-400 text-sm">
                <Lightbulb size={15} /> Dynamic Teaching Strategy
              </div>
              <button
                onClick={() => setShowHint(false)}
                className="text-slate-500 hover:text-slate-300 p-0.5">
                <X size={14} />
              </button>
            </div>

            {currentTargetMisconception ? (
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center gap-1.5 font-medium text-amber-300">
                  <Target size={13} /> Focus Concept: <span>"{currentTargetMisconception.concept}"</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  <strong>Student's misconception:</strong> "{currentTargetMisconception.wrongBelief}"
                </p>
                <div className="text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 mt-2">
                  💡 <strong>Suggested approach:</strong> {currentTargetMisconception.hint || `Use a real-world example or step-by-step counter-example to show why this assumption fails.`}
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-slate-300">
                <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                  <Sparkles size={13} /> All initial misconceptions resolved!
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Ask <strong>{persona?.name}</strong> to summarize the main concept in their own words or ask if they have any remaining doubts.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-white/[0.06]"
          style={{ background: 'rgba(15,23,42,0.9)' }}>
          <div className="flex gap-2 items-end">
            {!isComplete && (
              <>
                <button onClick={() => setShowHint(!showHint)}
                  className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${showHint ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'btn-ghost'}`}
                  title="Teaching hint">
                  <Lightbulb size={16} />
                </button>

                {/* Free Speech-to-Text Mic Button */}
                <button onClick={toggleListening}
                  className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'btn-ghost text-slate-400 hover:text-slate-200'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak to AI Student (Free Mic)'}>
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </>
            )}

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming || isComplete}
                placeholder={isListening ? '🎙️ Listening... speak clearly into mic...' : isComplete ? 'This session is completed. (Read-only mode)' : `Explain to ${persona?.name || 'the student'}...`}
                rows={1}
                className="input-field w-full px-4 py-3 text-sm resize-none leading-relaxed disabled:opacity-50"
                style={{ maxHeight: '120px', overflowY: 'auto' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>

            {!isComplete && (
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="flex-shrink-0 btn-primary p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">
                <Send size={16} />
              </button>
            )}
          </div>
          <div className="text-xs text-slate-600 mt-2 text-center flex items-center justify-center gap-2">
            {isListening && <span className="text-red-400 font-semibold animate-pulse">● Recording Voice</span>}
            <span>{isComplete ? 'Completed session history • Read-only' : 'Press Enter to send · Click 🎙️ for Free Mic Voice Mode'}</span>
          </div>
        </div>
      </div>

      {/* ── End Session Modal ─────────────────────────────────────────────── */}
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

      {/* ── Delete Session Modal ───────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 max-w-md w-full animate-fade-up border border-red-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-lg text-red-400">
                <Trash2 size={20} /> Delete Session?
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-300 mb-2">
              Are you sure you want to delete this session?
            </p>
            <p className="text-xs text-slate-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-6">
              ⚠️ This will permanently remove the transcript, evaluator metrics, and all associated lecture notes.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-ghost flex-1 py-2.5 text-sm">
                Cancel
              </button>
              <button
                onClick={handleDeleteSession}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2">
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full Lecture Notes Modal ────────────────────────────────────────── */}
      {showNotesModal && session?.lectureContent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="card max-w-3xl w-full max-h-[85vh] flex flex-col animate-fade-up border border-teal-500/30 shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-xl">
                  📄
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-100">
                    {session.topic || `${session.subject} Lecture Notes`}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="text-teal-400 font-medium">{session.subject}</span>
                    <span>•</span>
                    <span>{session.lectureContent.length} characters</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyNotes(session.lectureContent)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all">
                  {copiedNotes ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedNotes ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button onClick={() => setShowNotesModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-950/60 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-teal-500/30">
              {session.lectureContent}
            </div>

            <div className="p-4 border-t border-white/10 flex items-center justify-end flex-shrink-0 bg-slate-900/40">
              <button onClick={() => setShowNotesModal(false)} className="btn-teal px-5 py-2 text-xs font-semibold">
                Close Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MessageBubble({ message, persona, isSpeaking, onToggleSpeak }) {
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
    <div className="flex gap-3 items-end mb-3 animate-fade-up group">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mb-0.5"
        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}>
        {persona?.avatar || '🤖'}
      </div>
      <div className="max-w-lg">
        <div className="flex items-center justify-between gap-2 mb-1.5 ml-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400/80">{persona?.name || 'Student'}</span>
            {message.phase === 2 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(20,184,166,0.1)', color: '#14B8A6', fontSize: '10px' }}>
                Phase 2
              </span>
            )}
          </div>
          {onToggleSpeak && (
            <button
              onClick={onToggleSpeak}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 opacity-100'
                  : 'opacity-50 group-hover:opacity-100 text-slate-400 hover:text-amber-400 hover:bg-white/5'
              }`}
              title={isSpeaking ? 'Click to Stop Voice' : 'Listen to Student'}>
              {isSpeaking ? (
                <>
                  <VolumeX size={18} className="text-amber-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-amber-400">Stop</span>
                </>
              ) : (
                <Volume2 size={18} />
              )}
            </button>
          )}
        </div>
        <div className="bubble-ai px-4 py-3">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
