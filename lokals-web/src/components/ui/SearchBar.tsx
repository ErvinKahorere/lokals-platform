import { Clock3, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Input } from './Input'

type Shortcut = {
  label: string
  value: string
}

type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement> & {
  recentKey?: string
  suggestions?: string[]
  shortcuts?: Shortcut[]
  onValueSelect?: (value: string) => void
}

export function SearchBar({ recentKey, suggestions = [], shortcuts = [], onValueSelect, ...props }: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    if (!recentKey) {
      return
    }

    try {
      const stored = window.localStorage.getItem(`lokals-search-${recentKey}`)
      setRecent(stored ? JSON.parse(stored) as string[] : [])
    } catch {
      setRecent([])
    }
  }, [recentKey])

  const visibleSuggestions = useMemo(() => {
    const query = String(props.value ?? '').trim().toLowerCase()
    return suggestions.filter((item) => item.toLowerCase().includes(query)).slice(0, 4)
  }, [props.value, suggestions])

  const persistRecent = (value: string) => {
    if (!recentKey || !value.trim()) {
      return
    }

    const next = [value.trim(), ...recent.filter((item) => item !== value.trim())].slice(0, 4)
    setRecent(next)
    window.localStorage.setItem(`lokals-search-${recentKey}`, JSON.stringify(next))
  }

  const selectValue = (value: string) => {
    onValueSelect?.(value)
    persistRecent(value)
  }

  return (
    <div className="relative">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lokals-muted" />
        <Input
          {...props}
          className={`pl-11 shadow-card ${props.className ?? ''}`}
          onFocus={(event) => {
            setFocused(true)
            props.onFocus?.(event)
          }}
          onBlur={(event) => {
            window.setTimeout(() => setFocused(false), 120)
            persistRecent(String(event.currentTarget.value ?? ''))
            props.onBlur?.(event)
          }}
        />
      </label>
      {(focused || recent.length > 0) && (shortcuts.length > 0 || recent.length > 0 || visibleSuggestions.length > 0) ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.65rem)] z-20 rounded-[24px] border border-white/70 bg-white/98 p-3 shadow-soft-lg">
          {visibleSuggestions.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {visibleSuggestions.map((item) => (
                <button key={item} type="button" onMouseDown={() => selectValue(item)} className="rounded-full bg-lokals-purple-soft px-3 py-2 text-xs font-semibold text-lokals-purple">
                  {item}
                </button>
              ))}
            </div>
          ) : null}
          {recent.length > 0 ? (
            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Recent searches</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((item) => (
                  <button key={item} type="button" onMouseDown={() => selectValue(item)} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-lokals-charcoal">
                    <Clock3 className="h-3.5 w-3.5" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {shortcuts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {shortcuts.map((shortcut) => (
                <button key={shortcut.value} type="button" onMouseDown={() => selectValue(shortcut.value)} className="rounded-full border border-lokals-border bg-lokals-surface px-3 py-2 text-xs font-semibold text-lokals-charcoal hover:border-lokals-purple/20 hover:bg-lokals-purple-soft/50">
                  {shortcut.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
