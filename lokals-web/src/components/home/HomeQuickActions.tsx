import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Award, Bell, BriefcaseBusiness, Building2, CalendarDays, CircleHelp, FileWarning, HeartHandshake, Home, Newspaper, ShieldAlert, ShoppingBag, Store, UserRound, Verified, WalletCards } from 'lucide-react'
import { ActionTile, Button, Card } from '../Ui'
import { Link } from 'react-router-dom'

type ActionItem = {
  to: string
  label: string
  icon: LucideIcon
  color: string
}

const primaryActions: ActionItem[] = [
  { to: '/sos', label: 'SOS', icon: ShieldAlert, color: 'bg-red-50 text-red-600' },
  { to: '/services', label: 'Services', icon: ShieldAlert, color: 'bg-lokals-green-soft text-lokals-green' },
  { to: '/ride', label: 'Taxi', icon: WalletCards, color: 'bg-amber-50 text-amber-700' },
  { to: '/delivery', label: 'Delivery', icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-700' },
  { to: '/store', label: 'Market', icon: Store, color: 'bg-violet-50 text-violet-700' },
  { to: '/report-issue', label: 'Report', icon: FileWarning, color: 'bg-orange-50 text-orange-700' },
  { to: '/alerts', label: 'Alerts', icon: Bell, color: 'bg-sky-50 text-sky-700' },
  { to: '/directory', label: 'Directory', icon: Building2, color: 'bg-slate-100 text-slate-700' },
  { to: '/get-involved', label: 'Involved', icon: HeartHandshake, color: 'bg-violet-50 text-violet-700' },
  { to: '/community-impact', label: 'Impact', icon: Award, color: 'bg-emerald-50 text-emerald-700' },
]

const exploreActions: ActionItem[] = [
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness, color: 'bg-sky-50 text-sky-700' },
  { to: '/accommodation', label: 'Rentals', icon: Home, color: 'bg-emerald-50 text-emerald-700' },
  { to: '/events', label: 'Events', icon: CalendarDays, color: 'bg-amber-50 text-amber-700' },
  { to: '/news', label: 'News', icon: Newspaper, color: 'bg-slate-100 text-slate-700' },
  { to: '/dashboard/feed', label: 'Orgs', icon: Building2, color: 'bg-violet-50 text-violet-700' },
  { to: '/saved-items', label: 'Saved', icon: HeartHandshake, color: 'bg-slate-100 text-slate-700' },
  { to: '/support', label: 'Help', icon: CircleHelp, color: 'bg-sky-50 text-sky-700' },
]

const accountActions: ActionItem[] = [
  { to: '/activity', label: 'Activity', icon: Bell, color: 'bg-violet-50 text-violet-700' },
  { to: '/notifications', label: 'Notify', icon: Bell, color: 'bg-sky-50 text-sky-700' },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound, color: 'bg-slate-100 text-slate-700' },
  { to: '/verification', label: 'Verify', icon: Verified, color: 'bg-emerald-50 text-emerald-700' },
]

