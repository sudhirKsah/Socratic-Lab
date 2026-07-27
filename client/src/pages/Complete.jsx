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

  const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#94A3B8'
  const scoreLabel = score >= 85 ? 'Mastered!' : score >= 70 ? 'Great Job!' : score >= 50 ? 'Good Effort' : 'Keep Practicing'

  const messageForScore = score >= 85
    ? `You've truly mastered this. ${persona?.name} finally understands — because of you.`
    : score >= 70
    ? `Strong teaching. ${persona?.name} learned a lot. A few things still need work.`
    : score >= 50
    ? `You made progress. Come back and push ${persona?.name} to full understanding.`
    : `Keep going — teaching is hard. Try again with a different approach.`

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-glow" style={{
          top: '20%', left: '50%', transform: 'translateX(-50%)',
          background: score >= 80
            ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)'
        }} />
      </div>

      <div className="max-w-md w-full relative z-10 animate-fade-up">

        {/* Score card */}
        <div className={`card p-8 text-center mb-4 ${score >= 85 ? 'mastery-glow' : ''}`}>
          {/* Persona */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {persona?.avatar || '🎓'}
            </div>
            <div className="text-left">
              <div className="font-semibold">{persona?.name} says:</div>
              <div className="text-sm text-slate-400 italic">
                "{score >= 80 ? "I think I finally get it! Thanks for explaining so well." : score >= 60 ? "I understand most of it now. Still a bit fuzzy on some things." : "I'm getting there, but still confused about a few things."}"
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="mb-6">
            <div className={`text-7xl font-bold font-display transition-all duration-1000 ${animating ? 'opacity-100' : 'opacity-0'}`}
              style={{ color: scoreColor }}>
              {score}
            </div>
            <div className="text-slate-500 text-sm">/ 100 Mastery Score</div>
            <div className="text-lg font-semibold mt-1" style={{ color: scoreColor }}>{scoreLabel}</div>
          </div>

          {/* Message */}
          <p className="text-sm text-slate-400 leading-relaxed mb-6">{messageForScore}</p>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <ScoreStat label="Understanding" value={`${understandingLevel}%`} color="#14B8A6" />
            <ScoreStat label="Misconceptions" value={`${corrected}/${total}`} color="#F59E0B" />
            <ScoreStat label="Mode" value={mode === 'lecture' ? '📖' : '⚡'} color="#94A3B8" />
          </div>

          {/* Misconceptions breakdown */}
          {activeMisconceptions.length > 0 && (
            <div className="text-left space-y-2 mb-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Misconception Breakdown</div>
              {activeMisconceptions.map((m, i) => (
                <div key={i} className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs
                  ${m.corrected ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                  {m.corrected
                    ? <CheckCircle2 size={13} style={{ color: '#10B981' }} className="mt-0.5 flex-shrink-0" />
                    : <XCircle size={13} className="text-red-400/60 mt-0.5 flex-shrink-0" />}
                  <span className={m.corrected ? 'text-slate-300' : 'text-slate-500'}>{m.concept}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={20}
                fill={i <= Math.round(score / 20) ? '#F59E0B' : 'none'}
                style={{ color: i <= Math.round(score / 20) ? '#F59E0B' : '#334155' }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link to="/setup" className="btn-primary py-3 text-sm flex items-center justify-center gap-2">
              <RotateCcw size={14} /> Teach Again
            </Link>
            <Link to="/dashboard" className="btn-ghost py-3 text-sm flex items-center justify-center gap-2">
              <LayoutDashboard size={14} /> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Subject badge */}
        <div className="text-center text-xs text-slate-600">
          {subject} · {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

function ScoreStat({ label, value, color }) {
  return (
    <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-lg font-bold font-display" style={{ color }}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
