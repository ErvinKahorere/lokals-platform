import { Navigate } from 'react-router-dom'
import { useDashboardIndex } from '../../hooks/queries'
import { EmptyDashboardState } from '../../components/dashboard/EmptyDashboardState'
import { PageHeader, QueryState } from '../../components/Ui'

const endpointToRoute: Record<string, string> = {
  '/dashboard/citizen': '/dashboard/resident',
  '/dashboard/worker': '/dashboard/worker',
  '/dashboard/seller': '/dashboard/business',
  '/dashboard/business': '/dashboard/business',
  '/dashboard/service-provider': '/dashboard/provider',
  '/dashboard/organization': '/dashboard/organisation',
  '/dashboard/municipality': '/dashboard/municipality',
  '/dashboard/town-manager': '/dashboard/town-manager',
  '/dashboard/admin': '/dashboard/admin',
}

export function DashboardPage() {
  const dashboardQuery = useDashboardIndex()

  if (dashboardQuery.data?.dashboard_endpoint) {
    return <Navigate to={endpointToRoute[dashboardQuery.data.dashboard_endpoint] ?? '/dashboard/resident'} replace />
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Dashboard" title="Your dashboard" description="Opening the right workspace for your active role." />
      <QueryState isLoading={dashboardQuery.isLoading} error={dashboardQuery.error}>
        <EmptyDashboardState title="Dashboard unavailable" body="We could not determine the best workspace for your current role." />
      </QueryState>
    </div>
  )
}
