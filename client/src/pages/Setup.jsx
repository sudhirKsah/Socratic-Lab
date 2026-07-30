import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Zap, BookOpen, Sparkles, UserPlus, GraduationCap } from 'lucide-react'
import AppNav from '../components/layout/AppNav'
import useSessionStore from '../store/sessionStore'
import api from '../services/api'

const SUBJECTS = [
  { name: 'Math', icon: '🧮', desc: 'Algebra, calculus, geometry, statistics', color: '#FACC15' },
  { name: 'Physics', icon: '⚡', desc: 'Mechanics, electricity, waves, relativity', color: '#14B8A6' },
  { name: 'Chemistry', icon: '🧪', desc: 'Atoms, bonding, reactions, thermodynamics', color: '#10B981' },
  { name: 'Programming', icon: '💻', desc: 'Logic, data structures, algorithms, syntax', color: '#A855F7' },
  { name: 'Writing', icon: '✍️', desc: 'Grammar, structure, style, argumentation', color: '#F43F5E' },
]

const GRADE_LEVELS = [
  'Grade 6-8 (Middle School)',
  'Grade 9-10 (High School)',
  'Grade 11-12 (Senior High)',
  'B.Tech / Undergrad',
  'Postgraduate / Advanced',
]

const STEPS = ['Subject', 'Mode', 'Student Persona', 'Topic & Start']

