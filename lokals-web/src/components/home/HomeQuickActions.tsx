import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CarFront,
  FileWarning,
  HeartHandshake,
  Package,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, QuickActionCard } from '../Ui'

type QuickAction = {
  to: string
  label: string
  icon: LucideIcon
  accentClass: string
}

const primaryActions: QuickAction[] = [
  { to: '/report-issue', label: 'Report Issue', icon: FileWarning, accentClass: 'bg-orange-50 text-orange-700' },
  { to: '/services', label: 'Find Services', icon: Sparkles, accentClass: 'bg-lokals-green-soft text-lokals-green' },
  { to: '/ride', label: 'Request Taxi', icon: CarFront, accentClass: 'bg-amber-50 text-amber-700' },
  { to: '/delivery', label: 'Delivery', icon: Package, accentClass: 'bg-emerald-50 text-emerald-700' },
  { to: '/store', label: 'Marketplace', icon: ShoppingBag, accentClass: 'bg-violet-50 text-violet-700' },
  { to: '/get-involved', label: 'Get Involved', icon: HeartHandshake, accentClass: 'bg-sky-50 text-sky-700' },
]

const communityActions: QuickAction[] = [
  { to: '/alerts', label: 'Town Updates', icon: Bell, accentClass: 'bg-slate-100 text-slate-700' },
  { to: '/events', label: 'Events', icon: Users, accentClass: 'bg-amber-50 text-amber-700' },
  { to: '/get-involved', label: 'Projects', icon: HeartHandshake, accentClass: 'bg-lokals-green-soft text-lokals-green' },
  { to: '/services', label: 'Local Services', icon: Sparkles, accentClass: 'bg-violet-50 text-violet-700' },
]

const trustActions: QuickAction[] = [
  { to: '/directory', label: 'Verified businesses', icon: Building2, accentClass: 'bg-lokals-purple-soft text-lokals-purple' },
  { to: '/dashboard/town-manager', label: 'Town approvals', icon: ShieldAlert, accentClass: 'bg-emerald-50 text-emerald-700' },
  { to: '/community-impact', label: 'Resident rewards', icon: BriefcaseBusiness, accentClass: 'bg-amber-50 text-amber-700' },
  { to: '/support', label: 'Safe reporting', icon: FileWarning, accentClass: 'bg-sky-50 text-sky-700' },
]

export function HomeQuickActions() {
  return (
    <div className="space-y-5">
      <Card variant="dashboard" className="p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Quick actions</p>
            <h2 className="mt-1 text-2xl font-semibold text-lokals-charcoal">Everyday actions in one clean grid</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-lokals-muted">
              The same practical shortcuts people use in the app should be easy to reach on web too.
            </p>
          </div>
          <Link to="/more"><Button variant="secondary">More tools</Button></Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {primaryActions.map((action) => (
            <QuickActionCard key={action.label} to={action.to} label={action.label} icon={action.icon} accentClass={action.accentClass} />
          ))}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card variant="dashboard" className="p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Community</p>
          <h3 className="mt-1 text-xl font-semibold text-lokals-charcoal">Town life and local momentum</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {communityActions.map((action) => (
              <QuickActionCard key={action.label} to={action.to} label={action.label} icon={action.icon} accentClass={action.accentClass} />
            ))}
          </div>
        </Card>

        <Card variant="dashboard" className="p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Trust</p>
          <h3 className="mt-1 text-xl font-semibold text-lokals-charcoal">Built for trusted local participation</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {trustActions.map((action) => (
              <QuickActionCard key={action.label} to={action.to} label={action.label} icon={action.icon} accentClass={action.accentClass} />
            ))}
          </div>
          <div className="mt-5 rounded-[22px] bg-lokals-bg p-4">
            <p className="text-sm text-lokals-muted">
              Verified businesses, Town Manager approvals, resident rewards, and safer reporting help LOKALS feel dependable instead of noisy.
            </p>
          </div>
        </Card>
      </div>

      <Card variant="dashboard" className="p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Join LOKALS</p>
            <h3 className="mt-1 text-xl font-semibold text-lokals-charcoal">Choose the path that fits your role in town</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register"><Button>Join as Resident</Button></Link>
            <Link to="/dashboard/business"><Button variant="secondary">Register Business</Button></Link>
            <Link to="/dashboard/modes"><Button variant="secondary">Apply as Driver/Courier</Button></Link>
            <Link to="/okahandja"><Button variant="secondary">Town Portal</Button></Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
