import { Compass, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export function HomeHeroCard() {
  return (
    <section className="rounded-[28px] border border-lokals-border bg-white p-6 shadow-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-lokals-green-soft px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">
            <Search className="h-3.5 w-3.5" />
            Need help nearby?
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-lokals-charcoal md:text-3xl">Find trusted services, public offices, shops and events around you.</h2>
          <p className="mt-3 text-sm leading-6 text-lokals-muted">Start with the fastest action, then branch into updates, work, shopping, and local opportunities around your area.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/services"><Button>Find Service</Button></Link>
          <Link to="/directory"><Button variant="secondary"><Compass className="h-4 w-4" />Explore Directory</Button></Link>
        </div>
      </div>
    </section>
  )
}