export default function Setup() {
  const [step, setStep] = useState(0)
  const {
    selectedSubject, selectedMode, selectedPersona, topic,
    personas, setSelectedSubject, setSelectedMode, setSelectedPersona, setTopic,
    fetchPersonas, createSession,
  } = useSessionStore()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Custom student attributes
  const [customName, setCustomName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('Grade 9-10 (High School)')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [intensity, setIntensity] = useState(3)
  const [isCustomizing, setIsCustomizing] = useState(false)

  useEffect(() => {
    if (selectedSubject) fetchPersonas(selectedSubject)
    if (!selectedMode) setSelectedMode('lecture')
  }, [selectedSubject])

  const handleGenerateStudent = async () => {
    setGenerating(true)
    try {
      const res = await api.post('/personas/generate', {
        subject: selectedSubject,
        gradeLevel,
        difficulty,
        personalityIntensity: intensity,
      })
      if (res.data.persona) {
        setSelectedPersona(res.data.persona)
        fetchPersonas(selectedSubject)
        setIsCustomizing(false)
      }
    } catch (err) {
      console.error('Error generating student:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleCreateCustomStudent = async () => {
    if (!customName.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/personas', {
        subject: selectedSubject,
        name: customName.trim(),
        avatar: '🎓',
        gradeLevel,
        difficulty,
        personalityIntensity: intensity,
        backstory: `${customName.trim()} is a ${gradeLevel} student eager to learn ${selectedSubject}.`,
      })
      if (res.data.persona) {
        setSelectedPersona(res.data.persona)
        fetchPersonas(selectedSubject)
        setIsCustomizing(false)
      }
    } catch (err) {
      console.error('Error creating custom student:', err)
    } finally {
      setCreating(false)
    }
  }

  const canNext = () => {
    if (step === 0) return !!selectedSubject
    if (step === 1) return !!selectedMode
    if (step === 2) return !!selectedPersona
    return true
  }

  const handleStart = async () => {
    setCreating(true)
    const session = await createSession()
    setCreating(false)
    if (session) {
      if (selectedMode === 'lecture') {
        navigate(`/session/${session._id}/lecture`)
      } else {
        navigate(`/session/${session._id}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AppNav />
      <main className="max-w-3xl mx-auto pt-24 pb-16 px-4 sm:px-6">

        {/* ── Progress indicator ────────────────────────────────────────── */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all
                    ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                    {i < step ? <Check size={14} className="stroke-[3]" /> : i + 1}
                  </div>
                  <span className={`text-xs font-bold uppercase hidden sm:block ${i === step ? 'text-slate-900 font-extrabold' : 'text-slate-500'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2.5 transition-all ${i < step ? 'bg-amber-400' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step content ─────────────────────────────────────────────── */}
        <div className="animate-fade-up">

          {/* Step 0: Subject */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-1.5 text-slate-900">What subject are you teaching?</h2>
              <p className="text-slate-600 text-sm font-medium mb-6">Choose the domain for this teaching session.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SUBJECTS.map((s) => (
                  <button key={s.name}
                    onClick={() => setSelectedSubject(s.name)}
                    className={`text-left p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer
                      ${selectedSubject === s.name
                        ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'}`}>
                    <div className="text-2xl w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0">
                      {s.icon}
                    </div>
                    <div>
                      <div className="font-bold text-base text-slate-900">{s.name}</div>
                      <div className="text-xs mt-0.5 text-slate-500 font-medium">{s.desc}</div>
                    </div>
                    {selectedSubject === s.name && (
                      <Check size={20} className="ml-auto text-amber-600 flex-shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Mode */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-1.5 text-slate-900">Choose your teaching workflow</h2>
              <p className="text-slate-600 text-sm font-medium mb-6">In Lecture Mode, your AI student forms misconceptions directly from what you teach.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModeCard
                  icon={<BookOpen size={22} className="text-teal-700" />}
                  title="Lecture Mode (Recommended)"
                  badge="Primary Workflow"
                  badgeColor="bg-teal-100 text-teal-800 border-teal-200"
                  desc="Teach first by typing or uploading notes/PDF. The AI student reads your teaching and dynamically extracts misconceptions to challenge you."
                  features={['Dynamic AI misconception extraction', 'Upload PDFs, notes or write text', 'Student reflects on your exact lecture']}
                  selected={selectedMode === 'lecture'}
                  onClick={() => setSelectedMode('lecture')}
                />
                <ModeCard
                  icon={<Zap size={22} className="text-amber-700" />}
                  title="Socratic Mode"
                  badge="Interactive"
                  badgeColor="bg-amber-100 text-amber-800 border-amber-200"
                  desc="Jump straight into back-and-forth chat without pre-teaching. The AI student pushes back from turn 1."
                  features={['Immediate live dialogue', 'AI pushes back on assumptions', 'Great for quick review']}
                  selected={selectedMode === 'socratic'}
                  onClick={() => setSelectedMode('socratic')}
                />
              </div>
            </div>
          )}

          {/* Step 2: Persona Selection & Customization */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">Select or customize student</h2>
                <button
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className="text-xs font-bold bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl shadow-xs hover:bg-amber-300 cursor-pointer">
                  {isCustomizing ? 'Choose Preset' : '✨ Custom Generator'}
                </button>
              </div>
              <p className="text-slate-600 text-sm font-medium mb-6">
                Choose a pre-generated student or build a custom student by selecting their grade level, difficulty, and stubbornness.
              </p>

              {isCustomizing ? (
                <div className="card p-6 space-y-5 animate-fade-in">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" /> Dynamic Student Generator
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Student Name (Optional)</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Aarav, Rohan, Priya"
                        className="input-field w-full px-3.5 py-2.5 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Class / Education Level</label>
                      <select
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        className="input-field w-full px-3 py-2.5 text-sm font-medium bg-white">
                        {GRADE_LEVELS.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Difficulty Level</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="input-field w-full px-3 py-2.5 text-sm font-medium bg-white">
                        <option value="beginner">Beginner (Basic confusion)</option>
                        <option value="intermediate">Intermediate (Standard doubts)</option>
                        <option value="advanced">Advanced (Subtle edge cases)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Stubbornness (1-5)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={intensity}
                        onChange={(e) => setIntensity(Number(e.target.value))}
                        className="w-full accent-amber-500 mt-2"
                      />
                      <div className="text-xs text-amber-700 font-bold text-right mt-1">Level {intensity}/5</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleGenerateStudent}
                      disabled={generating}
                      className="btn-primary flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                      <Sparkles size={16} /> {generating ? 'Generating with AI...' : 'Generate with AI'}
                    </button>
                    {customName.trim() && (
                      <button
                        onClick={handleCreateCustomStudent}
                        disabled={creating}
                        className="btn-teal flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                        <UserPlus size={16} /> Create Persona
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {personas.filter(p => p.subject === selectedSubject).map((p) => (
                    <PersonaCard
                      key={p._id}
                      persona={p}
                      selected={selectedPersona?._id === p._id}
                      onClick={() => setSelectedPersona(p)}
                    />
                  ))}
                  {personas.filter(p => p.subject === selectedSubject).length === 0 && (
                    <div className="col-span-2 card p-8 text-center text-slate-500 font-bold text-sm">
                      Loading pre-seeded students...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Topic */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-1.5 text-slate-900">
                What's the main topic? <span className="text-slate-400 font-normal text-lg">(optional)</span>
              </h2>
              <p className="text-slate-600 text-sm font-medium mb-6">
                Specify a topic title for your session, or leave blank.
              </p>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder={`e.g. ${selectedSubject === 'Math' ? 'Quadratic equations' : selectedSubject === 'Physics' ? "Newton's Laws" : selectedSubject === 'Chemistry' ? 'Covalent bonding' : selectedSubject === 'Programming' ? 'Recursion' : 'Thesis statements'}`}
                className="input-field w-full px-4 py-3.5 text-base font-medium mb-4"
                autoFocus
              />

              {/* Summary card */}
              <div className="card p-6 space-y-3.5 mt-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Overview</h3>
                <SummaryRow label="Subject" value={selectedSubject} />
                <SummaryRow label="Workflow Mode" value={selectedMode === 'lecture' ? '📖 Lecture Mode (Dynamic AI Misconceptions)' : '⚡ Socratic Mode'} />
                <SummaryRow label="Student Persona" value={`${selectedPersona?.avatar} ${selectedPersona?.name} (${selectedPersona?.gradeLevel || 'Grade 10'})`} />
                <SummaryRow label="Difficulty" value={selectedPersona?.difficulty || 'intermediate'} />
                <SummaryRow label="Stubbornness" value={'★'.repeat(selectedPersona?.personalityIntensity || 3) + '☆'.repeat(5 - (selectedPersona?.personalityIntensity || 3))} />
                {topic && <SummaryRow label="Topic" value={topic} />}
              </div>
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────────────── */}
          <div className="flex justify-between items-center mt-10">
            <button
              onClick={() => step > 0 ? setStep(step - 1) : null}
              disabled={step === 0}
              className="btn-ghost px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-30">
              <ChevronLeft size={16} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="btn-primary px-7 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={creating}
                className="btn-primary px-7 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                {creating ? 'Starting...' : selectedMode === 'lecture' ? '📖 Set Up Lecture & Teach →' : '⚡ Start Session →'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function PersonaCard({ persona, selected, onClick }) {
  const stubbornBars = persona.personalityIntensity || 3
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
        selected
          ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/30'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl flex-shrink-0 font-bold">
          {persona.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-base text-slate-900">{persona.name}</span>
            {selected && <Check size={18} className="text-amber-600 stroke-[2.5] flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 border border-teal-200 uppercase inline-flex items-center gap-1">
              <GraduationCap size={12} /> {persona.gradeLevel || 'Grade 10'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
              {persona.difficulty}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3 line-clamp-2">{persona.backstory}</p>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Stubborn</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i < stubbornBars ? 'bg-amber-400' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>
        <span className="text-[11px] text-teal-700 font-bold uppercase">AI Misconceptions</span>
      </div>
    </button>
  )
}

function ModeCard({ icon, title, badge, badgeColor, desc, features, selected, onClick }) {
  return (
    <button onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition-all cursor-pointer w-full
        ${selected
          ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/30'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div>
            <div className="font-bold text-base text-slate-900">{title}</div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {badge}
            </span>
          </div>
        </div>
        {selected && <Check size={20} className="text-amber-600 stroke-[2.5] flex-shrink-0" />}
      </div>
      <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">{desc}</p>
      <ul className="space-y-1.5">
        {features.map((f, i) => (
          <li key={i} className="text-xs text-slate-800 font-medium flex items-center gap-1.5">
            <span className="text-amber-500 font-bold">✓</span> {f}
          </li>
        ))}
      </ul>
    </button>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
      <span className="text-slate-500 uppercase font-bold">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  )
}
