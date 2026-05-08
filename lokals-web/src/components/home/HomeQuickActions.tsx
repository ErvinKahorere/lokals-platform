import { BriefcaseBusiness, CarTaxiFront, Package, ShieldAlert, ShoppingBag, Sparkles } from 'lucide-react'
import { ActionTile } from '../ui/ActionTile'

const actions = [
  { to: '/services', label: 'Services', icon: Sparkles, color: 'bg-lokals-green-soft text-lokals-green' },
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness, color: 'bg-violet-50 text-violet-700' },
  { to: '/store', label: 'Store', icon: ShoppingBag, color: 'bg-amber-50 text-amber-700' },
  { to: '/delivery', label: 'Delivery', icon: Package, color: 'bg-emerald-50 text-emerald-700' },
  { to: '/ride', label: 'Taxi', icon: CarTaxiFront, color: 'bg-sky-50 text-sky-700' },
  { to: '/sos', label: 'SOS', icon: ShieldAlert, color: 'bg-red-50 text-red-600' },
]

export function HomeQuickActions() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Quick actions</p>
        <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Take action in seconds</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((item) => (
          <ActionTile key={item.label} to={item.to} label={item.label} subtitle="Open fast" icon={item.icon} className={item.color} />
        ))}
      </div>
    </section>
  )
}
