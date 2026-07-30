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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-amber-400 border border-amber-500 shadow-xs flex items-center justify-center group-hover:scale-105 transition-all">
            <Zap size={18} fill="currentColor" className="text-slate-950" />
          </div>
          <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
            SOCRATIC<span className="text-amber-500">LAB</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard" active={pathname === '/dashboard'} />
          <NavItem to="/sessions" icon={<BookOpen size={15} />} label="Sessions & Notes" active={pathname === '/sessions'} />
          <NavItem to="/settings" icon={<Settings size={15} />} label="Settings" active={pathname === '/settings'} />
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full hidden md:block">
            {user?.name || user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="btn-ghost px-3 py-1.5 text-xs sm:text-sm font-bold flex items-center gap-1.5"
          >
            <LogOut size={15} />
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
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
        active
          ? 'bg-amber-400 text-slate-950 shadow-xs font-extrabold'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </Link>
  )
}
