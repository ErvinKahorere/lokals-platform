import { ChevronDown, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwitchRole } from '../../hooks/queries'
import { getRoleHomePath } from '../../lib/roles'
import type { User } from '../../types'

const formatRole = (role: string) =>
  role.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export function RoleSwitcher({
  roles = [],
  currentRole,
}: {
  roles?: string[]
  currentRole?: string | null
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const switchRole = useSwitchRole()
  const navigate = useNavigate()
  const visible = roles.filter(Boolean)
  const active = currentRole && visible.includes(currentRole) ? currentRole : visible[0] ?? 'citizen'
  const extraCount = Math.max(visible.length - 1, 0)

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutside)
    return () => window.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-lokals-border bg-white px-3 py-2 text-sm font-semibold text-lokals-charcoal shadow-card"
      >
        <span className="rounded-full bg-lokals-green px-2.5 py-1 text-xs font-semibold text-white">{formatRole(active)}</span>
        {extraCount > 0 ? <span className="text-xs text-lokals-muted">+{extraCount}</span> : null}
        {switchRole.isPending ? <LoaderCircle className="h-4 w-4 animate-spin text-lokals-muted" /> : <ChevronDown className="h-4 w-4 text-lokals-muted" />}
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 min-w-56 rounded-[20px] border border-lokals-border bg-white p-2 shadow-soft-lg">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Switch role</p>
          <div className="space-y-1">
            {visible.map((role) => {
              const isActive = role === active
              return (
                <button
                  key={role}
                  type="button"
                  disabled={isActive || switchRole.isPending}
                  onClick={async () => {
                    const payload = await switchRole.mutateAsync(role)
                    setOpen(false)
                    navigate(getRoleHomePath((payload.user?.data ?? payload.user) as User))
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                    isActive ? 'bg-lokals-green text-white' : 'text-lokals-charcoal hover:bg-slate-100'
                  }`}
                >
                  <span>{formatRole(role)}</span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-lokals-muted'}`}>{isActive ? 'Active' : 'Switch'}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
