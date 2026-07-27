import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, Type, ChevronRight, FileText, X, Loader2, CheckCircle } from 'lucide-react'
import AppNav from '../components/layout/AppNav'
import useSessionStore from '../store/sessionStore'

export default function LecturePhase1() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    session, lectureWordCount, studentReflection,
    fetchSession, addLectureText, uploadLectureFile, finishPhase1,
  } = useSessionStore()

  const [textInput, setTextInput] = useState('')
  const [activeTab, setActiveTab] = useState('type') // 'type' | 'upload'
  const [uploads, setUploads] = useState([])
  const [saving, setSaving] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [savedWordCount, setSavedWordCount] = useState(0)
  const [showReflection, setShowReflection] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    fetchSession(id)
  }, [id])

  const handleSaveText = async () => {
    if (!textInput.trim() || saving) return
    setSaving(true)
    const ok = await addLectureText(id, textInput.trim())
    if (ok) {
      setSavedWordCount(prev => prev + textInput.trim().split(/\s+/).length)
      setTextInput('')
    }
    setSaving(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const entry = { name: file.name, status: 'uploading', words: 0 }
    setUploads(prev => [...prev, entry])

    const result = await uploadLectureFile(id, file)
    setUploads(prev => prev.map(u =>
      u.name === file.name
        ? { ...u, status: result ? 'done' : 'error', words: result?.extractedWords || 0 }
        : u
    ))
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFinish = async () => {
    if (finishing || lectureWordCount < 20) return
    setFinishing(true)
    const result = await finishPhase1(id)
    setFinishing(false)
    if (result) {
      setShowReflection(true)
    }
  }

  const persona = session?.aiStudentId

  // If reflection is shown, display the transition card
  if (showReflection && studentReflection) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full animate-fade-up">
          <div className="card p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                {persona?.avatar || '🤖'}
              </div>
              <div>
                <div className="font-semibold">{persona?.name}</div>
                <div className="text-xs text-slate-500">Just read your lecture · Phase 2 starting</div>
              </div>
              <div className="ml-auto text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(20,184,166,0.1)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.2)' }}>
                Reflection
              </div>
            </div>

            <div className="p-4 rounded-xl text-sm leading-relaxed text-slate-300"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              "{studentReflection}"
            </div>

            <div className="p-3 rounded-lg text-xs text-amber-400/80"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
              💡 {persona?.name} has read your explanation and formed their understanding. They may have gotten some things wrong.
              In Phase 2, answer their questions and correct their misconceptions.
            </div>

            <button
              onClick={() => navigate(`/session/${id}`)}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              Start Phase 2 — Answer Questions <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="max-w-3xl mx-auto pt-24 pb-16 px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(20,184,166,0.1)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.2)' }}>
              Phase 1 · Lecture Mode
            </div>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">{persona?.avatar || '📖'}</div>
            <h1 className="font-display text-2xl font-bold">Teach {persona?.name}</h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Write your full explanation or upload your notes. {persona?.name} will read everything, then ask questions in Phase 2.
            The more thorough your explanation, the more targeted their questions.
          </p>
        </div>

        {/* Word count progress */}
        <div className="card p-4 mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Lecture Content</span>
            <span className="text-sm font-bold" style={{ color: lectureWordCount >= 50 ? '#10B981' : '#F59E0B' }}>
              {lectureWordCount} words
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(100, (lectureWordCount / 200) * 100)}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-1.5">
            {lectureWordCount < 20 ? `Add at least ${20 - lectureWordCount} more words to continue` : 'Ready to finish Phase 1 ✓'}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5 animate-fade-up"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <TabBtn active={activeTab === 'type'} onClick={() => setActiveTab('type')} icon={<Type size={14} />} label="Type Explanation" />
          <TabBtn active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} icon={<Upload size={14} />} label="Upload File" />
        </div>

        {/* Type tab */}
        {activeTab === 'type' && (
          <div className="animate-fade-in space-y-3">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Explain ${session?.topic || session?.subject || 'the topic'} in your own words. Cover the core concepts, how things work, common mistakes, and any examples you think are helpful. Write as if you're explaining to someone who genuinely doesn't understand it yet.`}
              className="input-field w-full px-4 py-4 text-sm leading-relaxed"
              rows={12}
              style={{ resize: 'vertical' }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">{textInput.split(/\s+/).filter(Boolean).length} words in editor</span>
              <button
                onClick={handleSaveText}
                disabled={!textInput.trim() || saving}
                className="btn-teal px-5 py-2 text-sm flex items-center gap-2 disabled:opacity-40">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {saving ? 'Saving...' : 'Add to Lecture'}
              </button>
            </div>
          </div>
        )}

        {/* Upload tab */}
        {activeTab === 'upload' && (
          <div className="animate-fade-in space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all hover:border-amber-500/40 hover:bg-amber-500/[0.02]"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} />
              <Upload size={28} className="mx-auto mb-3 text-slate-500" />
              <div className="font-medium text-sm mb-1">Click to upload PDF or DOCX</div>
              <div className="text-xs text-slate-500">Max 10MB · Text will be extracted automatically</div>
            </div>

            {uploads.length > 0 && (
              <div className="space-y-2">
                {uploads.map((u, i) => (
                  <div key={i} className="card p-3 flex items-center gap-3">
                    <FileText size={16} className="text-slate-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{u.name}</div>
                      {u.status === 'done' && (
                        <div className="text-xs text-slate-500">{u.words} words extracted</div>
                      )}
                    </div>
                    {u.status === 'uploading' && <Loader2 size={14} className="animate-spin text-amber-400 flex-shrink-0" />}
                    {u.status === 'done' && <CheckCircle size={14} className="flex-shrink-0" style={{ color: '#10B981' }} />}
                    {u.status === 'error' && <X size={14} className="text-red-400 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Finish button */}
        <div className="mt-8 animate-fade-up">
          <button
            onClick={handleFinish}
            disabled={lectureWordCount < 20 || finishing}
            className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {finishing ? (
              <><Loader2 size={15} className="animate-spin" /> {persona?.name} is reading your lecture...</>
            ) : (
              <>{persona?.name}, read this! → <ChevronRight size={15} /></>
            )}
          </button>
          {lectureWordCount < 20 && (
            <p className="text-center text-xs text-slate-600 mt-2">Add more content to enable Phase 2</p>
          )}
        </div>
      </main>
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
        ${active ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`}>
      {icon} {label}
    </button>
  )
}
