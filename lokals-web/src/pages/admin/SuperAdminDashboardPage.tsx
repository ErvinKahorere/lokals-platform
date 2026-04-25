import { Link } from 'react-router-dom'
import { Button, PageHeader, SectionCard } from '../../components/Ui'
import { AdminOverviewPage } from './AdminOverviewPage'

export function SuperAdminDashboardPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Super Admin"
        title="Platform control center"
        description="Users, roles, organizations, moderation, and city operations stay visible from one top-level dashboard."
        actions={<Link to="/admin/users"><Button variant="secondary">Manage users</Button></Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Users and roles', 'Review access, platform accounts, and admin visibility.', '/admin/users'],
          ['Organizations and businesses', 'Keep directory entries and business presence healthy.', '/dashboard/business'],
          ['Reports and moderation', 'Track flagged content and public issue response.', '/admin/reports'],
        ].map(([title, body, to]) => (
          <SectionCard key={title} className="bg-white">
            <h3 className="font-semibold text-lokals-charcoal">{title}</h3>
            <p className="mt-2 text-sm text-lokals-muted">{body}</p>
            <Link to={to} className="mt-4 inline-flex text-sm font-semibold text-lokals-green">Open</Link>
          </SectionCard>
        ))}
      </div>
      <AdminOverviewPage />
    </div>
  )
}
