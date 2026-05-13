import { AlertTriangle, Bell, BriefcaseBusiness, Building2, Newspaper, Phone, ShieldAlert, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, ListTile, PageHeader, QueryState, SectionCard, StatCard, StatusBadge } from '../components/Ui'
import { useAccommodations, useAlertsFeed, useDirectory, useEvents, useJobs, useNewsLocal, useProducts } from '../hooks/queries'
import { PILOT_TOWN } from '../lib/pilot'

export function TownPortalPage() {
  const alertsQuery = useAlertsFeed()
  const servicesQuery = useDirectory({ public_service: 1, verified: 1 })
  const businessesQuery = useDirectory({ verified: 1 })
  const eventsQuery = useEvents()
  const newsQuery = useNewsLocal()
  const jobsQuery = useJobs()
  const productsQuery = useProducts({ sort: 'popular' })
  const accommodationQuery = useAccommodations()

  const emergencyContacts = (servicesQuery.data?.data ?? [])
    .filter((item) => item.emergency_contact || item.category.toLowerCase().includes('police') || item.category.toLowerCase().includes('health'))
    .slice(0, 4)
  const allAlerts = alertsQuery.data?.data ?? []
  const openReports = jobsQuery.data?.data?.length ?? 0
  const urgentAlerts = allAlerts.filter((item) => ['critical', 'high', 'urgent'].includes((item.severity ?? '').toLowerCase())).length
  const publicServices = (servicesQuery.data?.data ?? []).length
  const recentAlerts = allAlerts.slice(0, 3)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Town Portal" title="Okahandja Town" description="Your digital town hub" actions={<Link to="/report-issue"><Button>Report Issue</Button></Link>} />

      <section className="rounded-[28px] bg-gradient-to-br from-lokals-purple-deep via-lokals-purple to-[#6A53F0] p-6 text-white shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Okahandja town manager portal</p>
        <h2 className="mt-3 text-3xl font-semibold">Official local updates, reports, and public action in one calm control center.</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge value="Official pilot" tone="neutral" className="bg-white/14 text-white border-white/15" />
          <StatusBadge value="Municipality-ready" tone="neutral" className="bg-white/14 text-white border-white/15" />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/report-issue"><Button className="bg-white text-lokals-charcoal hover:bg-white/90">Report Issue</Button></Link>
          <Link to="/alerts"><Button variant="secondary">View Alerts</Button></Link>
          <Link to="/directory"><Button variant="secondary">Find Public Service</Button></Link>
          <Link to="/directory"><Button variant="secondary">Contact Council</Button></Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open reports" value={openReports} hint="Resident issues in flow" />
        <StatCard label="Urgent" value={urgentAlerts} hint="High-priority updates" />
        <StatCard label="Public services" value={publicServices} hint="Verified directory entries" />
        <StatCard label="Recent alerts" value={allAlerts.length} hint="Council and service notices" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Town Alerts', 'Latest council and service notices', <Bell className="h-5 w-5" />, '/alerts'],
          ['Report an Issue', 'Water, roads, waste, and safety reports', <AlertTriangle className="h-5 w-5" />, '/report-issue'],
          ['Public Services', 'Council, police, clinics, and facilities', <Building2 className="h-5 w-5" />, '/directory'],
          ['Emergency Contacts', 'Fast access to key contacts', <ShieldAlert className="h-5 w-5" />, '/directory'],
        ].map(([title, body, icon, href]) => (
          <Link key={title as string} to={href as string} className="block">
            <Card interactive className="p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">{icon}</div>
            <p className="mt-4 font-semibold text-lokals-charcoal">{title}</p>
            <p className="mt-2 text-sm text-lokals-muted">{body}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard className="bg-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Town alerts</p>
              <h3 className="mt-1 text-lg font-semibold text-lokals-charcoal">Local updates</h3>
            </div>
            <Link to="/alerts" className="text-sm font-semibold text-lokals-green">View all</Link>
          </div>
          <QueryState isLoading={alertsQuery.isLoading} error={alertsQuery.error} empty={(alertsQuery.data?.data ?? []).length === 0}>
            <div className="mt-4 space-y-3">
              {(alertsQuery.data?.data ?? []).slice(0, 4).map((item) => (
                <ListTile
                  key={item.id}
                  title={item.title}
                  subtitle={item.location ?? PILOT_TOWN}
                  leading={<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple"><Bell className="h-4 w-4" /></div>}
                  trailing={<StatusBadge value={item.severity ?? 'info'} tone={item.severity === 'critical' || item.severity === 'high' ? 'danger' : 'info'} />}
                  to="/alerts"
                />
              ))}
            </div>
          </QueryState>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Public services</p>
              <h3 className="mt-1 text-lg font-semibold text-lokals-charcoal">Official local services</h3>
            </div>
            <Link to="/directory" className="text-sm font-semibold text-lokals-green">Open directory</Link>
          </div>
          <QueryState isLoading={servicesQuery.isLoading} error={servicesQuery.error} empty={(servicesQuery.data?.data ?? []).length === 0}>
            <div className="mt-4 space-y-3">
              {(servicesQuery.data?.data ?? []).slice(0, 5).map((item) => (
                <ListTile
                  key={item.id}
                  title={item.name}
                  subtitle={`${item.category} | ${item.area ?? item.town ?? item.location ?? PILOT_TOWN}`}
                  leading={<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple"><Building2 className="h-4 w-4" /></div>}
                  to={`/directory/${item.id}`}
                />
              ))}
            </div>
          </QueryState>
        </SectionCard>

        <SectionCard className="bg-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Emergency contacts</p>
            <h3 className="mt-1 text-lg font-semibold text-lokals-charcoal">Call quickly</h3>
          </div>
          <QueryState isLoading={servicesQuery.isLoading} error={servicesQuery.error} empty={emergencyContacts.length === 0}>
            <div className="mt-4 space-y-3">
              {emergencyContacts.map((item) => (
                <ListTile
                  key={item.id}
                  title={item.name}
                  subtitle={item.phone ?? 'Call details available from the council desk'}
                  leading={<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-lokals-danger"><Phone className="h-4 w-4" /></div>}
                  trailing={<span className="text-xs font-semibold text-lokals-green">Call / WhatsApp</span>}
                  to={`/directory/${item.id}`}
                />
              ))}
            </div>
          </QueryState>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard className="bg-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Recent alerts</p>
              <h3 className="mt-1 text-lg font-semibold text-lokals-charcoal">What residents are seeing now</h3>
            </div>
            <Link to="/alerts" className="text-sm font-semibold text-lokals-green">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentAlerts.map((item) => (
              <ListTile
                key={item.id}
                title={item.title}
                subtitle={`${item.location ?? PILOT_TOWN} | ${item.timestamp ?? 'Recent'}`}
                leading={<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple"><Bell className="h-4 w-4" /></div>}
                trailing={<StatusBadge value={item.severity ?? 'info'} tone={item.severity === 'critical' || item.severity === 'high' ? 'danger' : 'warning'} />}
                to="/alerts"
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Quick actions</p>
            <h3 className="mt-1 text-lg font-semibold text-lokals-charcoal">Council-ready next steps</h3>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ['Send Alert', '/alerts'],
              ['View Reports', '/report-issue'],
              ['Add Service', '/directory'],
              ['Open Analytics', '/jobs'],
            ].map(([label, href]) => (
              <Link key={label} to={href} className="rounded-[20px] border border-lokals-border bg-[linear-gradient(180deg,#ffffff,#fbfcff)] px-4 py-4 text-sm font-semibold text-lokals-charcoal shadow-card transition hover:-translate-y-0.5">
                {label}
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['Local Businesses', businessesQuery.data?.data?.length ?? 0, <Store className="h-5 w-5" />, '/directory'],
          ['Events', eventsQuery.data?.data?.length ?? 0, <Building2 className="h-5 w-5" />, '/events'],
          ['News', newsQuery.data?.data?.length ?? 0, <Newspaper className="h-5 w-5" />, '/news'],
          ['Service Requests Status', jobsQuery.data?.data?.length ?? 0, <BriefcaseBusiness className="h-5 w-5" />, '/jobs'],
          ['Store Listings', productsQuery.data?.data?.length ?? 0, <Store className="h-5 w-5" />, '/store'],
          ['Accommodation', accommodationQuery.data?.data?.length ?? 0, <Building2 className="h-5 w-5" />, '/accommodation'],
        ].map(([title, count, icon, href]) => (
          <Link key={title as string} to={href as string} className="block">
            <Card interactive className="p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-green-soft text-lokals-green">{icon}</div>
            <p className="mt-4 font-semibold text-lokals-charcoal">{title}</p>
            <p className="mt-1 text-sm text-lokals-muted">{count} items ready for the pilot view.</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