function roleActions(activeRole: string, isGuest: boolean): ActionItem[] {
  if (isGuest) {
    return [{ to: '/login', label: 'Login', icon: UserRound, color: 'bg-violet-50 text-violet-700' }]
  }

  if (['seller', 'business_owner'].includes(activeRole)) {
    return [
      { to: '/dashboard/business', label: 'Business', icon: Store, color: 'bg-violet-50 text-violet-700' },
      { to: '/store', label: 'Listings', icon: ShoppingBag, color: 'bg-amber-50 text-amber-700' },
      { to: '/dashboard/bookings', label: 'Requests', icon: WalletCards, color: 'bg-sky-50 text-sky-700' },
    ]
  }

  if (activeRole === 'service_provider') {
    return [
      { to: '/dashboard/service-provider', label: 'Provider', icon: Verified, color: 'bg-violet-50 text-violet-700' },
      { to: '/dashboard/bookings', label: 'Requests', icon: WalletCards, color: 'bg-sky-50 text-sky-700' },
      { to: '/verification', label: 'Verify', icon: Verified, color: 'bg-emerald-50 text-emerald-700' },
    ]
  }

  if (activeRole === 'organization_admin') {
    return [
      { to: '/dashboard/organization', label: 'Org Hub', icon: Building2, color: 'bg-violet-50 text-violet-700' },
      { to: '/alerts', label: 'Alerts', icon: Bell, color: 'bg-sky-50 text-sky-700' },
      { to: '/dashboard/feed', label: 'Updates', icon: HeartHandshake, color: 'bg-amber-50 text-amber-700' },
    ]
  }

  if (['town_manager', 'municipality_admin', 'super_admin', 'operator'].includes(activeRole)) {
    return [
      { to: activeRole === 'super_admin' || activeRole === 'operator' ? '/admin' : '/dashboard/town-manager', label: 'Portal', icon: Building2, color: 'bg-violet-50 text-violet-700' },
      { to: '/dashboard/town-manager/community-projects', label: 'Projects', icon: HeartHandshake, color: 'bg-emerald-50 text-emerald-700' },
      { to: '/dashboard/reports', label: 'Reports', icon: FileWarning, color: 'bg-orange-50 text-orange-700' },
      { to: '/alerts', label: 'Alerts', icon: Bell, color: 'bg-sky-50 text-sky-700' },
    ]
  }

  if (activeRole === 'worker') {
    return [
      { to: '/dashboard/worker', label: 'Work Hub', icon: BriefcaseBusiness, color: 'bg-violet-50 text-violet-700' },
      { to: '/jobs', label: 'Quick Jobs', icon: BriefcaseBusiness, color: 'bg-amber-50 text-amber-700' },
      { to: '/dashboard/profile', label: 'Profile', icon: UserRound, color: 'bg-slate-100 text-slate-700' },
    ]
  }

  return [
    { to: '/okahandja', label: 'Town Portal', icon: Building2, color: 'bg-violet-50 text-violet-700' },
    { to: '/activity', label: 'Activity', icon: Bell, color: 'bg-sky-50 text-sky-700' },
    { to: '/support', label: 'Support', icon: CircleHelp, color: 'bg-emerald-50 text-emerald-700' },
  ]
}

function ActionGroup({
  eyebrow,
  title,
  description,
  items,
  footer,
}: {
  eyebrow: string
  title: string
  description: string
  items: ActionItem[]
  footer?: ReactNode
}) {
  return (
    <Card className="p-5">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">{title}</h2>
          <p className="mt-2 text-sm text-lokals-muted">{description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ActionTile key={item.label} to={item.to} label={item.label} subtitle="Open" icon={item.icon} className={item.color} />
          ))}
        </div>
        {footer}
      </div>
    </Card>
  )
}

export function HomeQuickActions({ activeRole, isGuest }: { activeRole: string; isGuest: boolean }) {
  const roleItems = roleActions(activeRole, isGuest)

  return (
    <div className="space-y-4">
      <ActionGroup
        eyebrow="Primary actions"
        title="Quick actions"
        description="The fastest ways to get help, move around town, and reach the features people use most."
        items={primaryActions}
        footer={
          <Link to="/services" className="inline-flex">
            <Button variant="secondary">View all services</Button>
          </Link>
        }
      />
      <ActionGroup
        eyebrow="Explore more"
        title="More services"
        description="Local life, opportunities, and community tools should stay one tap away."
        items={exploreActions}
      />
      <ActionGroup
        eyebrow="My space"
        title="Account and updates"
        description="Keep requests, notifications, saved items, and profile tools easy to reach."
        items={accountActions}
      />
      <ActionGroup
        eyebrow="Role tools"
        title="Built for your role"
        description="Role-aware shortcuts keep dashboards, verification, and town tools easier to discover."
        items={roleItems}
      />
    </div>
  )
}
