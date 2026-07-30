import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Trophy, RotateCcw, LayoutDashboard, CheckCircle2, XCircle, Star } from 'lucide-react'
import useSessionStore from '../store/sessionStore'

export default function Complete() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, activeMisconceptions, understandingLevel, fetchSession } = useSessionStore()
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    fetchSession(id)
    setTimeout(() => setAnimating(true), 100)
  }, [id])

  const score = session?.masteryScore ?? 0
  const corrected = activeMisconceptions.filter(m => m.corrected).length
  const total = activeMisconceptions.length
  const subject = session?.subject
  const persona = session?.aiStudentId
  const mode = session?.mode

  const scoreColor = score >= 80 ? 'text-teal-600' : score >= 60 ? 'text-amber-600' : 'text-slate-800'
  const scoreLabel = score >= 85 ? 'Mastered!' : score >= 70 ? 'Great Job!' : score >= 50 ? 'Good Effort' : 'Keep Practicing'

  const messageForScore = score >= 85
    ? `You've truly mastered this. ${persona?.name} finally understands — because of you.`
    : score >= 70
    ? `Strong teaching. ${persona?.name} learned a lot. A few things still need work.`
    : score >= 50
    ? `You made progress. Come back and push ${persona?.name} to full understanding.`
    : `Keep going — teaching is hard. Try again with a different approach.`

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="max-w-md w-full relative z-10 animate-fade-up">

        {/* Score card */}
        <div className="card p-8 text-center mb-6 shadow-xl border-amber-300">
          {/* Persona speech bubble */}
          <div className="flex items-center justify-center gap-3.5 mb-6 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {persona?.avatar || '🎓'}
            </div>
            <div className="text-left min-w-0">
              <div className="font-bold text-sm text-slate-900">{persona?.name} says:</div>
              <div className="text-xs text-slate-600 font-medium italic truncate">
                "{score >= 80 ? "I think I finally get it! Thanks for explaining." : score >= 60 ? "I understand most of it now." : "I'm still a bit confused on a few points."}"
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="mb-6">
            <div className={`text-8xl font-black font-display tracking-tight transition-all duration-1000 ${scoreColor} ${animating ? 'opacity-100' : 'opacity-0'}`}>
              {score}
            </div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">/ 100 Mastery Score</div>
            <div className="text-2xl font-extrabold uppercase mt-2 text-amber-600 tracking-wide">{scoreLabel}</div>
          </div>

          {/* Message */}
          <p className="text-xs font-medium text-slate-600 leading-relaxed mb-6">{messageForScore}</p>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <ScoreStat label="Understanding" value={`${understandingLevel}%`} color="text-teal-600" />
            <ScoreStat label="Misconceptions" value={`${corrected}/${total}`} color="text-amber-600" />
            <ScoreStat label="Workflow" value={mode === 'lecture' ? '📖' : '⚡'} color="text-purple-600" />
          </div>

          {/* Misconceptions breakdown */}
          {activeMisconceptions.length > 0 && (
            <div className="text-left space-y-2 mb-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Misconception Breakdown</div>
              {activeMisconceptions.map((m, i) => (
                <div key={i} className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-bold border
                  ${m.corrected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  {m.corrected
                    ? <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                    : <XCircle size={15} className="text-rose-500 mt-0.5 flex-shrink-0" />}
                  <span>{m.concept}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stars */}
          <div className="flex justify-center gap-1.5 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={24}
                fill={i <= Math.round(score / 20) ? '#FACC15' : 'none'}
                className={i <= Math.round(score / 20) ? 'text-amber-400' : 'text-slate-200'}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link to="/setup" className="btn-primary py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <RotateCcw size={18} /> Teach Again
            </Link>
            <Link to="/dashboard" className="btn-ghost py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <LayoutDashboard size={18} /> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Subject badge */}
        <div className="text-center text-xs font-bold uppercase text-slate-400">
          {subject} · {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

function ScoreStat({ label, value, color }) {
  return (
    <div className="p-3 rounded-xl text-center bg-slate-50 border border-slate-200">
      <div className={`text-xl font-bold font-display ${color}`}>{value}</div>
      <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}
