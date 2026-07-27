import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Brain, Target, Trophy, BookOpen, ChevronRight } from 'lucide-react'

const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Programming', 'Writing']

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose a Subject & Student',
    desc: 'Pick what you want to teach. Select an AI student persona — each one has different misconceptions baked in.',
    icon: <Target size={20} />,
  },
  {
    step: '02',
    title: 'Teach Freely',
    desc: 'Explain the concept in your own words. The AI student listens, pushes back, and asks questions based on what they misunderstand.',
    icon: <Brain size={20} />,
  },
  {
    step: '03',
    title: 'Earn Your Mastery Score',
    desc: 'The clearer your explanations, the faster understanding rises. Correct every misconception to achieve full mastery.',
    icon: <Trophy size={20} />,
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #14B8A6)' }}>
              <Zap size={14} fill="currentColor" className="text-slate-900" />
            </div>
            <span className="font-display font-bold text-base tracking-tight">SocraticLab</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="nav-link px-3 py-1.5">Sign In</Link>
            <Link to="/signup"
              className="btn-primary px-4 py-2 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        {/* Ambient glows */}
        <div className="hero-glow" style={{
          top: '-100px', left: '50%', transform: 'translateX(-60%)',
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)'
        }} />
        <div className="hero-glow" style={{
          top: '100px', right: '-100px',
          background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)'
        }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-wide"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
            <Zap size={11} fill="currentColor" />
            Feynman Technique · Powered by AI
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            The best way to learn
            <br />
            is to <span className="text-gradient">teach it</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            SocraticLab flips the AI tutor. You teach a stubborn AI student who holds real misconceptions.
            Explain clearly, correct what they misunderstand, and earn your mastery score.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup"
              className="btn-primary px-7 py-3.5 text-base flex items-center justify-center gap-2">
              Start Teaching <ArrowRight size={16} />
            </Link>
            <Link to="/login"
              className="btn-ghost px-7 py-3.5 text-base flex items-center justify-center gap-2">
              Sign In <ChevronRight size={16} />
            </Link>
          </div>

          {/* Subject tags */}
          <div className="flex flex-wrap gap-2 justify-center mt-10">
            {SUBJECTS.map((s) => (
              <span key={s} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Hero visual — fake chat window */}
        <div className="max-w-2xl mx-auto mt-16 relative z-10">
          <div className="card p-5 space-y-4 shadow-2xl"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.5)' }}>
            {/* Window bar */}
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 text-center text-xs text-slate-500 font-medium">Teaching Session · Physics</div>
              <div className="text-xs font-semibold" style={{ color: '#14B8A6' }}>⚡ Sam · Understanding 42%</div>
            </div>
            {/* Messages */}
            <div className="space-y-3">
              <ChatBubble role="ai" name="Sam" avatar="⚡"
                text="I still don't get why the wall doesn't get hurt when I punch it. If Newton's 3rd law says forces are equal... shouldn't we both feel the same pain?" />
              <ChatBubble role="user"
                text="Great question Sam! The forces ARE equal — both you and the wall exert the same force on each other. But force isn't the same as damage. F = ma means your soft hand accelerates a lot, while the rigid wall barely moves." />
              <div className="flex items-center gap-2 text-xs ml-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10B981' }} />
                <span style={{ color: '#10B981' }}>+8 pts · Understanding rising...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Three focused steps to become the teacher — and prove you really understand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="card p-6 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
                <div className="absolute -top-4 -right-4 font-display text-6xl font-bold opacity-5 select-none">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two modes ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold mb-3">Two ways to teach</h2>
            <p className="text-slate-400 text-sm">Pick the mode that fits how you learn.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModeCard
              icon="⚡"
              title="Socratic Mode"
              badge="Interactive"
              badgeColor="#F59E0B"
              desc="Jump straight into the conversation. The AI student questions you immediately, revealing misconceptions as you talk."
              points={['Immediate back-and-forth', 'AI reveals confusion naturally', 'Best for review & recall']}
            />
            <ModeCard
              icon="📖"
              title="Lecture Mode"
              badge="Structured"
              badgeColor="#14B8A6"
              desc="Write your full explanation first (or upload a PDF/DOCX). The AI student reads it, then questions you on exactly what was unclear."
              points={['Upload notes or textbook excerpts', 'AI reads your full explanation', 'Best for deep topics']}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center card-elevated p-12 mastery-glow">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="font-display text-3xl font-bold mb-3">Ready to test yourself?</h2>
          <p className="text-slate-400 mb-8">If you can teach it clearly, you truly understand it.</p>
          <Link to="/signup" className="btn-primary px-8 py-4 text-base inline-flex items-center gap-2">
            Start Teaching Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #14B8A6)' }}>
              <Zap size={12} fill="currentColor" className="text-slate-900" />
            </div>
            <span className="font-display font-bold text-sm">SocraticLab</span>
          </div>
          <p className="text-xs text-slate-500">
            Built for better understanding · {new Date().getFullYear()}
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/signup" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ChatBubble({ role, name, avatar, text }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bubble-user px-4 py-2.5 text-sm max-w-xs">{text}</div>
      </div>
    )
  }
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
        {avatar}
      </div>
      <div className="bubble-ai px-4 py-2.5 text-sm max-w-xs">
        <span className="text-xs font-semibold text-amber-400/70 block mb-0.5">{name}</span>
        {text}
      </div>
    </div>
  )
}

function ModeCard({ icon, title, badge, badgeColor, desc, points }) {
  return (
    <div className="card p-7 hover:border-white/15 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-base">{title}</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}30` }}>
            {badge}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">{desc}</p>
      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
            <span style={{ color: badgeColor }}>→</span> {p}
          </li>
        ))}
      </ul>
    </div>
  )
}
