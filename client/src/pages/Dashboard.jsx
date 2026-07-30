import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Clock, Trophy, BookOpen, ChevronRight, Flame, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react'
import AppNav from '../components/layout/AppNav'
import useAuthStore from '../store/authStore'
import useSessionStore from '../store/sessionStore'

const SUBJECTS = [
  { name: 'Math', icon: '🧮', color: '#FACC15' },
  { name: 'Physics', icon: '⚡', color: '#14B8A6' },
  { name: 'Chemistry', icon: '🧪', color: '#10B981' },
  { name: 'Programming', icon: '💻', color: '#A855F7' },
  { name: 'Writing', icon: '✍️', desc: 'Grammar, style & argumentation', color: '#F43F5E' },
]

export default function Dashboard() {
  const { user, fetchUser } = useAuthStore()
  const { pastSessions, fetchSessions, resetSetup } = useSessionStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUser()
    fetchSessions()
    resetSetup()
  }, [])

  // Calculate real-time derived stats from pastSessions array as fallback
  const userProgress = user?.progress || {}
  const derivedProgress = { ...userProgress }
  let derivedMasterySum = 0

  pastSessions.forEach((s) => {
    if (s.masteryScore != null) {
      derivedMasterySum += s.masteryScore
      const existing = derivedProgress[s.subject] || 0
      if (s.masteryScore > existing) {
        derivedProgress[s.subject] = s.masteryScore
      }
    }
  })

  // Count distinct subjects tried in past sessions
  const subjectsTriedSet = new Set([
    ...Object.keys(userProgress).filter((k) => userProgress[k] > 0),
    ...pastSessions.map((s) => s.subject),
  ])

  const displayTotalSessions = Math.max(user?.totalSessions || 0, pastSessions.length)
  const displayTotalMastery = Math.max(user?.totalMasteryPoints || 0, derivedMasterySum)
  const displaySubjectsTried = subjectsTriedSet.size

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AppNav />
      <main className="max-w-6xl mx-auto pt-24 pb-16 px-4 sm:px-6">

        {/* ── Welcome header ──────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="animate-fade-up">
            <p className="text-xs font-bold uppercase text-amber-600 mb-1 tracking-wider">Welcome back,</p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {user?.name || user?.email?.split('@')[0] || 'Teacher'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/sessions" className="btn-ghost px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2">
              <BookOpen size={16} /> Sessions & Notes
            </Link>
            <Link to="/setup" className="btn-primary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2">
              <Plus size={18} /> Start Teaching
            </Link>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 animate-fade-up">
          <StatCard icon={<Flame size={22} className="text-amber-700" />} label="Sessions" value={displayTotalSessions} color="bg-amber-100 border-amber-200" />
          <StatCard icon={<Trophy size={22} className="text-teal-700" />} label="Mastery Points" value={displayTotalMastery} color="bg-teal-100 border-teal-200" />
          <StatCard
            icon={<BookOpen size={22} className="text-purple-700" />}
            label="Subjects Tried"
            value={displaySubjectsTried}
            color="bg-purple-100 border-purple-200"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Subject Progress ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-fade-up">
              <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">
                Subject Progress
              </h2>
              <div className="card p-6 space-y-5">
                {SUBJECTS.map((s) => {
                  const score = derivedProgress[s.name] || 0
                  return (
                    <div key={s.name} className="flex items-center gap-3.5">
                      <span className="text-2xl w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">{s.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-slate-900">{s.name}</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {score > 0 ? `${score}% Mastery` : 'Not started'}
                          </span>
                        </div>
                        <div className="meter-track">
                          <div className="meter-fill" style={{ width: `${score}%`, background: s.color }} />
                        </div>
                      </div>
                      <Link to="/setup" onClick={() => useSessionStore.getState().setSelectedSubject(s.name)} className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer">
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Recent Sessions ─────────────────────────────────────────────── */}
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Recent Sessions</h2>
                {pastSessions.length > 0 && (
                  <Link to="/sessions" className="text-xs text-amber-600 hover:underline flex items-center gap-1 font-bold uppercase">
                    View All ({pastSessions.length}) <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              {pastSessions.length === 0 ? (
                <div className="card p-10 text-center">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="text-slate-700 text-sm font-semibold">No sessions yet.</p>
                  <Link to="/setup" className="btn-primary px-5 py-2.5 text-xs font-bold inline-flex mt-4">
                    Start your first session
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastSessions.slice(0, 5).map((s) => (
                    <SessionRow key={s._id} session={s} navigate={navigate} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Start sidebar ─────────────────────────────────────────── */}
          <div className="space-y-4 animate-slide-right">
            <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Quick Start</h2>
            {SUBJECTS.map((s) => (
              <Link to="/setup" key={s.name}
                onClick={() => useSessionStore.getState().setSelectedSubject(s.name)}
                className="flex items-center gap-3 card p-4 hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500 font-medium">
                    {derivedProgress[s.name] ? `Best: ${derivedProgress[s.name]}%` : 'Start teaching'}
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color, className = '' }) {
  return (
    <div className={`card p-4 flex items-center gap-3.5 ${className}`}>
      <div className={`w-11 h-11 rounded-xl ${color} border flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black font-display text-slate-900">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase">{label}</div>
      </div>
    </div>
  )
}

function SessionRow({ session, navigate }) {
  const persona = session.aiStudentId
  const isComplete = session.status === 'complete'
  const isAbandoned = session.status === 'abandoned'
  const statusLabel = isComplete ? 'Complete' : isAbandoned ? 'Abandoned' : 'Active'

  const handleClick = () => {
    if (isComplete) {
      navigate(`/session/${session._id}/complete`)
    } else {
      if (session.mode === 'lecture' && session.phase === 1) {
        navigate(`/session/${session._id}/lecture`)
      } else {
        navigate(`/session/${session._id}`)
      }
    }
  }

  return (
    <div
      onClick={handleClick}
      className="card p-4 flex items-center gap-3.5 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group">
      <div className="text-2xl w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
        {persona?.avatar || '🤖'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
          <span>{persona?.name || 'AI Student'}</span>
          <span className="text-slate-300">•</span>
          <span className="text-amber-700 truncate">{session.topic || session.subject}</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 font-medium">
          <Clock size={13} />
          {new Date(session.createdAt).toLocaleDateString()}
          <span className="px-2 py-0.5 rounded-full font-bold text-slate-800 bg-amber-100 border border-amber-200 text-[10px] uppercase">
            {session.mode === 'lecture' ? '📖 Lecture' : '⚡ Socratic'}
          </span>
        </div>
      </div>
      <div className="text-right flex-shrink-0 flex items-center gap-3">
        <div>
          {session.masteryScore != null && (
            <div className="text-sm font-bold text-slate-900">
              {session.masteryScore}%
            </div>
          )}
          <div className={`text-xs font-bold uppercase flex items-center justify-end gap-1 ${
            isComplete ? 'text-emerald-600' : isAbandoned ? 'text-rose-600' : 'text-teal-600'
          }`}>
            {isComplete ? <CheckCircle2 size={13} /> : !isAbandoned ? <PlayCircle size={13} /> : null}
            {statusLabel}
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
      </div>
    </div>
  )
}
