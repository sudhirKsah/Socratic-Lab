import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Brain, Target, Trophy, ChevronRight, Mic, Sparkles, Award, FileText, CheckCircle2 } from 'lucide-react'

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
    icon: <Target size={22} className="text-black" />,
  },
  {
    step: '02',
    title: 'Teach Freely (Voice or Text)',
    desc: 'Explain concepts in your own words or speak via free browser mic. The AI student pushes back with authentic misconceptions.',
    icon: <Brain size={22} className="text-black" />,
  },
  {
    step: '03',
    title: 'Earn Your Mastery Score',
    desc: 'The clearer your explanations, the faster understanding rises. Correct every misconception to achieve full mastery.',
    icon: <Trophy size={22} className="text-black" />,
  },
]

export default function Landing() {
  const [activeDemo, setActiveDemo] = useState(0)
  const currentDemo = DEMO_SESSIONS[activeDemo]

  return (
    <div className="min-h-screen text-slate-900 bg-[#FAF8F5] font-sans">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 left-0 right-0 z-40 bg-white border-b-3 border-black shadow-[0_4px_0_0_#000]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
              <Zap size={18} fill="currentColor" className="text-black" />
            </div>
            <span className="font-display font-black text-xl text-black tracking-tight">
              SOCRATIC<span className="text-amber-500">LAB</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost px-4 py-1.5 text-xs sm:text-sm font-extrabold">Sign In</Link>
            <Link to="/signup" className="btn-primary px-4 py-1.5 text-xs sm:text-sm font-extrabold">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Sticker Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg mb-8 text-xs font-black uppercase tracking-wider bg-amber-400 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <Zap size={14} fill="currentColor" />
            Feynman Technique · AI Reverse Learning Platform
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black leading-none mb-6 tracking-tight text-black">
            The best way to learn
            <br />
            is to <span className="bg-amber-400 text-black px-4 py-1 rounded-xl border-3 border-black shadow-[5px_5px_0px_0px_#000] inline-block mt-2">teach it</span>
          </h1>

          <p className="text-slate-800 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-bold">
            SocraticLab flips traditional tutoring. You become the teacher to an AI student holding realistic misconceptions.
            Teach via voice or text, correct misunderstandings, and earn your mastery score.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup"
              className="btn-primary px-8 py-4 text-base font-black flex items-center justify-center gap-2">
              Start Teaching <ArrowRight size={20} />
            </Link>
            <Link to="/login"
              className="btn-ghost px-8 py-4 text-base font-black flex items-center justify-center gap-2">
              Sign In <ChevronRight size={20} />
            </Link>
          </div>

        </div>

        {/* ── Interactive Demo Visualizer Widget ─────────────────────────────── */}
        <div className="max-w-3xl mx-auto mt-14 relative z-10">
          <div className="bg-white p-6 space-y-4 shadow-[8px_8px_0px_0px_#000] border-3 border-black rounded-2xl">

            {/* Tab switch */}
            <div className="flex items-center justify-between border-b-3 border-black pb-3">
              <div className="flex items-center gap-2">
                {DEMO_SESSIONS.map((demo, idx) => (
                  <button
                    key={demo.subject}
                    onClick={() => setActiveDemo(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                      activeDemo === idx
                        ? 'bg-amber-400 text-black'
                        : 'bg-slate-100 text-slate-700 hover:bg-amber-200'
                    }`}>
                    {demo.avatar} {demo.subject}
                  </button>
                ))}
              </div>
              <div className="text-xs font-black bg-teal-300 text-black border-2 border-black px-3 py-1 rounded-lg shadow-[2px_2px_0px_0px_#000]">
                {currentDemo.understanding}% Mastery
              </div>
            </div>

            {/* Simulated Live Chat */}
            <div className="space-y-4 py-2">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {currentDemo.avatar}
                </div>
                <div className="bg-slate-100 border-2.5 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl p-4 text-xs sm:text-sm max-w-xl text-black font-semibold">
                  <span className="text-xs font-black text-amber-600 block mb-1 uppercase tracking-wider">{currentDemo.studentName}</span>
                  "{currentDemo.misconception}"
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-amber-400 text-black border-2.5 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl p-4 text-xs sm:text-sm max-w-xl font-semibold">
                  <span className="text-xs font-black text-black block mb-1 uppercase tracking-wider">Teacher (You)</span>
                  {currentDemo.userExplanation}
                </div>
              </div>

              {/* SSE Score Feedback */}
              <div className="flex items-center justify-between bg-emerald-400 text-black border-2 border-black rounded-xl px-4 py-3 text-xs font-black shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="stroke-[3]" />
                  <span>Real-Time Evaluator: Concept Corrected! ({currentDemo.scoreDelta})</span>
                </div>
                <span className="text-black text-[11px] font-black uppercase bg-white border border-black px-2 py-0.5 rounded-md">SSE Stream</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Feature Cards ────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t-3 border-black bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-black mb-3 text-black">Why SocraticLab</h2>
            <p className="text-slate-700 text-base max-w-xl mx-auto font-bold">
              Purpose-built features that transform passive studying into active, Feynman-technique mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Mic size={24} className="text-black" />}
              title="100% Free Voice Mode"
              desc="Speak directly to your AI student using Web Speech API mic transcription & text-to-speech audio with zero API cost."
            />
            <FeatureCard
              icon={<FileText size={24} className="text-black" />}
              title="PDF / DOCX Ingestion"
              desc="Upload your lecture notes. The AI extracts authentic student misconceptions automatically in Lecture Mode."
            />
            <FeatureCard
              icon={<Sparkles size={24} className="text-black" />}
              title="Class Level Customization"
              desc="Pre-seeded and AI-generated personas across Class 6-10, High School, and B.Tech undergrad levels."
            />
            <FeatureCard
              icon={<Award size={24} className="text-black" />}
              title="Dedicated Sessions Hub"
              desc="Revisit active sessions to continue teaching, or review read-only completed sessions and mastery scorecards."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#FAF8F5] border-t-3 border-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-black mb-4 text-black">How it works</h2>
            <p className="text-slate-700 text-base max-w-xl mx-auto font-bold">
              Three focused steps to become the teacher — and prove you really understand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="bg-white border-2.5 border-black shadow-[5px_5px_0px_0px_#000] p-6 rounded-2xl relative overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#FACC15] transition-all">
                <div className="absolute -top-4 -right-4 font-display text-7xl font-black opacity-10 text-black select-none">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-black text-lg mb-2 text-black">{item.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two Modes ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t-3 border-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-black mb-3 text-black">Two Ways to Teach</h2>
            <p className="text-slate-700 text-base font-bold">Pick the mode that fits how you learn.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModeCard
              icon="⚡"
              title="Socratic Mode"
              badge="Interactive Q&A"
              desc="Jump straight into the conversation. The AI student opens the session with an authentic doubt, revealing misconceptions as you talk."
              points={['Immediate back-and-forth dialogue', 'AI student speaks first with doubt', 'Best for active recall & quick testing']}
            />
            <ModeCard
              icon="📖"
              title="Lecture Mode"
              badge="Text / PDF Upload"
              desc="Upload a PDF/DOCX or write lecture notes. The AI extracts 3-4 misconceptions, writes a student reflection, and enters Q&A."
              points={['Upload course syllabus or lecture notes', 'AI extracts misconceptions automatically', 'Best for complex textbook chapters']}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#FAF8F5] border-t-3 border-black">
        <div className="max-w-2xl mx-auto text-center bg-amber-400 border-3 border-black shadow-[8px_8px_0px_0px_#000] p-10 rounded-2xl">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="font-display text-4xl font-black mb-3 text-black">Ready to test yourself?</h2>
          <p className="text-black font-extrabold text-base mb-8">If you can teach it clearly, you truly understand it.</p>
          <Link to="/signup" className="btn-ghost bg-black text-amber-400 hover:bg-slate-900 px-8 py-4 text-base font-black inline-flex items-center gap-2">
            Start Teaching Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t-3 border-black bg-white py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 border-2 border-black flex items-center justify-center">
              <Zap size={16} fill="currentColor" className="text-black" />
            </div>
            <span className="font-display font-black text-base text-black">SOCRATICLAB</span>
          </div>
          <p className="text-xs text-slate-700 font-extrabold">
            Built for better understanding · {new Date().getFullYear()}
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="text-xs text-slate-800 hover:text-black font-extrabold transition-colors">Sign In</Link>
            <Link to="/signup" className="text-xs text-slate-800 hover:text-black font-extrabold transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white border-2.5 border-black shadow-[4px_4px_0px_0px_#000] p-6 rounded-2xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2DD4BF] transition-all space-y-3">
      <div className="w-12 h-12 rounded-xl bg-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-black text-lg text-black">{title}</h3>
      <p className="text-xs text-slate-700 leading-relaxed font-bold">{desc}</p>
    </div>
  )
}

function ModeCard({ icon, title, badge, desc, points }) {
  return (
    <div className="bg-white border-2.5 border-black shadow-[5px_5px_0px_0px_#000] p-7 rounded-2xl hover:shadow-[7px_7px_0px_0px_#FACC15] transition-all">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <h3 className="font-black text-xl text-black">{title}</h3>
        </div>
        <span className="text-xs font-black px-3 py-1 rounded-lg bg-teal-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase">
          {badge}
        </span>
      </div>
      <p className="text-sm text-slate-800 mb-4 leading-relaxed font-bold">{desc}</p>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-black font-extrabold">
            <span className="text-amber-500 font-black">✔</span> {p}
          </li>
        ))}
      </ul>
    </div>
  )
}
