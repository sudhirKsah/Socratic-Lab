import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Clock, Trophy, BookOpen, ChevronRight, Flame, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react'
import AppNav from '../components/layout/AppNav'
import useAuthStore from '../store/authStore'
import useSessionStore from '../store/sessionStore'

const SUBJECTS = [
  { name: 'Math', icon: '🧮', color: '#6366F1' },
  { name: 'Physics', icon: '⚡', color: '#F59E0B' },
  { name: 'Chemistry', icon: '🧪', color: '#10B981' },
  { name: 'Programming', icon: '💻', color: '#14B8A6' },
  { name: 'Writing', icon: '✍️', desc: 'Grammar, style & argumentation', color: '#EC4899' },
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
    <div className="min-h-screen">
      <AppNav />
      <main className="max-w-6xl mx-auto pt-24 pb-16 px-4 sm:px-6">

        {/* ── Welcome header ──────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="animate-fade-up">
            <p className="text-sm text-slate-500 mb-1">Welcome back,</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              {user?.name || user?.email?.split('@')[0] || 'Teacher'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/sessions" className="btn-ghost px-4 py-2.5 text-sm flex items-center gap-2">
              <BookOpen size={15} /> View All Sessions & Notes
            </Link>
            <Link to="/setup" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
              <Plus size={16} /> Start Teaching
            </Link>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 animate-fade-up">
          <StatCard icon={<Flame size={18} style={{ color: '#F59E0B' }} />} label="Sessions" value={displayTotalSessions} />
          <StatCard icon={<Trophy size={18} style={{ color: '#10B981' }} />} label="Mastery Points" value={displayTotalMastery} />
          <StatCard
            icon={<BookOpen size={18} style={{ color: '#14B8A6' }} />}
            label="Subjects Tried"
            value={displaySubjectsTried}
            className="col-span-2 sm:col-span-1"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Subject Progress ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-fade-up">
              <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                <span>Subject Progress</span>
              </h2>
              <div className="card p-5 space-y-5">
                {SUBJECTS.map((s) => {
                  const score = derivedProgress[s.name] || 0
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center">{s.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium">{s.name}</span>
                          <span className="text-xs font-semibold" style={{ color: s.color }}>
                            {score > 0 ? `${score}% Mastery` : 'Not started'}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${s.color}99, ${s.color})` }} />
                        </div>
                      </div>
                      <Link to="/setup" onClick={() => useSessionStore.getState().setSelectedSubject(s.name)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Recent Sessions ─────────────────────────────────────────────── */}
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base">Recent Sessions</h2>
                {pastSessions.length > 0 && (
                  <Link to="/sessions" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                    View All ({pastSessions.length}) <ArrowRight size={12} />
                  </Link>
                )}
              </div>

              {pastSessions.length === 0 ? (
                <div className="card p-10 text-center">
                  <div className="text-3xl mb-3">📚</div>
                  <p className="text-slate-400 text-sm">No sessions yet.</p>
                  <Link to="/setup" className="btn-primary px-4 py-2 text-sm inline-flex mt-4">
                    Start your first session
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pastSessions.slice(0, 5).map((s) => (
                    <SessionRow key={s._id} session={s} navigate={navigate} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Start sidebar ─────────────────────────────────────────── */}
          <div className="space-y-4 animate-slide-right">
            <h2 className="font-semibold text-base mb-4">Quick Start</h2>
            {SUBJECTS.map((s) => (
              <Link to="/setup" key={s.name}
                onClick={() => useSessionStore.getState().setSelectedSubject(s.name)}
                className="flex items-center gap-3 card p-3.5 hover:border-white/15 transition-all group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    {derivedProgress[s.name] ? `Best: ${derivedProgress[s.name]}%` : 'Start teaching'}
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, className = '' }) {
  return (
    <div className={`card p-4 flex items-center gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)' }}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold font-display">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}

function SessionRow({ session, navigate }) {
  const persona = session.aiStudentId
  const isComplete = session.status === 'complete'
  const isAbandoned = session.status === 'abandoned'
  const statusColor = isComplete ? '#10B981' : isAbandoned ? '#EF4444' : '#F59E0B'
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
      className="card p-4 flex items-center gap-3 cursor-pointer hover:border-amber-500/30 transition-all group">
      <div className="text-xl w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5">
        {persona?.avatar || '🤖'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate flex items-center gap-2">
          <span>{persona?.name || 'AI Student'}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 truncate">{session.topic || session.subject}</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
          <Clock size={11} />
          {new Date(session.createdAt).toLocaleDateString()}
          <span className="px-1.5 py-0.5 rounded text-amber-400" style={{ background: 'rgba(245,158,11,0.1)', fontSize: '10px' }}>
            {session.mode === 'lecture' ? '📖 Lecture' : '⚡ Socratic'}
          </span>
        </div>
      </div>
      <div className="text-right flex-shrink-0 flex items-center gap-3">
        <div>
          {session.masteryScore != null && (
            <div className="text-sm font-bold" style={{ color: '#F59E0B' }}>
              {session.masteryScore}%
            </div>
          )}
          <div className="text-xs font-medium flex items-center justify-end gap-1" style={{ color: statusColor }}>
            {isComplete ? <CheckCircle2 size={11} /> : !isAbandoned ? <PlayCircle size={11} /> : null}
            {statusLabel}
          </div>
        </div>
        <ChevronRight size={15} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
      </div>
    </div>
  )
}
