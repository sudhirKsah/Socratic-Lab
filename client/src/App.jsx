import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Landing from './pages/Landing'
import Login, { Signup } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Setup from './pages/Setup'
import Chat from './pages/Chat'
import LecturePhase1 from './pages/LecturePhase1'
import Complete from './pages/Complete'
import Settings from './pages/Settings'
import Sessions from './pages/Sessions'
import ProtectedRoute from './components/layout/ProtectedRoute'
import useAuthStore from './store/authStore'

export default function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
        <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
        <Route path="/session/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/session/:id/lecture" element={<ProtectedRoute><LecturePhase1 /></ProtectedRoute>} />
        <Route path="/session/:id/complete" element={<ProtectedRoute><Complete /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
