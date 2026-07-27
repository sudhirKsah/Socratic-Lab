import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen, Clock, CheckCircle2, PlayCircle, Plus, FileText, Search, GraduationCap } from 'lucide-react'
import AppNav from '../components/layout/AppNav'
import useSessionStore from '../store/sessionStore'

const SUBJECTS = ['All', 'Math', 'Physics', 'Chemistry', 'Programming', 'Writing']
const STATUSES = ['All', 'active', 'complete', 'abandoned']

export default function Sessions() {
  const { pastSessions, fetchSessions } = useSessionStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('sessions') // 'sessions' | 'materials'
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="max-w-6xl mx-auto pt-24 pb-16 px-4 sm:px-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Sessions & Teaching Materials</h1>
            <p className="text-slate-400 text-sm mt-1">Revisit completed sessions, continue active dialogue, or browse your lecture notes.</p>
          </div>
          <Link to="/setup" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 self-start sm:self-auto">
            <Plus size={16} /> New Session
          </Link>
        </div>

        {/* ── Tabs Navigation ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}>
            <BookOpen size={16} /> All Sessions ({pastSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'materials'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}>
            <FileText size={16} /> Teaching Materials & Notes ({lectureSessions.length})
          </button>
        </div>

        {/* ── TAB 1: ALL SESSIONS ────────────────────────────────────────── */}
        {activeTab === 'sessions' && (
          <div>
            {/* Filters */}
            <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by topic, subject, or student name..."
                  className="input-field w-full pl-10 pr-4 py-2 text-sm"
                />
              </div>

              {/* Subject filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 flex-shrink-0">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="input-field px-3 py-2 text-xs bg-slate-800 flex-1 sm:w-36">
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <span className="text-xs text-slate-400 flex-shrink-0 ml-2">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field px-3 py-2 text-xs bg-slate-800 flex-1 sm:w-32">
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
                <h3 className="font-semibold text-base text-slate-300">No sessions found</h3>
                <p className="text-slate-400 text-sm mt-1">Try clearing filters or start a new session.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSessions.map((s) => (
                  <SessionCard key={s._id} session={s} navigate={navigate} />
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
                <h3 className="font-semibold text-base text-slate-300">No lecture notes saved yet</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Start a **Lecture Mode** session and write or upload PDF/DOCX content to build your teaching materials repository.
                </p>
                <Link to="/setup" className="btn-primary px-5 py-2.5 text-sm inline-flex mt-4">
                  Start Lecture Session
                </Link>
              </div>
            ) : (
              Object.entries(materialsBySubject).map(([subj, sessions]) => (
                <div key={subj} className="space-y-4">
                  <h3 className="font-display text-lg font-bold flex items-center gap-2 text-slate-200">
                    <span>{getSubjectIcon(subj)}</span> {subj} Notes ({sessions.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map((s) => (
                      <MaterialCard key={s._id} session={s} navigate={navigate} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function SessionCard({ session, navigate }) {
  const persona = session.aiStudentId
  const isComplete = session.status === 'complete'
  const isAbandoned = session.status === 'abandoned'
  const isActive = session.status === 'active'

  const handleAction = () => {
    if (isComplete) {
      navigate(`/session/${session._id}/complete`)
    } else if (session.mode === 'lecture' && session.phase === 1) {
      navigate(`/session/${session._id}/lecture`)
    } else {
      navigate(`/session/${session._id}`)
    }
  }

  return (
    <div className="card p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
              {persona?.avatar || '🤖'}
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                <span>{persona?.name || 'AI Student'}</span>
                {persona?.gradeLevel && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 inline-flex items-center gap-1">
                    <GraduationCap size={10} /> {persona.gradeLevel}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <Clock size={11} /> {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              isComplete
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isActive
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
            {isComplete ? <CheckCircle2 size={11} /> : isActive ? <PlayCircle size={11} /> : null}
            {isComplete ? 'Completed' : isActive ? 'Active' : 'Abandoned'}
          </span>
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            {session.subject} {session.mode === 'lecture' ? '• 📖 Lecture Mode' : '• ⚡ Socratic Mode'}
          </div>
          <h4 className="font-semibold text-base text-slate-100 line-clamp-1">
            {session.topic || `${session.subject} Session`}
          </h4>
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <div>
          {session.masteryScore != null ? (
            <div className="text-sm font-bold text-amber-400">
              {session.masteryScore}% Mastery
            </div>
          ) : (
            <div className="text-xs text-slate-500">In Progress</div>
          )}
        </div>

        <button
          onClick={handleAction}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isComplete
              ? 'bg-white/10 hover:bg-white/15 text-slate-200'
              : 'btn-primary'
          }`}>
          {isComplete ? 'Review Score & Chat' : isActive ? 'Continue Teaching →' : 'View Session'}
        </button>
      </div>
    </div>
  )
}

function MaterialCard({ session, navigate }) {
  const excerpt = session.lectureContent
    ? session.lectureContent.substring(0, 160) + '...'
    : 'No excerpt available.'

  return (
    <div className="card p-5 space-y-3 hover:border-teal-500/30 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-teal-400 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
          {session.subject} Note
        </span>
        <span className="text-xs text-slate-500">
          {new Date(session.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h4 className="font-semibold text-base text-slate-100">
        {session.topic || `${session.subject} Lecture Notes`}
      </h4>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 bg-slate-900/50 p-3 rounded-lg border border-white/5 font-mono">
        {excerpt}
      </p>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">
          {session.lectureContent?.length || 0} characters
        </span>
        <button
          onClick={() => navigate(`/session/${session._id}`)}
          className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1">
          Open Lecture Session →
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
