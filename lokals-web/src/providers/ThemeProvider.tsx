import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return theme
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeMode>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  useEffect(() => {
    const stored = window.localStorage.getItem('lokals-theme') as ThemeMode | null
    const nextTheme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
    setThemeState(nextTheme)
    setResolvedTheme(resolveTheme(nextTheme))
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setResolvedTheme(resolveTheme(theme))
    }
    media.addEventListener('change', handleChange)

    return () => media.removeEventListener('change', handleChange)
  }, [theme])

  useEffect(() => {
    const nextResolved = resolveTheme(theme)
    setResolvedTheme(nextResolved)
    document.documentElement.classList.toggle('dark', nextResolved === 'dark')
    document.documentElement.dataset.theme = nextResolved
    window.localStorage.setItem('lokals-theme', theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme: (nextTheme: ThemeMode) => setThemeState(nextTheme),
  }), [resolvedTheme, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
