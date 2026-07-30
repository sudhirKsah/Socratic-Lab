import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen, Clock, CheckCircle2, PlayCircle, Plus, FileText, Search, GraduationCap, Award, Trash2, Copy, Check, X, FileCode } from 'lucide-react'
import AppNav from '../components/layout/AppNav'
import useSessionStore from '../store/sessionStore'

const SUBJECTS = ['All', 'Math', 'Physics', 'Chemistry', 'Programming', 'Writing']
const STATUSES = ['All', 'active', 'complete', 'abandoned']

export default function Sessions() {
  const { pastSessions, fetchSessions, deleteSession } = useSessionStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('sessions') // 'sessions' | 'materials'
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [deleteModalSession, setDeleteModalSession] = useState(null)
  const [viewNotesSession, setViewNotesSession] = useState(null)
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  // Filtered sessions for Tab 1
  const filteredSessions = pastSessions.filter((s) => {
    const matchesSubject = selectedSubject === 'All' || s.subject === selectedSubject
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !query ||
      s.topic?.toLowerCase().includes(query) ||
      s.subject?.toLowerCase().includes(query) ||
      s.aiStudentId?.name?.toLowerCase().includes(query)

    return matchesSubject && matchesStatus && matchesSearch
  })

  // Group lectures with content for Tab 2 (Teaching Materials)
  const lectureSessions = pastSessions.filter(
    (s) => s.lectureContent && s.lectureContent.trim().length > 0
  )

  const materialsBySubject = SUBJECTS.filter((subj) => subj !== 'All').reduce((acc, subj) => {
    const list = lectureSessions.filter((s) => s.subject === subj)
    if (list.length > 0) acc[subj] = list
    return acc
  }, {})

  const handleDeleteConfirm = async () => {
    if (!deleteModalSession) return
    setIsDeleting(true)
    await deleteSession(deleteModalSession._id)
    setIsDeleting(false)
    setDeleteModalSession(null)
  }

  const handleCopyNotes = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AppNav />
      <main className="max-w-6xl mx-auto pt-24 pb-16 px-4 sm:px-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">Sessions & Teaching Materials</h1>
            <p className="text-slate-600 text-sm font-medium mt-1">Revisit completed sessions, continue active dialogue, manage or read your full lecture notes.</p>
          </div>
          <Link to="/setup" className="btn-primary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 self-start sm:self-auto">
            <Plus size={18} /> New Session
          </Link>
        </div>

        {/* ── Tabs Navigation ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8 pb-3">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-2.5 px-4 font-bold text-xs sm:text-sm transition-all rounded-xl border flex items-center gap-2 cursor-pointer ${
              activeTab === 'sessions'
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}>
            <BookOpen size={16} /> All Sessions ({pastSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`py-2.5 px-4 font-bold text-xs sm:text-sm transition-all rounded-xl border flex items-center gap-2 cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}>
            <FileText size={16} /> Teaching Materials ({lectureSessions.length})
          </button>
        </div>

        {/* ── TAB 1: ALL SESSIONS ────────────────────────────────────────── */}
        {activeTab === 'sessions' && (
          <div>
            {/* Filters */}
            <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by topic, subject, or student name..."
                  className="input-field w-full pl-10 pr-4 py-2.5 text-sm font-medium"
                />
              </div>

              {/* Subject & Status filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold uppercase text-slate-500 flex-shrink-0">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="input-field px-3 py-2 text-xs font-bold bg-white flex-1 sm:w-36">
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <span className="text-xs font-bold uppercase text-slate-500 flex-shrink-0 ml-2">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field px-3 py-2 text-xs font-bold bg-white flex-1 sm:w-32">
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>{st === 'All' ? 'All Status' : st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            {filteredSessions.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-bold text-lg text-slate-900">No sessions found</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Try clearing filters or start a new session.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSessions.map((s) => (
                  <SessionCard
                    key={s._id}
                    session={s}
                    navigate={navigate}
                    onDeleteRequest={(sess) => setDeleteModalSession(sess)}
                    onViewNotesRequest={(sess) => setViewNotesSession(sess)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: TEACHING MATERIALS & LECTURE NOTES ───────────────────── */}
        {activeTab === 'materials' && (
          <div className="space-y-8 animate-fade-in">
            {Object.keys(materialsBySubject).length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="font-bold text-lg text-slate-900">No lecture notes saved yet</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Start a **Lecture Mode** session and write or upload PDF/DOCX content to build your teaching materials repository.
                </p>
                <Link to="/setup" className="btn-primary px-5 py-2.5 text-xs font-bold inline-flex mt-4">
                  Start Lecture Session
                </Link>
              </div>
            ) : (
              Object.entries(materialsBySubject).map(([subj, sessions]) => (
                <div key={subj} className="space-y-4">
                  <h3 className="font-display text-xl font-extrabold flex items-center gap-2 text-slate-900 uppercase tracking-wider">
                    <span>{getSubjectIcon(subj)}</span> {subj} Notes ({sessions.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map((s) => (
                      <MaterialCard
                        key={s._id}
                        session={s}
                        navigate={navigate}
                        onDeleteRequest={(sess) => setDeleteModalSession(sess)}
                        onViewNotesRequest={(sess) => setViewNotesSession(sess)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────────── */}
      {deleteModalSession && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="card p-7 max-w-md w-full animate-fade-up shadow-xl border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-xl text-rose-600 uppercase">
                <Trash2 size={22} /> Delete Session?
              </div>
              <button
                onClick={() => setDeleteModalSession(null)}
                className="text-slate-400 hover:text-slate-900 p-1">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Are you sure you want to delete session for <strong className="text-slate-900">"{deleteModalSession.topic || deleteModalSession.subject}"</strong>?
            </p>
            <p className="text-xs font-medium text-rose-900 bg-rose-50 border border-rose-200 p-3.5 rounded-xl mb-6">
              ⚠️ This will permanently delete the chat history, mastery scores, and all uploaded lecture notes. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalSession(null)}
                className="btn-ghost flex-1 py-2.5 text-xs font-bold uppercase">
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="btn-danger flex-1 py-2.5 text-xs font-bold uppercase">
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW FULL LECTURE NOTES MODAL ────────────────────────────────── */}
      {viewNotesSession && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="card max-w-3xl w-full max-h-[85vh] flex flex-col animate-fade-up shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-2xl font-bold">
                  {getSubjectIcon(viewNotesSession.subject)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                    {viewNotesSession.topic || `${viewNotesSession.subject} Lecture Notes`}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                    <span className="text-amber-600 font-bold">{viewNotesSession.subject}</span>
                    <span>•</span>
                    <span>{viewNotesSession.lectureContent?.length || 0} characters</span>
                    <span>•</span>
                    <span>{new Date(viewNotesSession.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyNotes(viewNotesSession.lectureContent)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase bg-amber-400 text-slate-950 shadow-xs hover:bg-amber-300 flex items-center gap-1.5 transition-all cursor-pointer">
                  {copied ? <Check size={16} className="text-slate-950 stroke-[2.5]" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => setViewNotesSession(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Modal Body — Full Notes Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-[#F8FAFC] font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-amber-200">
              {viewNotesSession.lectureContent}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0 bg-white rounded-b-2xl">
              <span className="text-xs font-medium text-slate-500">
                Uploaded/Written for Lecture Session with <strong>{viewNotesSession.aiStudentId?.name || 'AI Student'}</strong>
              </span>
              <button
                onClick={() => {
                  const s = viewNotesSession
                  setViewNotesSession(null)
                  navigate(`/session/${s._id}`)
                }}
                className="btn-teal px-5 py-2.5 text-xs font-bold uppercase flex items-center gap-1.5">
                <span>Go to Session Chat →</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function SessionCard({ session, navigate, onDeleteRequest, onViewNotesRequest }) {
  const persona = session.aiStudentId
  const isComplete = session.status === 'complete'
  const isActive = session.status === 'active'

  const handleCardClick = () => {
    if (session.mode === 'lecture' && session.phase === 1) {
      navigate(`/session/${session._id}/lecture`)
    } else {
      navigate(`/session/${session._id}`)
    }
  }

  const handleScoreButtonClick = (e) => {
    e.stopPropagation()
    if (isComplete) {
      navigate(`/session/${session._id}/complete`)
    } else {
      handleCardClick()
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="card p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-md cursor-pointer transition-all group relative">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl flex-shrink-0 font-bold">
              {persona?.avatar || '🤖'}
            </div>
            <div>
              <div className="font-bold text-base flex items-center gap-2">
                <span className="text-slate-900 group-hover:text-amber-600 transition-colors">{persona?.name || 'AI Student'}</span>
                {persona?.gradeLevel && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 inline-flex items-center gap-1">
                    <GraduationCap size={11} /> {persona.gradeLevel}
                  </span>
                )}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-2">
                <Clock size={12} /> {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                isComplete
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : isActive
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}>
              {isComplete ? <CheckCircle2 size={12} /> : isActive ? <PlayCircle size={12} /> : null}
              {isComplete ? 'Completed' : isActive ? 'Active' : 'Abandoned'}
            </span>

            {/* Trash / Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteRequest(session)
              }}
              className="p-1.5 rounded-xl bg-white text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
              title="Delete Session">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs font-bold uppercase text-amber-600 tracking-wider mb-1">
            {session.subject} {session.mode === 'lecture' ? '• 📖 Lecture Mode' : '• ⚡ Socratic Mode'}
          </div>
          <h4 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
            {session.topic || `${session.subject} Session`}
          </h4>
        </div>
      </div>

      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          {session.masteryScore != null ? (
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <Award size={16} className="text-amber-500" /> {session.masteryScore}% Mastery
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-500 uppercase">In Progress</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {session.lectureContent && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onViewNotesRequest(session)
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-all flex items-center gap-1 cursor-pointer">
              <FileCode size={13} /> Notes
            </button>
          )}

          <button
            onClick={handleScoreButtonClick}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              isComplete
                ? 'bg-amber-400 text-slate-950 shadow-xs hover:bg-amber-300'
                : 'btn-primary'
            }`}>
            {isComplete ? 'Review Score 🏆' : isActive ? 'Continue →' : 'View Session'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MaterialCard({ session, navigate, onDeleteRequest, onViewNotesRequest }) {
  const excerpt = session.lectureContent
    ? session.lectureContent.substring(0, 200) + '...'
    : 'No excerpt available.'

  return (
    <div className="card p-5 rounded-2xl space-y-3.5 hover:border-teal-300 hover:shadow-md transition-all group relative">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
          {session.subject} Note
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            {new Date(session.createdAt).toLocaleDateString()}
          </span>
          <button
            onClick={() => onDeleteRequest(session)}
            className="p-1 rounded-xl bg-white text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            title="Delete Session & Notes">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h4 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
        {session.topic || `${session.subject} Lecture Notes`}
      </h4>

      <p className="text-xs font-medium text-slate-700 leading-relaxed line-clamp-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono select-none">
        {excerpt}
      </p>

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <button
          onClick={() => onViewNotesRequest(session)}
          className="text-xs font-bold uppercase text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 hover:bg-teal-100 transition-all flex items-center gap-1.5 cursor-pointer">
          <FileText size={14} /> View Full Notes
        </button>

        <button
          onClick={() => navigate(`/session/${session._id}`)}
          className="text-xs font-bold uppercase text-amber-600 hover:underline">
          Open Session →
        </button>
      </div>
    </div>
  )
}

function getSubjectIcon(subject) {
  switch (subject) {
    case 'Math': return '🧮'
    case 'Physics': return '⚡'
    case 'Chemistry': return '🧪'
    case 'Programming': return '💻'
    case 'Writing': return '✍️'
    default: return '📚'
  }
}
