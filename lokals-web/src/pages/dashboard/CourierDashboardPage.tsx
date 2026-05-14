import { DashboardShell } from '../../components/dashboard/DashboardShell'

export function CourierDashboardPage() {
  return (
    <DashboardShell
      mode="courier"
      eyebrow="Courier mode"
      title="Courier dashboard"
      description="Courier dashboard isolation test."
      stats={{ status: 'OK' }}
    >
      <div>Courier OK</div>
    </DashboardShell>
  )
}