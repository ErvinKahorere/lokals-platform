import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from 'react'

type ThemeMode = 'light'
type ResolvedTheme = 'light'

type ThemeContextValue = {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.dataset.theme = 'light'
    window.localStorage.setItem('lokals-theme', 'light')
  }, [])

  const value = useMemo(() => ({
    theme: 'light' as ThemeMode,
    resolvedTheme: 'light' as ResolvedTheme,
    setTheme: (_nextTheme: ThemeMode) => undefined,
  }), [])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
