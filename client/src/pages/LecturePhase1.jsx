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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
        <div className="max-w-xl w-full animate-fade-up">
          <div className="card p-7 space-y-5 shadow-xl border-amber-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl font-bold">
                {persona?.avatar || '🤖'}
              </div>
              <div>
                <div className="font-bold text-lg text-slate-900">{persona?.name}</div>
                <div className="text-xs text-slate-500 font-medium">Just read your lecture · Phase 2 starting</div>
              </div>
              <div className="ml-auto text-xs px-3 py-1 rounded-full font-bold uppercase bg-teal-100 text-teal-800 border border-teal-200">
                Reflection
              </div>
            </div>

            <div className="p-4 rounded-xl text-sm leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 font-medium italic">
              "{studentReflection}"
            </div>

            <div className="p-3.5 rounded-xl text-xs text-slate-900 font-medium bg-amber-50 border border-amber-200">
              💡 <strong>{persona?.name}</strong> has read your explanation and formed their understanding. They may have gotten some things wrong.
              In Phase 2, answer their questions and correct their misconceptions.
            </div>

            <button
              onClick={() => navigate(`/session/${id}`)}
              className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2">
              Start Phase 2 — Answer Questions <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AppNav />
      <main className="max-w-3xl mx-auto pt-24 pb-16 px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs px-3 py-1 rounded-full font-bold uppercase bg-teal-100 text-teal-800 border border-teal-200">
              Phase 1 · Lecture Mode
            </div>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">{persona?.avatar || '📖'}</div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900">Teach {persona?.name}</h1>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            Write your full explanation or upload your notes. {persona?.name} will read everything, then ask questions in Phase 2.
            The more thorough your explanation, the more targeted their questions.
          </p>
        </div>

        {/* Word count progress */}
        <div className="card p-5 mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-900">Lecture Content</span>
            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {lectureWordCount} words
            </span>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${Math.min(100, (lectureWordCount / 200) * 100)}%`, background: '#14B8A6' }} />
          </div>
          <div className="text-xs font-medium text-slate-500 mt-2">
            {lectureWordCount < 20 ? `Add at least ${20 - lectureWordCount} more words to continue` : 'Ready to finish Phase 1 ✓'}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl mb-5 animate-fade-up bg-white border border-slate-200 shadow-xs">
          <TabBtn active={activeTab === 'type'} onClick={() => setActiveTab('type')} icon={<Type size={16} />} label="Type Explanation" />
          <TabBtn active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} icon={<Upload size={16} />} label="Upload File" />
        </div>

        {/* Type tab */}
        {activeTab === 'type' && (
          <div className="animate-fade-in space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Explain ${session?.topic || session?.subject || 'the topic'} in your own words. Cover the core concepts, how things work, common mistakes, and any examples you think are helpful. Write as if you're explaining to someone who genuinely doesn't understand it yet.`}
              className="input-field w-full px-4 py-4 text-sm leading-relaxed font-medium"
              rows={12}
              style={{ resize: 'vertical' }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">{textInput.split(/\s+/).filter(Boolean).length} words in editor</span>
              <button
                onClick={handleSaveText}
                disabled={!textInput.trim() || saving}
                className="btn-teal px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-40">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
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
              className="border-2 border-dashed border-slate-300 bg-white rounded-2xl p-10 text-center cursor-pointer transition-all hover:bg-slate-50 hover:border-amber-400">
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} />
              <Upload size={36} className="mx-auto mb-3 text-amber-500" />
              <div className="font-bold text-base text-slate-900 mb-1">Click to upload PDF or DOCX</div>
              <div className="text-xs font-medium text-slate-500">Max 10MB · Text will be extracted automatically</div>
            </div>

            {uploads.length > 0 && (
              <div className="space-y-2">
                {uploads.map((u, i) => (
                  <div key={i} className="card p-3.5 flex items-center gap-3">
                    <FileText size={20} className="text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{u.name}</div>
                      {u.status === 'done' && (
                        <div className="text-xs font-bold text-emerald-600">{u.words} words extracted</div>
                      )}
                    </div>
                    {u.status === 'uploading' && <Loader2 size={16} className="animate-spin text-amber-500 flex-shrink-0" />}
                    {u.status === 'done' && <CheckCircle size={18} className="flex-shrink-0 text-emerald-600 stroke-[2.5]" />}
                    {u.status === 'error' && <X size={18} className="text-rose-500 flex-shrink-0 stroke-[2.5]" />}
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
            className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {finishing ? (
              <><Loader2 size={16} className="animate-spin" /> {persona?.name} is reading your lecture...</>
            ) : (
              <>{persona?.name}, read this! → <ChevronRight size={18} /></>
            )}
          </button>
          {lectureWordCount < 20 && (
            <p className="text-center text-xs font-medium text-slate-500 mt-2.5">Add more content to enable Phase 2</p>
          )}
        </div>
      </main>
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all cursor-pointer ${
        active
          ? 'bg-amber-400 text-slate-950 shadow-xs'
          : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`}>
      {icon} {label}
    </button>
  )
}
