import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setAuthToken } from '../lib/api'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  setSession: (token: string, user: User) => void
  setUser: (user: User) => void
  clearSession: () => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        setAuthToken(token)
        set({ token, user })
      },
      setUser: (user) => {
        set({ user })
      },
      clearSession: () => {
        setAuthToken(null)
        set({ token: null, user: null })
      },
      logout: async () => {
        try {
          if (get().token) {
            await api.post('/auth/logout')
          }
        } finally {
          get().clearSession()
        }
      },
    }),
    {
      name: 'lokals-auth',
      onRehydrateStorage: () => (state) => {
        setAuthToken(state?.token)
      },
    },
  ),
)
