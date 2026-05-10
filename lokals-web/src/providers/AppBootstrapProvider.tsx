import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { LoadingScreen } from '../components/ui/LoadingSkeleton'
import { isDemoMode } from '../config/appMode'
import { api } from '../lib/api'
import type { MePayload } from '../types'
import { useAuthStore } from '../store/auth'

const getUserFromPayload = (payload: MePayload) => ('data' in payload.user ? payload.user.data : payload.user)

export function AppBootstrapProvider({ children }: PropsWithChildren) {
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [startupError, setStartupError] = useState<string | null>(null)
  const setUser = useAuthStore((state) => state.setUser)
  const clearSession = useAuthStore((state) => state.clearSession)

  const bootstrap = useCallback(async () => {
    setIsBootstrapping(true)
    setStartupError(null)

    if (!useAuthStore.persist.hasHydrated()) {
      await new Promise<void>((resolve) => {
        const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
          unsubscribe()
          resolve()
        })
      })
    }

    const { token } = useAuthStore.getState()
    if (!token) {
      setIsBootstrapping(false)
      return
    }

    try {
      const { data } = await api.get<MePayload>('/me')
      setUser(getUserFromPayload(data))
      setIsBootstrapping(false)
    } catch (error) {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
        clearSession()
        setIsBootstrapping(false)
        return
      }

      setStartupError('Check your connection and try again.')
      setIsBootstrapping(false)
    }
  }, [clearSession, setUser])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  if (startupError) {
    return (
      <LoadingScreen
        title="Couldn't load LOKALS"
        message={startupError}
        showError
        onRetry={() => void bootstrap()}
        onContinueOffline={isDemoMode ? clearSession : undefined}
      />
    )
  }

  if (isBootstrapping) {
    return <LoadingScreen title="Loading LOKALS" message="Everything in your city is getting ready..." />
  }

  return <>{children}</>
}
