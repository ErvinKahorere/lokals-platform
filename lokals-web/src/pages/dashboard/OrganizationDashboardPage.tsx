import { BellRing, Building2, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, PageHeader, QueryState, SectionCard, StatCard } from '../../components/Ui'
import { useBusinessDashboard } from '../../hooks/queries'

export function OrganizationDashboardPage() {
  const dashboardQuery = useBusinessDashboard()
  const dashboard = dashboardQuery.data

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Organization"
        title="Organization dashboard"
        description="Manage public visibility, announcements, followers, and directory trust in one place."
        actions={<Link to="/directory"><Button variant="secondary">View public profile</Button></Link>}
      />
      <QueryState isLoading={dashboardQuery.isLoading} error={dashboardQuery.error} empty={!dashboard}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(dashboard?.stats ?? {}).filter(([key]) => ['followers', 'alerts_sent', 'views', 'profile_completion'].includes(key)).map(([key, value]) => (
            <StatCard key={key} label={key.replaceAll('_', ' ')} value={String(value)} hint="Organization overview" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard className="bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple"><Building2 className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-lokals-charcoal">Directory profile</h3>
                <p className="text-sm text-lokals-muted">Keep category, contact, rates, and services trustworthy.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-lokals-muted">
              {(dashboard?.businesses ?? []).slice(0, 3).map((business) => (
                <p key={business.id}>{business.name} • {business.category}</p>
              ))}
            </div>
          </SectionCard>
          <SectionCard className="bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-gold/20 text-amber-700"><BellRing className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-lokals-charcoal">Announcements</h3>
                <p className="text-sm text-lokals-muted">Post closures, notices, promotions, and public updates.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-lokals-muted">
              {(dashboard?.alerts ?? []).slice(0, 3).map((alert) => (
                <p key={alert.id}>{alert.title}</p>
              ))}
            </div>
          </SectionCard>
          <SectionCard className="bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lokals-green"><UsersRound className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-lokals-charcoal">Community</h3>
                <p className="text-sm text-lokals-muted">Followers and engagement stay visible without extra clutter.</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-lokals-muted">
              <p>You can keep one public profile, publish alerts, and respond to local interest from here.</p>
            </div>
          </SectionCard>
        </div>
      </QueryState>
    </div>
  )
}
