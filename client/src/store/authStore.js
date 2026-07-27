import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      signup: async (email, password, name) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/signup', { email, password, name })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          set({ user: data.user, token: data.token, isLoading: false })
          return true
        } catch (err) {
          set({ error: err.response?.data?.error || 'Signup failed', isLoading: false })
          return false
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          set({ user: data.user, token: data.token, isLoading: false })
          return true
        } catch (err) {
          set({ error: err.response?.data?.error || 'Login failed', isLoading: false })
          return false
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ user: null, token: null })
      },

      fetchUser: async () => {
        const { token } = get()
        if (!token) return null
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const { data } = await api.get('/auth/me')
          if (data?.user) {
            set({ user: data.user })
            return data.user
          }
        } catch (err) {
          console.warn('[authStore] Failed to fetch current user profile:', err.message)
        }
        return null
      },

      clearError: () => set({ error: null }),

      // Restore token on app load
      init: async () => {
        const { token, fetchUser } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          await fetchUser()
        }
      },
    }),
    {
      name: 'socraticlab-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export default useAuthStore
