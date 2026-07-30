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
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans">

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 hidden lg:flex flex-col border-r border-slate-200 bg-white">

        {/* Persona header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Link to="/sessions" className="text-xs font-bold uppercase text-amber-600 hover:underline flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Sessions
            </Link>
          </div>
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {persona?.avatar || '🤖'}
            </div>
            <div>
              <div className="font-bold text-base text-slate-900">{persona?.name || 'Student'}</div>
              <div className="text-xs text-slate-500 font-medium">{persona?.gradeLevel || subject} Student</div>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i < (persona?.personalityIntensity || 3) ? 'bg-amber-400' : 'bg-slate-200'}`} />
                ))}
                <span className="text-[10px] font-bold uppercase text-slate-500 ml-1">stubborn</span>
              </div>
            </div>
          </div>

          {session?.topic && (
            <div className="text-xs font-medium text-slate-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Topic: <span className="text-amber-700 font-bold">{session.topic}</span>
            </div>
          )}

          {/* View Lecture Notes Button */}
          {session?.lectureContent && (
            <button
              onClick={() => setShowNotesModal(true)}
              className="mt-3 w-full text-xs px-3 py-2 rounded-xl font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <FileText size={15} /> View Full Lecture Notes
            </button>
          )}

          {phase === 2 && (
            <div className="mt-2.5 text-xs px-2.5 py-1 rounded-full text-center font-bold uppercase bg-teal-100 text-teal-800 border border-teal-200">
              Phase 2 · Q&A Mode
            </div>
          )}
        </div>

        {/* Understanding meter */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Understanding</span>
            <span className="text-xl font-black font-display text-slate-900">
              {understandingLevel}<span className="text-xs font-medium text-slate-400">/100</span>
            </span>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${understandingLevel}%`, background: '#14B8A6' }} />
          </div>
          <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mt-2">
            <span>Confused</span>
            <span>Mastered ✦</span>
          </div>
        </div>

        {/* Misconceptions */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Misconceptions</span>
            <span className="text-xs font-bold text-amber-600">
              {activeMisconceptions.filter(m => m.corrected).length}/{activeMisconceptions.length} fixed
            </span>
          </div>
          <div className="space-y-2.5">
            {activeMisconceptions.map((m, i) => (
              <div key={i}
                className={`misconception-item transition-all duration-300 ${m.corrected ? 'corrected' : 'remaining'}`}>
                <div className="flex items-start gap-2">
                  {m.corrected
                    ? <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                    : <XCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-500" />}
                  <div>
                    <div className="font-bold text-xs uppercase">{m.concept}</div>
                    <div className="text-[11px] font-medium mt-0.5 leading-relaxed">{m.wrongBelief}</div>
                    {m.corrected && (
                      <div className="text-[10px] font-bold uppercase mt-1 text-emerald-700">Corrected ✓</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {activeMisconceptions.length === 0 && (
              <div className="text-xs font-medium text-slate-400 text-center py-4">
                Misconceptions will appear as you teach
              </div>
            )}
          </div>
        </div>

        {/* End / View Report / Delete button */}
        <div className="p-4 border-t border-slate-200 space-y-2 bg-slate-50">
          {isComplete ? (
            <button onClick={() => navigate(`/session/${id}/complete`)}
              className="btn-teal w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 uppercase">
              <Award size={15} /> View Score Report
            </button>
          ) : (
            <button onClick={() => setShowEndModal(true)}
              className="bg-rose-500 text-white font-bold rounded-xl w-full py-2.5 text-xs flex items-center justify-center gap-2 uppercase hover:bg-rose-600 transition-all cursor-pointer shadow-xs">
              <Flag size={14} /> End Session
            </button>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-2 text-xs font-bold uppercase text-slate-500 hover:text-rose-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
            <Trash2 size={14} /> Delete Session
          </button>
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200/80 bg-white flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <Link to="/sessions" className="text-slate-500 hover:text-slate-900 lg:hidden pr-2 border-r border-slate-200">
              <ArrowLeft size={18} />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-xl font-bold">
              {persona?.avatar || '🤖'}
            </div>
            <div>
              <div className="font-bold text-base text-slate-900">{persona?.name}</div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-emerald-500' : isStreaming ? 'animate-pulse bg-amber-400' : 'bg-green-500'}`} />
                <span className="text-xs font-medium text-slate-500">{isComplete ? 'Session Completed' : isStreaming ? 'Thinking...' : 'Online'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session?.lectureContent && (
              <button
                onClick={() => setShowNotesModal(true)}
                className="hidden md:flex text-xs px-3 py-1.5 rounded-xl font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-all items-center gap-1.5 cursor-pointer">
                <FileText size={15} /> Full Notes
              </button>
            )}

            {/* Speech Output Toggle */}
            <button
              onClick={() => {
                const next = !voiceEnabled
                setVoiceEnabled(next)
                if (!next) window.speechSynthesis?.cancel()
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition-all border cursor-pointer ${
                voiceEnabled
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs font-extrabold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={voiceEnabled ? 'AI Auto-Voice Enabled (Click to Mute)' : 'AI Auto-Voice Muted (Click to Enable)'}>
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">{voiceEnabled ? 'Auto-Voice ON' : 'Auto-Voice OFF'}</span>
            </button>

            {isComplete && (
              <button
                onClick={() => navigate(`/session/${id}/complete`)}
                className="btn-primary text-xs px-3.5 py-1.5 font-bold uppercase flex items-center gap-1.5">
                <Award size={15} /> Score ({session?.masteryScore || understandingLevel}%)
              </button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-xl bg-white text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Session">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Completed session notification banner */}
        {isComplete && (
          <div className="bg-amber-100 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-amber-900 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-700" />
              <span>This session is completed with a <strong>{session?.masteryScore || understandingLevel}% Mastery Score</strong>. You are reviewing past dialogue in read-only mode.</span>
            </div>
            <button
              onClick={() => navigate(`/session/${id}/complete`)}
              className="font-bold uppercase bg-amber-400 text-slate-950 px-3 py-1 rounded-xl hover:bg-amber-300 flex items-center gap-1 cursor-pointer">
              Score Card <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-3">
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
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-lg font-bold flex-shrink-0 mb-0.5">
                {persona?.avatar || '🤖'}
              </div>
              <div className="bubble-ai px-4 py-3 max-w-lg">
                {streamBuffer ? (
                  <p className="text-sm leading-relaxed">{streamBuffer}<span className="inline-block w-2 h-4 bg-amber-400 animate-pulse ml-0.5 align-middle" /></p>
                ) : (
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" />
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
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
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold bg-white border border-slate-200 shadow-xs">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                lastEval.delta > 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}>
                {lastEval.delta > 0 ? `+${lastEval.delta}` : lastEval.delta} pts
              </span>
              <span className="text-slate-800 flex-1 font-medium">{lastEval.reasoning}</span>
              <span className="text-amber-600 font-bold uppercase hidden sm:block">{lastEval.encouragement}</span>
            </div>
          </div>
        )}

        {/* Dynamic Teaching Hint panel */}
        {showHint && !isComplete && (
          <div className="mx-4 sm:mx-6 mb-3 p-4 rounded-2xl text-xs animate-fade-up bg-amber-50 text-slate-900 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm uppercase text-amber-900">
                <Lightbulb size={18} className="text-amber-500" /> Dynamic Teaching Strategy
              </div>
              <button
                onClick={() => setShowHint(false)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-lg transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {currentTargetMisconception ? (
              <div className="space-y-2 font-medium">
                <div className="flex items-center gap-1.5 font-bold uppercase text-amber-900">
                  <Target size={15} /> Focus Concept: <span>"{currentTargetMisconception.concept}"</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Student's misconception:</strong> "{currentTargetMisconception.wrongBelief}"
                </p>
                <div className="text-slate-900 bg-white p-3 rounded-xl border border-amber-200 mt-2 font-medium">
                  💡 <strong>Suggested approach:</strong> {currentTargetMisconception.hint || `Use a real-world example or step-by-step counter-example to show why this assumption fails.`}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase">
                  <Sparkles size={16} /> All initial misconceptions resolved!
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Ask <strong>{persona?.name}</strong> to summarize the main concept in their own words or ask if they have any remaining doubts.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-slate-200 bg-white">
          <div className="flex gap-3 items-end">
            {!isComplete && (
              <>
                <button onClick={() => setShowHint(!showHint)}
                  className={`flex-shrink-0 p-3 rounded-xl transition-all border font-bold cursor-pointer ${
                    showHint ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Teaching hint">
                  <Lightbulb size={18} />
                </button>

                {/* Free Speech-to-Text Mic Button */}
                <button onClick={toggleListening}
                  className={`flex-shrink-0 p-3 rounded-xl transition-all border font-bold cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak to AI Student (Free Mic)'}>
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
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
                className="input-field w-full px-4 py-3 text-sm font-medium leading-relaxed disabled:opacity-50"
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
                className="flex-shrink-0 btn-primary p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                <Send size={18} />
              </button>
            )}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-2.5 text-center flex items-center justify-center gap-2">
            {isListening && <span className="text-rose-600 font-bold animate-pulse uppercase">● Recording Voice</span>}
            <span>{isComplete ? 'Completed session history • Read-only' : 'Press Enter to send · Click 🎙️ for Free Mic Voice Mode'}</span>
          </div>
        </div>
      </div>

      {/* ── End Session Modal ─────────────────────────────────────────────── */}
      {showEndModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="card p-7 max-w-sm w-full animate-fade-up shadow-xl">
            <h3 className="font-display font-extrabold text-xl mb-2 text-slate-900">End this session?</h3>
            <p className="text-sm font-medium text-slate-600 mb-6">
              Your progress will be saved and you'll receive a mastery score.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndModal(false)} className="btn-ghost flex-1 py-2.5 text-xs font-bold uppercase">
                Keep Teaching
              </button>
              <button
                onClick={async () => {
                  const { default: api } = await import('../services/api')
                  await api.post(`/sessions/${id}/complete`)
                  navigate(`/session/${id}/complete`)
                }}
                className="btn-danger flex-1 py-2.5 text-xs font-bold uppercase">
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Session Modal ───────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="card p-7 max-w-md w-full animate-fade-up shadow-xl border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-xl text-rose-600 uppercase">
                <Trash2 size={22} /> Delete Session?
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-900 p-1">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              Are you sure you want to delete this session?
            </p>
            <p className="text-xs font-medium text-rose-900 bg-rose-50 border border-rose-200 p-3.5 rounded-xl mb-6">
              ⚠️ This will permanently remove the transcript, evaluator metrics, and all associated lecture notes.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-ghost flex-1 py-2.5 text-xs font-bold uppercase">
                Cancel
              </button>
              <button
                onClick={handleDeleteSession}
                disabled={isDeleting}
                className="btn-danger flex-1 py-2.5 text-xs font-bold uppercase">
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full Lecture Notes Modal ────────────────────────────────────────── */}
      {showNotesModal && session?.lectureContent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="card max-w-3xl w-full max-h-[85vh] flex flex-col animate-fade-up shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-xl font-bold">
                  📄
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {session.topic || `${session.subject} Lecture Notes`}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                    <span className="text-amber-600 font-bold">{session.subject}</span>
                    <span>•</span>
                    <span>{session.lectureContent.length} characters</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyNotes(session.lectureContent)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase bg-amber-400 text-slate-950 shadow-xs hover:bg-amber-300 flex items-center gap-1.5 transition-all cursor-pointer">
                  {copiedNotes ? <Check size={16} className="text-slate-950 stroke-[2.5]" /> : <Copy size={16} />}
                  <span>{copiedNotes ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button onClick={() => setShowNotesModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#F8FAFC] font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-amber-200">
              {session.lectureContent}
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-end flex-shrink-0 bg-white rounded-b-2xl">
              <button onClick={() => setShowNotesModal(false)} className="btn-teal px-6 py-2.5 text-xs font-bold uppercase">
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
      <div className="flex justify-end mb-2 animate-fade-up">
        <div className="bubble-user px-4 py-3 max-w-lg">
          <p className="text-sm leading-relaxed font-semibold">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-end mb-2 animate-fade-up group">
      <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-lg font-bold flex-shrink-0 mb-0.5">
        {persona?.avatar || '🤖'}
      </div>
      <div className="max-w-lg">
        <div className="flex items-center justify-between gap-2 mb-1.5 ml-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">{persona?.name || 'Student'}</span>
            {message.phase === 2 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-teal-100 text-teal-800 border border-teal-200">
                Phase 2
              </span>
            )}
          </div>
          {onToggleSpeak && (
            <button
              onClick={onToggleSpeak}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-950 border-amber-500 animate-pulse'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={isSpeaking ? 'Click to Stop Voice' : 'Listen to Student'}>
              {isSpeaking ? (
                <>
                  <VolumeX size={14} />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} />
                  <span>Audio</span>
                </>
              )}
            </button>
          )}
        </div>
        <div className="bubble-ai px-4 py-3">
          <p className="text-sm leading-relaxed text-slate-900">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
