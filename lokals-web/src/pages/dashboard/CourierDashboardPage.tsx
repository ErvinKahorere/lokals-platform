import { DashboardShell } from '../../components/dashboard/DashboardShell'

export function CourierDashboardPage() {
  return (
    <DashboardShell
      mode="courier"
      eyebrow="Courier mode"
      title="Courier dashboard"
      description="Courier operations dashboard."
      stats={{ status: 'Online' }}
    >
      <div>Courier dashboard restored safely.</div>
    </DashboardShell>
  )
}