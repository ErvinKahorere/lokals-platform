import { AlertTriangle, Bell, BriefcaseBusiness, Building2, Newspaper, Phone, ShieldAlert, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
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

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Town Portal" title="Okahandja Town" description="Your digital town hub" actions={<Link to="/report-issue"><Button>Report Issue</Button></Link>} />

      <section className="rounded-[28px] bg-gradient-to-br from-lokals-purple-deep via-lokals-purple to-[#6A53F0] p-6 text-white shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">LOKALS {PILOT_TOWN}</p>
        <h2 className="mt-3 text-3xl font-semibold">Town updates, services, and local action in one place.</h2>
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
                <div key={item.id} className="rounded-[18px] border border-lokals-border bg-[linear-gradient(180deg,#ffffff,#fbfcff)] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{item.location ?? PILOT_TOWN}</p>
                    </div>
                    <StatusBadge value={item.severity ?? 'info'} tone={item.severity === 'critical' || item.severity === 'high' ? 'danger' : 'info'} />
                  </div>
                </div>
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
                <div key={item.id} className="rounded-[18px] border border-lokals-border bg-[linear-gradient(180deg,#ffffff,#fbfcff)] px-4 py-3">
                  <p className="font-semibold text-lokals-charcoal">{item.name}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{item.category} | {item.area ?? item.town ?? item.location ?? PILOT_TOWN}</p>
                </div>
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
                <div key={item.id} className="rounded-[18px] border border-lokals-border bg-[linear-gradient(180deg,#ffffff,#fbfcff)] px-4 py-3">
                  <p className="font-semibold text-lokals-charcoal">{item.name}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{item.phone ?? 'Call details available from the council desk'}</p>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-lokals-green">
                    <Phone className="h-4 w-4" />
                    <span>Call / WhatsApp</span>
                  </div>
                </div>
              ))}
            </div>
          </QueryState>
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
