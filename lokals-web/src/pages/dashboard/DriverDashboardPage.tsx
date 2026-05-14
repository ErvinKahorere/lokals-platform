import { DashboardShell } from '../../components/dashboard/DashboardShell'

export function DriverDashboardPage() {
  return (
    <DashboardShell
      mode="driver"
      eyebrow="Driver mode"
      title="Driver dashboard"
      description="Driver dashboard isolation test."
      stats={{ status: 'OK' }}
    >
      <div>Driver OK</div>
    </DashboardShell>
  )
}