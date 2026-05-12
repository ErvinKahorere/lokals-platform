import { Bell, BriefcaseBusiness, Building2, CalendarDays, CircleHelp, Home, Newspaper, ShieldAlert, ShoppingBag, Store, UserRound, Verified } from 'lucide-react'
import { useMemo } from 'react'
import { ActionTile, PageHeader, SectionCard } from '../components/Ui'
import { getRoleHomePath } from '../lib/roles'
import { useAuthStore } from '../store/auth'

export function MorePage() {
  const user = useAuthStore((state) => state.user)
  const activeRole = user?.current_role ?? user?.roles?.[0] ?? 'guest'
  const isGuest = !user

  const roleActions = useMemo(() => {
    if (isGuest) {
      return [
        { to: '/login', label: 'Login', subtitle: 'Unlock your saved actions and local shortcuts', icon: UserRound },
        { to: '/support', label: 'Support', subtitle: 'Get help with LOKALS and your account', icon: CircleHelp },
      ]
    }

    if (['seller', 'business_owner'].includes(activeRole)) {
      return [
        { to: '/dashboard/business', label: 'Business Dashboard', subtitle: 'Listings, products, and service traction', icon: Store },
        { to: '/dashboard/bookings', label: 'Service Requests', subtitle: 'Bookings and customer demand in one place', icon: Bell },
      ]
    }

    if (activeRole === 'service_provider') {
      return [
        { to: '/dashboard/service-provider', label: 'Provider Dashboard', subtitle: 'Profile, requests, and service performance', icon: Verified },
        { to: '/verification', label: 'Verification', subtitle: 'Trust and provider status tools', icon: Verified },
      ]
    }

    if (activeRole === 'organization_admin') {
      return [
        { to: '/dashboard/organization', label: 'Organization Dashboard', subtitle: 'Updates, events, and community engagement', icon: Building2 },
        { to: '/dashboard/feed', label: 'Followed Organisations', subtitle: 'Community updates and followed signals', icon: Bell },
      ]
    }

    if (['town_manager', 'municipality_admin', 'super_admin', 'operator'].includes(activeRole)) {
      return [
        { to: activeRole === 'super_admin' || activeRole === 'operator' ? '/admin' : '/dashboard/town-manager', label: 'Town Portal', subtitle: 'Reports, alerts, and municipal tools', icon: Building2 },
        { to: '/dashboard/reports', label: 'Resident Requests', subtitle: 'Track issues and town-facing action', icon: Bell },
      ]
    }

    return [
      { to: getRoleHomePath(user), label: 'Dashboard', subtitle: 'Your role-aware dashboard and shortcuts', icon: BriefcaseBusiness },
    ]
  }, [activeRole, isGuest, user])

  const allFeatures = [
    { to: '/sos', label: 'SOS', subtitle: 'Emergency help', icon: ShieldAlert },
    { to: '/services', label: 'Services', subtitle: 'Trusted local help', icon: ShieldAlert },
    { to: '/ride', label: 'Taxi', subtitle: 'Ride requests', icon: ShoppingBag },
    { to: '/delivery', label: 'Delivery', subtitle: 'Parcel requests', icon: ShoppingBag },
    { to: '/store', label: 'Marketplace', subtitle: 'Products and local deals', icon: Store },
    { to: '/report-issue', label: 'Report Issue', subtitle: 'Town issue reporting', icon: Bell },
    { to: '/alerts', label: 'Announcements', subtitle: 'Town alerts and notices', icon: Bell },
    { to: '/directory', label: 'Directory', subtitle: 'Businesses and local services', icon: Building2 },
    { to: '/jobs', label: 'Jobs', subtitle: 'Local work and quick jobs', icon: BriefcaseBusiness },
    { to: '/accommodation', label: 'Rentals', subtitle: 'Accommodation and stays', icon: Home },
    { to: '/events', label: 'Events', subtitle: 'Events and tickets', icon: CalendarDays },
    { to: '/news', label: 'News', subtitle: 'Local stories and updates', icon: Newspaper },
    { to: '/dashboard/feed', label: 'Organisations', subtitle: 'Followed groups and updates', icon: Building2 },
    { to: '/activity', label: 'Activity', subtitle: 'Requests and account history', icon: Bell },
    { to: '/dashboard/profile', label: 'Profile', subtitle: 'Profile and identity tools', icon: UserRound },
    { to: '/saved-items', label: 'Saved', subtitle: 'Bookmarked providers and listings', icon: Verified },
    { to: '/support', label: 'Help', subtitle: 'Support and help center', icon: CircleHelp },
    { to: '/okahandja', label: 'Town Portal', subtitle: 'Municipality and public service portal', icon: Building2 },
  ]

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="More" title="Everything visible, without clutter" description="Hidden features, local tools, and role shortcuts stay easy to find from one clean page." />

      <SectionCard className="bg-white p-5">
        <h2 className="text-lg font-semibold text-lokals-charcoal">Role shortcuts</h2>
        <p className="mt-2 text-sm text-lokals-muted">Dashboard and workflow actions that matter most for your current role.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roleActions.map((item) => (
            <ActionTile key={item.label} to={item.to} label={item.label} subtitle={item.subtitle} icon={item.icon} />
          ))}
        </div>
      </SectionCard>

      <SectionCard className="bg-white p-5">
        <h2 className="text-lg font-semibold text-lokals-charcoal">All key features</h2>
        <p className="mt-2 text-sm text-lokals-muted">Every major LOKALS action should stay visible from Home or one tap away from here.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allFeatures.map((item) => (
            <ActionTile key={item.label} to={item.to} label={item.label} subtitle={item.subtitle} icon={item.icon} />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
