import { useMemo, useState, type ReactNode } from 'react'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopbar } from './DashboardTopbar'
import { type DashboardMode } from '../../lib/dashboardConfig'
import { useNotifications } from '../../hooks/queries'

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

  const unreadCount = useMemo(
    () => notificationsQuery.data?.filter((item) => item.read_at == null).length ?? 0,
    [notificationsQuery.data],
  )

  return (
    <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
      <div className="hidden lg:block">
        <div className={`sticky top-5 h-[calc(100vh-2.5rem)] transition-all ${collapsed ? 'w-[108px]' : 'w-[332px]'}`}>
          <DashboardSidebar mode={mode} collapsed={collapsed} onToggleCollapse={() => setCollapsed((value) => !value)} />
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[88vw] max-w-[340px] p-4">
            <DashboardSidebar mode={mode} collapsed={false} onToggleCollapse={() => undefined} onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="min-w-0 space-y-5">
        <DashboardTopbar mode={mode} onOpenSidebar={() => setMobileOpen(true)} unreadCount={unreadCount} />
        {children}
      </div>
    </div>
  )
}
