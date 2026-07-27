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
      <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
          <span className="flex items-center gap-1.5"><Sparkles size={13} /> Judge Quick Login</span>
          <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300">Pre-seeded</span>
        </div>
        <p className="text-[11px] text-slate-300">Access pre-filled sessions, past notes, and completed scorecards instantly.</p>
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="btn-amber py-2 text-xs font-semibold flex items-center justify-center gap-1.5 w-full cursor-pointer">
          <span>⚡ One-Click Sign In (`test@gmail.com`)</span>
        </button>
      </div>

      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-3 text-slate-500 text-[11px] uppercase font-mono tracking-wider">or sign in manually</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
          <input
            type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field w-full px-3.5 py-2.5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field w-full px-3.5 py-2.5 pr-10"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mt-2">
          {isLoading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={14} /></>}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        No account?{' '}
        <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-medium">Create one →</Link>
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
      <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
          <span className="flex items-center gap-1.5"><Sparkles size={13} /> Judge Quick Access</span>
          <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300">Pre-seeded</span>
        </div>
        <p className="text-[11px] text-slate-300">Skip registration and jump into pre-seeded sessions immediately.</p>
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="btn-amber py-2 text-xs font-semibold flex items-center justify-center gap-1.5 w-full cursor-pointer">
          <span>⚡ One-Click Sign In (`test@gmail.com`)</span>
        </button>
      </div>

      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-3 text-slate-500 text-[11px] uppercase font-mono tracking-wider">or register new account</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Your Name</label>
          <input
            type="text" required
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            className="input-field w-full px-3.5 py-2.5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
          <input
            type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field w-full px-3.5 py-2.5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="input-field w-full px-3.5 py-2.5 pr-10"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mt-2">
          {isLoading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={14} /></>}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign in →</Link>
      </p>
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-glow" style={{
          top: '20%', left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)'
        }} />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #14B8A6)' }}>
            <Zap size={16} fill="currentColor" className="text-slate-900" />
          </div>
          <span className="font-display font-bold text-lg">SocraticLab</span>
        </Link>

        <div className="card p-7">
          <div className="mb-6">
            <h1 className="font-display font-bold text-xl mb-1">{title}</h1>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
