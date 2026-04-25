import { ArrowRight, Bell, BriefcaseBusiness, Home, Package, ShieldAlert, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCard, Button, Header, QueryState } from '../components/Ui'
import { GlassCard } from '../components/glass/GlassCard'
import { NearbyServiceCard } from '../components/experience/NearbyServiceCard'
import { NotificationBell } from '../components/experience/NotificationBell'
import { OnboardingFlow } from '../components/experience/OnboardingFlow'
import { QuickActionGrid } from '../components/experience/QuickActionGrid'
import { RecentActivityCard } from '../components/experience/RecentActivityCard'
import { SmartSuggestionCard } from '../components/experience/SmartSuggestionCard'
import { SearchBar } from '../components/ui/SearchBar'
import { useAccommodations, useAlertsFeed, useFeed, useMe, usePreferences, useProducts, useProviders, useSearchResults } from '../hooks/queries'
import { getDisplayPrice } from '../lib/display'
import { useAuthStore } from '../store/auth'

export function HomePage() {
  const { data } = useFeed()
  const user = useAuthStore((state) => state.user)
  const meQuery = useMe()
  const preferencesQuery = usePreferences()
  const [search, setSearch] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const alerts = data?.alerts ?? []
  const alertsFeedQuery = useAlertsFeed()
  const searchResultsQuery = useSearchResults(search)
  const providersQuery = useProviders()
  const productsQuery = useProducts({ sort: 'popular' })
  const accommodationsQuery = useAccommodations({ sort: 'popular' })
  const providers = providersQuery.data?.data?.slice(0, 3) ?? []
  const products = productsQuery.data?.data?.slice(0, 3) ?? []
  const accommodations = accommodationsQuery.data?.data?.slice(0, 2) ?? []
  const currentUser = meQuery.data?.user ? ('data' in meQuery.data.user ? meQuery.data.user.data : meQuery.data.user) : user
  const town = currentUser?.default_town ?? preferencesQuery.data?.default_town ?? 'Windhoek'
  const area = currentUser?.default_area ?? preferencesQuery.data?.default_area
  const activeRole = currentUser?.current_role ?? currentUser?.roles?.[0] ?? 'citizen'
  const roleContentMap = {
    citizen: {
      title: 'Your city, ready to help',
      description: 'Services, alerts, directory, and places to stay stay close to home.',
      cta: { label: 'Find help', to: '/services' },
    },
    worker: {
      title: 'Work nearby, without the noise',
      description: 'Jobs, quick applications, and your recent activity stay easy to act on.',
      cta: { label: 'Find work', to: '/jobs' },
    },
    seller: {
      title: 'Your local selling space',
      description: 'Products, promotions, and business activity are ready to manage.',
      cta: { label: 'Open store', to: '/store' },
    },
    service_provider: {
      title: 'Bookings and customer trust first',
      description: 'Keep rates, availability, and incoming demand visible in one place.',
      cta: { label: 'Manage business', to: '/dashboard/business' },
    },
    business_owner: {
      title: 'Your business, easier to run',
      description: 'Followers, services, products, and alerts live in one dashboard.',
      cta: { label: 'Manage business', to: '/dashboard/business' },
    },
    organization_admin: {
      title: 'Keep your organization clear and connected',
      description: 'Announcements, directory trust, and public visibility stay easier to manage.',
      cta: { label: 'Manage organization', to: '/dashboard/business' },
    },
    municipality_admin: {
      title: 'Your city operations hub',
      description: 'Reports, alerts, and service coverage stay visible without clutter.',
      cta: { label: 'Open town manager', to: '/dashboard/municipality' },
    },
  }
  const roleContent = roleContentMap[activeRole as keyof typeof roleContentMap] ?? {
    title: 'Your city, your space',
    description: 'Pick one clear action and keep moving.',
    cta: { label: 'Explore', to: '/services' },
  }

  useEffect(() => {
    setShowGuide(window.localStorage.getItem('lokals-home-guide-dismissed') !== 'true')
    setShowOnboarding(window.localStorage.getItem('lokals-onboarding-complete') !== 'true')
  }, [])

  return (
    <div className="space-y-8">
      {showOnboarding ? (
        <OnboardingFlow onComplete={() => {
          setShowOnboarding(false)
          window.localStorage.setItem('lokals-onboarding-complete', 'true')
        }} />
      ) : null}
      <section className="glass-surface overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,rgba(49,46,129,0.95)_0%,rgba(79,70,229,0.92)_50%,rgba(124,58,237,0.9)_100%)] px-6 py-7 text-white shadow-soft-lg">
        <Header
          eyebrow={currentUser ? `Good day, ${currentUser.name}` : 'Good day'}
          title={`Showing results for ${town}`}
          description={area ? `${area} first. ${roleContent.description}` : roleContent.description}
          actions={<div className="flex items-center gap-3"><NotificationBell count={alerts.length || 3} /><Link to={roleContent.cta.to}><Button>{roleContent.cta.label} <ArrowRight className="h-4 w-4" /></Button></Link></div>}
        />
        <div className="mt-4 inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-white/85">
          {roleContent.title}
        </div>
        <div className="mt-5">
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onValueSelect={setSearch}
            placeholder="Search services, jobs, products..."
            recentKey="home"
            suggestions={['Barber nearby', 'Clinic open now', 'Jobs near me', 'Parcel delivery']}
            shortcuts={[
              { label: 'Get Help', value: 'service near me' },
              { label: 'Shop', value: 'products nearby' },
              { label: 'Stay', value: 'accommodation nearby' },
            ]}
          />
        </div>
        {search.trim() ? (
          <GlassCard className="mt-4 bg-white/20 text-white dark:bg-slate-900/40">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Search results</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {[
                { label: 'Services', items: searchResultsQuery.data?.services ?? [], key: 'name', href: '/services' },
                { label: 'Jobs', items: searchResultsQuery.data?.jobs ?? [], key: 'title', href: '/jobs' },
                { label: 'Listings', items: searchResultsQuery.data?.listings ?? [], key: 'title', href: '/marketplace' },
                { label: 'Directory', items: searchResultsQuery.data?.directory ?? [], key: 'name', href: '/directory' },
                { label: 'Products', items: searchResultsQuery.data?.products ?? [], key: 'title', href: '/store' },
                { label: 'Accommodation', items: searchResultsQuery.data?.accommodations ?? [], key: 'title', href: '/accommodation' },
              ].map((section) => (
                <div key={section.label} className="rounded-[20px] bg-white/10 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{section.label}</p>
                    <Link to={section.href} className="text-xs font-semibold text-lokals-gold">Open</Link>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-white/80">
                    {section.items.length === 0 ? <p>No matches yet.</p> : section.items.slice(0, 3).map((item: any) => <p key={`${section.label}-${item.id}`}>{item[section.key]}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        ) : null}
      </section>

      {showGuide ? (
        <section className="rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">First visit</p>
              <h2 className="mt-2 text-xl font-semibold text-lokals-charcoal">What do you want to do today?</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/services"><Button variant="secondary">Find a service</Button></Link>
                <Link to="/jobs"><Button variant="secondary">Find work</Button></Link>
                <Link to="/store"><Button variant="secondary">Shop</Button></Link>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowGuide(false)
                window.localStorage.setItem('lokals-home-guide-dismissed', 'true')
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lokals-muted"
              aria-label="Dismiss guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}

      <QuickActionGrid />

      <section className="rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Need help now?</p>
            <h2 className="mt-1 text-2xl font-semibold text-lokals-charcoal">Start with the fastest local action.</h2>
          </div>
          <Link to="/services"><Button>Find service</Button></Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SmartSuggestionCard title="Need a barber nearby?" body="Get help fast with provider cards built for call or booking in seconds." to="/services" icon={Sparkles} badge="Primary" />
        <SmartSuggestionCard title="Directory help nearby" body="Clinics, police, pharmacies, and local services stay easy to reach." to="/directory" icon={ShieldAlert} badge="Trusted" />
        <SmartSuggestionCard title="Jobs and workers nearby" body="Work stays one tap away when you need to earn or hire." to="/jobs" icon={BriefcaseBusiness} badge="Work" />
        <SmartSuggestionCard title="Need a place to stay?" body="Browse rentals and short stays without leaving the app." to="/accommodation" icon={Home} badge="Stay" />
      </section>

      <section className="space-y-4 border-t border-slate-200/70 pt-6 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Nearby now</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Nearby services</h2>
          </div>
          <Link to="/services" className="text-sm font-semibold text-lokals-green">See all</Link>
        </div>
        <QueryState isLoading={providersQuery.isLoading} error={providersQuery.error} empty={providers.length === 0}>
          <div className="grid gap-4 xl:grid-cols-3">
            {providers.map((provider) => <NearbyServiceCard key={provider.id} provider={provider} />)}
          </div>
        </QueryState>
      </section>

      <section className="space-y-4 border-t border-slate-200/70 pt-6 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Deals nearby</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Store deals</h2>
          </div>
          <Link to="/store" className="text-sm font-semibold text-lokals-green">Open store</Link>
        </div>
        <QueryState isLoading={productsQuery.isLoading} error={productsQuery.error} empty={products.length === 0}>
          <div className="grid gap-4 md:grid-cols-3">
            {products.map((product) => (
              <Link key={product.id} to={`/store/${product.id}`} className="rounded-[20px] border border-lokals-border bg-white p-4 shadow-card transition hover:-translate-y-0.5">
                <p className="font-semibold text-lokals-charcoal">{product.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{product.business?.name ?? product.user?.name ?? 'Local seller'}</p>
                <p className="mt-3 text-lg font-bold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price)}</p>
              </Link>
            ))}
          </div>
        </QueryState>
      </section>

      <section className="space-y-4 border-t border-slate-200/70 pt-6 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Stay nearby</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Accommodation nearby</h2>
          </div>
          <Link to="/accommodation" className="text-sm font-semibold text-lokals-green">Browse stays</Link>
        </div>
        <QueryState isLoading={accommodationsQuery.isLoading} error={accommodationsQuery.error} empty={accommodations.length === 0}>
          <div className="grid gap-4 md:grid-cols-2">
            {accommodations.map((item) => (
              <Link key={item.id} to={`/accommodation/${item.id}`} className="rounded-[20px] border border-lokals-border bg-white p-4 shadow-card transition hover:-translate-y-0.5">
                <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{item.area ?? item.town ?? 'Windhoek'}</p>
                <p className="mt-3 text-lg font-bold text-lokals-charcoal">{getDisplayPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        </QueryState>
      </section>

      <section className="space-y-4 border-t border-slate-200/70 pt-6 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Community</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Alerts near you</h2>
          </div>
          <Link to="/activity" className="text-sm font-semibold text-lokals-purple">Open feed</Link>
        </div>
        <QueryState isLoading={alertsFeedQuery.isLoading} error={alertsFeedQuery.error} empty={(alertsFeedQuery.data?.data ?? []).length === 0}>
          <div className="space-y-3">
            {(alertsFeedQuery.data?.data ?? []).slice(0, 3).map((item) => (
              <AlertCard key={item.id} alert={{ id: item.id, title: item.title, body: item.body, priority: item.severity ?? 'info', location: item.location }} />
            ))}
          </div>
        </QueryState>
      </section>

      <section className="space-y-4 border-t border-slate-200/70 pt-6 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-lokals-charcoal" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Your updates</p>
              <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Recent activity</h2>
            </div>
          </div>
          <Link to="/activity" className="text-sm font-semibold text-lokals-green">Open timeline</Link>
        </div>
        <div className="space-y-3">
          <RecentActivityCard icon={Bell} title="Booking confirmed" body="Your last service request is ready for provider review." time="2 min ago" statusLabel="Bookings" />
          <RecentActivityCard icon={BriefcaseBusiness} title="Job application sent" body="Your recent application was delivered with saved profile details." time="1 hour ago" statusLabel="Work" />
          <RecentActivityCard icon={Package} title="Parcel request sent" body="Your delivery handoff details are ready for driver review." time="Today" statusLabel="Send" />
        </div>
      </section>
    </div>
  )
}
