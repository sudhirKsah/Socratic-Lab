import { User, Bell, Shield } from 'lucide-react'
import AppNav from '../components/layout/AppNav'
import useAuthStore from '../store/authStore'

export default function Settings() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AppNav />
      <main className="max-w-2xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">Settings</h1>
          <p className="text-slate-600 text-sm font-medium">View your account profile and preferences</p>
        </div>

        {/* Profile */}
        <section className="card p-6 mb-5 animate-fade-up">
          <div className="flex items-center gap-3 mb-5">
            <User size={18} className="text-amber-500" />
            <h2 className="font-bold text-base text-slate-900 uppercase tracking-wider">Profile Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Display Name</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                disabled
                className="input-field w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 text-slate-700 cursor-not-allowed opacity-80"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="input-field w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 text-slate-700 cursor-not-allowed opacity-80"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Role</label>
              <div className="px-3.5 py-2 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200 inline-block">
                {user?.role || 'student'}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="card p-6 mb-5 animate-fade-up">
          <div className="flex items-center gap-3 mb-5">
            <Shield size={18} className="text-teal-600" />
            <h2 className="font-bold text-base text-slate-900 uppercase tracking-wider">Your Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatRow label="Total Sessions" value={user?.totalSessions || 0} color="text-amber-600" />
            <StatRow label="Mastery Points" value={user?.totalMasteryPoints || 0} color="text-teal-600" />
          </div>
        </section>

        {/* AI Models notice */}
        <section className="card p-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={18} className="text-purple-600" />
            <h2 className="font-bold text-base text-slate-900 uppercase tracking-wider">AI Models Strategy</h2>
          </div>
          <div className="space-y-2.5 text-xs font-medium text-slate-600">
            <p className="text-amber-700 font-bold uppercase">SocraticLab utilizes specialized multi-model routing:</p>
            <ul className="space-y-1.5 ml-1">
              <li className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">⚡ <strong className="text-slate-900">DeepSeek R1</strong> — Math, Physics, Chemistry Reasoning</li>
              <li className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">💻 <strong className="text-slate-900">Qwen3 QwQ-32B</strong> — Programming Logic (via Groq)</li>
              <li className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">✍️ <strong className="text-slate-900">Llama 3.3 70B</strong> — Writing & Argumentation (via Groq)</li>
              <li className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">🔍 <strong className="text-slate-900">Llama 3.1 8B</strong> — Real-time Misconception Evaluator</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

function StatRow({ label, value, color }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className={`text-2xl font-black font-display ${color}`}>{value}</div>
      <div className="text-xs font-bold text-slate-500 uppercase mt-0.5">{label}</div>
    </div>
  )
}
