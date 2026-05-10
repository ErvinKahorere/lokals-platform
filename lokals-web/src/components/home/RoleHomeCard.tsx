import { ArrowRight, BriefcaseBusiness, Building2, Compass, LayoutDashboard, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

type RoleCardKind = 'business' | 'worker' | 'citizen' | 'organization' | 'manager' | 'guest'

const roleCopy: Record<RoleCardKind, { title: string; body: string; cta: string; to: string; icon: typeof Compass }> = {
  business: {
    title: 'Manage your business',
    body: 'Track products, services, alerts, and local traction from one place.',
    cta: 'Open Dashboard',
    to: '/dashboard/business',
    icon: Store,
  },
  worker: {
    title: 'Find jobs near you',
    body: 'See local work opportunities and keep your worker profile active.',
    cta: 'View Work',
    to: '/jobs',
    icon: BriefcaseBusiness,
  },
  citizen: {
    title: 'Explore services nearby',
    body: 'Book trusted help, discover public offices, and stay on top of local updates.',
    cta: 'Find Service',
    to: '/services',
    icon: Compass,
  },
  organization: {
    title: 'Organization dashboard ready',
    body: 'Manage updates, alerts, events, and community activity from one place.',
    cta: 'Open Dashboard',
    to: '/dashboard/organization',
    icon: Building2,
  },
  manager: {
    title: 'Open your dashboard',
    body: 'Jump into reports, alerts, and role-specific oversight without leaving Home.',
    cta: 'Open Dashboard',
    to: '/dashboard/town-manager',
    icon: LayoutDashboard,
  },
  guest: {
    title: 'Sign in for a more personal city view',
    body: 'Keep your location, role, saved items, and updates in sync across LOKALS.',
    cta: 'Sign in',
    to: '/login',
    icon: Compass,
  },
}

export function RoleHomeCard({ kind, activeRole }: { kind: RoleCardKind; activeRole?: string }) {
  const content =
    kind === 'manager'
      ? {
          ...roleCopy.manager,
          to: activeRole === 'super_admin' || activeRole === 'operator' ? '/admin' : '/dashboard/town-manager',
        }
      : roleCopy[kind]
  const Icon = content.icon

  return (
    <div className="rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-green-soft text-lokals-green">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-lokals-charcoal">{content.title}</h3>
          <p className="mt-2 text-sm text-lokals-muted">{content.body}</p>
          <Link to={content.to} className="mt-4 inline-flex">
            <Button variant={kind === 'guest' ? 'secondary' : 'primary'}>{content.cta} <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
