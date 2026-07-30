import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const ok = await login(email, password)
    if (ok) navigate('/dashboard')
  }

  const handleQuickDemoLogin = async () => {
    setEmail('test@gmail.com')
    setPassword('password123')
    clearError()
    const ok = await login('test@gmail.com', 'password123')
    if (ok) navigate('/dashboard')
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your SocraticLab account">

      {/* Quick Judge Login Pill */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 text-slate-900 border border-amber-200 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase">
          <span className="flex items-center gap-1.5 text-amber-900"><Sparkles size={15} className="text-amber-500" /> Judge Quick Login</span>
          <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-extrabold">Pre-seeded</span>
        </div>
        <p className="text-xs font-medium text-slate-600 leading-snug">Access pre-filled sessions, past notes, and completed scorecards instantly.</p>
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="bg-slate-900 text-amber-400 font-bold hover:bg-slate-800 py-2.5 px-3 text-xs rounded-xl flex items-center justify-center gap-2 w-full cursor-pointer transition-all shadow-xs">
          <span>⚡ One-Click Sign In (`test@gmail.com`)</span>
        </button>
      </div>

      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase font-bold tracking-wider">or sign in manually</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Email</label>
          <input
            type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field w-full px-3.5 py-2.5 font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field w-full px-3.5 py-2.5 pr-10 font-medium"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-rose-800 font-bold bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-2">
          {isLoading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="text-center text-xs font-medium text-slate-500 mt-6">
        No account?{' '}
        <Link to="/signup" className="text-amber-600 hover:underline font-bold">Create one →</Link>
      </p>
    </AuthShell>
  )
}

export function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { signup, login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const ok = await signup(email, password, name)
    if (ok) navigate('/dashboard')
  }

  const handleQuickDemoLogin = async () => {
    clearError()
    const ok = await login('test@gmail.com', 'password123')
    if (ok) navigate('/dashboard')
  }

  return (
    <AuthShell title="Start teaching" subtitle="Create your SocraticLab account — it's free">

      {/* Quick Judge Login Pill */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 text-slate-900 border border-amber-200 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase">
          <span className="flex items-center gap-1.5 text-amber-900"><Sparkles size={15} className="text-amber-500" /> Judge Quick Access</span>
          <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-extrabold">Pre-seeded</span>
        </div>
        <p className="text-xs font-medium text-slate-600 leading-snug">Skip registration and jump into pre-seeded sessions immediately.</p>
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="bg-slate-900 text-amber-400 font-bold hover:bg-slate-800 py-2.5 px-3 text-xs rounded-xl flex items-center justify-center gap-2 w-full cursor-pointer transition-all shadow-xs">
          <span>⚡ One-Click Sign In (`test@gmail.com`)</span>
        </button>
      </div>

      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase font-bold tracking-wider">or register new account</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Your Name</label>
          <input
            type="text" required
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            className="input-field w-full px-3.5 py-2.5 font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Email</label>
          <input
            type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field w-full px-3.5 py-2.5 font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="input-field w-full px-3.5 py-2.5 pr-10 font-medium"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-rose-800 font-bold bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-2">
          {isLoading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="text-center text-xs font-medium text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-amber-600 hover:underline font-bold">Sign in →</Link>
      </p>
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative font-sans">
      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-amber-400 border border-amber-500 shadow-xs flex items-center justify-center">
            <Zap size={20} fill="currentColor" className="text-slate-950" />
          </div>
          <span className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            SOCRATIC<span className="text-amber-500">LAB</span>
          </span>
        </Link>

        <div className="card p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="font-display font-extrabold text-3xl mb-1 text-slate-900">{title}</h1>
            <p className="text-sm font-medium text-slate-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
