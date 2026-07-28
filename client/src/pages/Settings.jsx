import { User, Bell, Shield } from 'lucide-react'
import AppNav from '../components/layout/AppNav'
import useAuthStore from '../store/authStore'

export default function Settings() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="max-w-2xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-2xl font-bold mb-1">Settings</h1>
          <p className="text-slate-400 text-sm">View your account profile and preferences</p>
        </div>

        {/* Profile */}
        <section className="card p-6 mb-4 animate-fade-up">
          <div className="flex items-center gap-3 mb-5">
            <User size={16} className="text-amber-400" />
            <h2 className="font-semibold text-sm">Profile Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Name</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                disabled
                className="input-field w-full px-3.5 py-2.5 text-sm opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="input-field w-full px-3.5 py-2.5 text-sm opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
              <div className="px-3.5 py-2.5 rounded-lg text-sm capitalize"
                style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                {user?.role || 'student'}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="card p-6 mb-4 animate-fade-up">
          <div className="flex items-center gap-3 mb-5">
            <Shield size={16} className="text-teal-400" />
            <h2 className="font-semibold text-sm">Your Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatRow label="Total Sessions" value={user?.totalSessions || 0} />
            <StatRow label="Mastery Points" value={user?.totalMasteryPoints || 0} />
          </div>
        </section>

        {/* AI Models notice */}
        <section className="card p-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={16} className="text-slate-400" />
            <h2 className="font-semibold text-sm">AI Models</h2>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <p>SocraticLab uses the following AI models:</p>
            <ul className="space-y-1 ml-3">
              <li>⚡ <strong className="text-slate-300">DeepSeek R1</strong> — Math, Physics, Chemistry</li>
              <li>💻 <strong className="text-slate-300">Qwen3 QwQ-32B</strong> — Programming (via Groq)</li>
              <li>✍️ <strong className="text-slate-300">Llama 3.3 70B</strong> — Writing (via Groq)</li>
              <li>🔍 <strong className="text-slate-300">Llama 3.1 8B</strong> — Evaluator (via Groq)</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-xl font-bold font-display text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
