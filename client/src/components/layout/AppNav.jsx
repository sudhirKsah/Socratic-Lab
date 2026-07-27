import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, LayoutDashboard, Settings, LogOut, Zap } from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function AppNav() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #14B8A6)' }}>
            <Zap size={14} fill="currentColor" className="text-slate-900" />
          </div>
          <span className="font-display font-bold text-base tracking-tight">SocraticLab</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard" active={pathname === '/dashboard'} />
          <NavItem to="/settings" icon={<Settings size={15} />} label="Settings" active={pathname === '/settings'} />
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 hidden sm:block">{user?.name || user?.email}</span>
          <button
            onClick={handleLogout}
            className="btn-ghost px-3 py-1.5 text-sm flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

function NavItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-amber-500/10 text-amber-400'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </Link>
  )
}
