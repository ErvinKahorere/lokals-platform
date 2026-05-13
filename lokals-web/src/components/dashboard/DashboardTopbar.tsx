import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { NotificationBell } from '../experience/NotificationBell'
import { type DashboardMode, getDashboardConfig, getNavItemMeta } from '../../lib/dashboardConfig'
import type { DashboardRealtimeStatus } from '../../lib/realtimeTypes'

function formatUpdatedAt(updatedAt?: number | null) {
  if (!updatedAt) return 'Waiting for updates'
  return 'Updated now'
}

export function DashboardTopbar({
  mode,
  onOpenSidebar,
  unreadCount = 0,
  realtimeStatus = 'offline',
  updatedAt,
}: {
  mode: DashboardMode
  onOpenSidebar: () => void
  unreadCount?: number
  realtimeStatus?: DashboardRealtimeStatus
  updatedAt?: number | null
}) {
  const config = getDashboardConfig(mode)
  const location = useLocation()
  const currentNav = getNavItemMeta(mode, location.pathname)

  return (
    <div className="flex min-h-[76px] items-center justify-between gap-4 rounded-[26px] border border-white/70 bg-white/92 px-4 py-3 shadow-card backdrop-blur md:px-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-lokals-border bg-white text-lokals-charcoal lg:hidden"
          aria-label="Open dashboard menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">{config.shortLabel}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-lokals-charcoal">{config.title}</span>
            {currentNav && currentNav.to !== config.homeRoute ? (
              <>
                <span className="text-lokals-muted">/</span>
                <span className="font-medium text-lokals-muted">{currentNav.label}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-lokals-border bg-white px-3 py-2 md:flex md:items-center md:gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${realtimeStatus === 'live' ? 'bg-emerald-500 shadow-[0_0_0_6px_rgba(34,197,94,0.12)]' : realtimeStatus === 'polling' ? 'bg-amber-400' : 'bg-slate-300'}`} />
          <span className="text-xs font-semibold text-lokals-charcoal">{realtimeStatus === 'live' ? 'Live' : realtimeStatus === 'polling' ? 'Fallback sync' : 'Offline'}</span>
          <span className="text-xs text-lokals-muted">{formatUpdatedAt(updatedAt)}</span>
        </div>
        <NotificationBell count={unreadCount} to="/notifications" />
      </div>
    </div>
  )
}
