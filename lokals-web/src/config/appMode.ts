export const appMode = (import.meta.env.VITE_APP_MODE ?? 'demo') as 'demo' | 'production'

export const isDemoMode = appMode === 'demo'
