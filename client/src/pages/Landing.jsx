import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Brain, Target, Trophy, BookOpen, ChevronRight, Mic, Volume2, Sparkles, Award, FileText, CheckCircle2, ShieldCheck } from 'lucide-react'

const DEMO_SESSIONS = [
  {
    subject: 'Physics',
    avatar: '⚡',
    studentName: 'Sam (Grade 10)',
    misconception: 'Thinks punching a wall delivers force to the wall, but the wall doesn\'t push back on your hand.',
    userExplanation: 'Newton\'s 3rd Law states forces are equal and opposite. The wall pushes back on your hand with exact same force!',
    scoreDelta: '+12 pts',
    understanding: 78,
  },
  {
    subject: 'Programming',
    avatar: '💻',
    studentName: 'Alex (B.Tech CS)',
    misconception: 'Believes array lookups are O(n) because the computer scans elements sequentially.',
    userExplanation: 'Arrays store elements in contiguous memory. Using array[i], memory address is base + i * size in O(1) time!',
    scoreDelta: '+15 pts',
    understanding: 92,
  },
  {
    subject: 'Math',
    avatar: '🧮',
    studentName: 'Maya (Middle School)',
    misconception: 'Thinks multiplying two negative numbers makes a smaller negative number.',
    userExplanation: 'A negative means taking away or turning around. Taking away a debt (negative) adds to your wealth (positive)!',
    scoreDelta: '+10 pts',
    understanding: 85,
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose a Subject & Student',
    desc: 'Pick what you want to teach. Select an AI student persona — each one has different misconceptions baked in.',
    icon: <Target size={20} />,
  },
  {
    step: '02',
    title: 'Teach Freely (Voice or Text)',
    desc: 'Explain concepts in your own words or speak via free browser mic. The AI student pushes back with authentic misconceptions.',
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
  const [activeDemo, setActiveDemo] = useState(0)
  const currentDemo = DEMO_SESSIONS[activeDemo]

  return (
    <div className="min-h-screen text-slate-100" style={{ background: '#0F172A' }}>
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 left-0 right-0 z-40 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #14B8A6)' }}>
              <Zap size={14} fill="currentColor" className="text-slate-900" />
            </div>
            <span className="font-display font-bold text-base tracking-tight">SocraticLab</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="nav-link px-3 py-1.5 text-sm">Sign In</Link>
            <Link to="/signup" className="btn-primary px-4 py-2 text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-20 px-6 overflow-hidden">
        {/* Ambient glows */}
        <div className="hero-glow" style={{
          top: '-100px', left: '50%', transform: 'translateX(-60%)',
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)'
        }} />
        <div className="hero-glow" style={{
          top: '100px', right: '-100px',
          background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)'
        }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-wide"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
            <Zap size={12} fill="currentColor" />
            Feynman Technique · AI Reverse Learning Platform
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            The best way to learn
            <br />
            is to <span className="text-gradient">teach it</span>
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            SocraticLab flips traditional tutoring. You become the teacher to an AI student who holds realistic misconceptions.
            Teach via voice or text, correct their misunderstandings, and earn your mastery score.
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

        </div>

        {/* ── Interactive Demo Visualizer Widget ─────────────────────────────── */}
        <div className="max-w-3xl mx-auto mt-14 relative z-10">
          <div className="card p-6 space-y-4 shadow-2xl border border-white/10"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.6)' }}>

            {/* Tab switch */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                {DEMO_SESSIONS.map((demo, idx) => (
                  <button
                    key={demo.subject}
                    onClick={() => setActiveDemo(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeDemo === idx
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}>
                    {demo.avatar} {demo.subject}
                  </button>
                ))}
              </div>
              <div className="text-xs font-bold text-teal-400 flex items-center gap-1">
                <span>{currentDemo.understanding}% Mastery</span>
              </div>
            </div>

            {/* Simulated Live Chat */}
            <div className="space-y-3.5 py-1">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-base flex-shrink-0">
                  {currentDemo.avatar}
                </div>
                <div className="bubble-ai px-4 py-3 text-xs sm:text-sm max-w-xl">
                  <span className="text-xs font-semibold text-amber-400 block mb-1">{currentDemo.studentName}</span>
                  "{currentDemo.misconception}"
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bubble-user px-4 py-3 text-xs sm:text-sm max-w-xl">
                  <span className="text-xs font-semibold text-teal-300 block mb-1">Teacher (You)</span>
                  {currentDemo.userExplanation}
                </div>
              </div>

              {/* SSE Score Feedback */}
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 size={15} />
                  <span>Real-Time Evaluator: Concept Corrected! ({currentDemo.scoreDelta})</span>
                </div>
                <span className="text-slate-400 text-[11px]">Sub-200ms SSE Stream</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Feature Cards ────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-white/[0.06]" style={{ background: '#111827' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">Why SocraticLab</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Purpose-built features that transform passive studying into active, Feynman-technique mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Mic size={20} className="text-amber-400" />}
              title="100% Free Voice Mode"
              desc="Speak directly to your AI student using Web Speech API mic transcription & text-to-speech audio with zero API cost."
            />
            <FeatureCard
              icon={<FileText size={20} className="text-teal-400" />}
              title="PDF / DOCX Ingestion"
              desc="Upload your lecture notes. The AI extracts authentic student misconceptions automatically in Lecture Mode."
            />
            <FeatureCard
              icon={<Sparkles size={20} className="text-amber-400" />}
              title="Class Level Customization"
              desc="Pre-seeded and AI-generated personas across Class 6-10, High School, and B.Tech undergrad levels."
            />
            <FeatureCard
              icon={<Award size={20} className="text-teal-400" />}
              title="Dedicated Sessions Hub"
              desc="Revisit active sessions to continue teaching, or review read-only completed sessions and mastery scorecards."
            />
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
              <div key={item.step} className="card p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
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

      {/* ── Two Modes ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold mb-3">Two Ways to Teach</h2>
            <p className="text-slate-400 text-sm">Pick the mode that fits how you learn.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModeCard
              icon="⚡"
              title="Socratic Mode"
              badge="Interactive Q&A"
              badgeColor="#F59E0B"
              desc="Jump straight into the conversation. The AI student opens the session with an authentic doubt, revealing misconceptions as you talk."
              points={['Immediate back-and-forth dialogue', 'AI student speaks first with doubt', 'Best for active recall & quick testing']}
            />
            <ModeCard
              icon="📖"
              title="Lecture Mode"
              badge="Text / PDF Upload"
              badgeColor="#14B8A6"
              desc="Upload a PDF/DOCX or write lecture notes. The AI extracts 3-4 misconceptions, writes a student reflection, and enters Q&A."
              points={['Upload course syllabus or lecture notes', 'AI extracts misconceptions automatically', 'Best for complex textbook chapters']}
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

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card p-6 hover:border-amber-500/30 transition-all space-y-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-semibold text-base text-slate-100">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
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
