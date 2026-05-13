import { ChevronLeft, ChevronRight, LogOut, Menu, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { RoleSwitcher } from '../ui/RoleSwitcher'
import { formatRoleLabel } from '../../lib/roles'
import { type DashboardMode, getDashboardConfig } from '../../lib/dashboardConfig'
import { useAuthStore } from '../../store/auth'

export function DashboardSidebar({
  mode,
  collapsed,
  onToggleCollapse,
  onCloseMobile,
}: {
  mode: DashboardMode
  collapsed: boolean
  onToggleCollapse: () => void
  onCloseMobile?: () => void
}) {
  const config = getDashboardConfig(mode)
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const location = useLocation()

  const footerLabel = useMemo(() => formatRoleLabel(user?.current_role ?? user?.roles?.[0] ?? 'citizen'), [user])

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-lokals-border/80 px-4 py-4">
        <div className={`min-w-0 ${collapsed ? 'hidden lg:block' : ''}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lokals-green">LOKALS</p>
          <p className="mt-1 truncate text-sm font-semibold text-lokals-charcoal">{config.label}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-lokals-border bg-white text-lokals-charcoal lg:hidden"
            aria-label="Close sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-lokals-border bg-white text-lokals-charcoal lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="border-b border-lokals-border/80 px-4 py-4">
        <RoleSwitcher roles={user?.roles ?? []} currentRole={user?.current_role} />
        {!collapsed ? (
          <p className="mt-3 text-xs leading-5 text-lokals-muted">
            Switch between approved modes, watch pending applications, and open role applications when a new mode is still locked.
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {config.nav.map((group) => (
            <div key={group.label}>
              {!collapsed ? (
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-lokals-muted">{group.label}</p>
              ) : null}
              <div className="mt-2 space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      className={`group flex items-center gap-3 rounded-[20px] px-3 py-3 transition ${
                        isActive
                          ? 'bg-lokals-purple text-white shadow-card'
                          : 'text-lokals-charcoal hover:bg-lokals-purple-soft/60'
                      }`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isActive ? 'bg-white/18 text-white' : 'bg-slate-100 text-lokals-charcoal'
                      }`}>
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      {!collapsed ? (
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{item.label}</span>
                          {item.description ? (
                            <span className={`mt-0.5 block truncate text-xs ${isActive ? 'text-white/80' : 'text-lokals-muted'}`}>
                              {item.description}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-lokals-border/80 px-4 py-4">
        <div className={`flex items-center gap-3 rounded-[22px] bg-slate-50 px-3 py-3 ${collapsed ? 'justify-center lg:px-0 lg:py-0 lg:bg-transparent' : ''}`}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple">
            <UserRound className="h-5 w-5" />
          </span>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-lokals-charcoal">{user?.name ?? 'Resident'}</p>
              <p className="truncate text-xs text-lokals-muted">{footerLabel}</p>
            </div>
          ) : null}
        </div>
        <div className={`mt-3 flex ${collapsed ? 'justify-center lg:justify-center' : 'items-center justify-between gap-2'}`}>
          {!collapsed ? (
            <Link to="/dashboard/profile" className="text-sm font-semibold text-lokals-purple">
              Profile
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              clearSession()
              onCloseMobile?.()
            }}
            className="inline-flex items-center gap-2 rounded-full border border-lokals-border bg-white px-3 py-2 text-sm font-semibold text-lokals-charcoal"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed ? 'Logout' : null}
          </button>
        </div>
      </div>
    </aside>
  )
}
