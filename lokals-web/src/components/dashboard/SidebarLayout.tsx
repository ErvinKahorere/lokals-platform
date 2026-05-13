import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { DashboardRealtimeDiagnostics } from './DashboardRealtimeDiagnostics'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopbar } from './DashboardTopbar'
import { type DashboardMode } from '../../lib/dashboardConfig'
import { DashboardRealtimeProvider, useDashboardRealtime } from '../../lib/dashboardRealtime'
import { useNotifications } from '../../hooks/queries'
import { useAuthStore } from '../../store/auth'

export function SidebarLayout({
  mode,
  children,
}: {
  mode: DashboardMode
  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const notificationsQuery = useNotifications()
  const user = useAuthStore((state) => state.user)
  const realtime = useDashboardRealtime(mode, { userId: user?.id, townId: user?.default_town ?? null })
  const handleToggleCollapse = useCallback(() => {
    setCollapsed((value) => !value)
  }, [])
  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])
  const handleOpenSidebar = useCallback(() => {
    setMobileOpen(true)
  }, [])

  const unreadCount = useMemo(
    () => notificationsQuery.data?.filter((item) => item.read_at == null).length ?? 0,
    [notificationsQuery.data],
  )

  return (
    <DashboardRealtimeProvider value={realtime}>
      <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
      <div className="hidden lg:block">
        <div className={`sticky top-5 h-[calc(100vh-2.5rem)] transition-all ${collapsed ? 'w-[108px]' : 'w-[332px]'}`}>
          <DashboardSidebar mode={mode} collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[88vw] max-w-[340px] p-4">
            <DashboardSidebar mode={mode} collapsed={false} onToggleCollapse={handleToggleCollapse} onCloseMobile={handleCloseMobile} />
          </div>
        </div>
      ) : null}

      <div className="min-w-0 space-y-5">
        <DashboardTopbar mode={mode} onOpenSidebar={handleOpenSidebar} unreadCount={unreadCount} realtimeStatus={realtime.status} updatedAt={realtime.updatedAt} />
        {children}
      </div>
      </div>
      {import.meta.env.DEV ? <DashboardRealtimeDiagnostics /> : null}
    </DashboardRealtimeProvider>
  )
}
