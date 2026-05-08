export const appMode = (import.meta.env.VITE_APP_MODE ?? 'production') as 'demo' | 'production'

export const isDemoMode = appMode === 'demo'
