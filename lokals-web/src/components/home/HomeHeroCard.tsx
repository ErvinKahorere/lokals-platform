import { Compass, Smartphone, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function HomeHeroCard() {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_360px]">
      <Card variant="dashboard" className="overflow-hidden p-6 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-lokals-green-soft px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">
              <Sparkles className="h-3.5 w-3.5" />
              Everything Okahandja, in one place
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-lokals-charcoal md:text-3xl">Everything Okahandja, in one place</h2>
            <p className="mt-3 text-sm leading-6 text-lokals-muted">
              Built for residents who need trusted local services, town updates, practical requests, and everyday essentials without leaving one simple dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/services"><Button>Find Services</Button></Link>
            <Link to="/directory"><Button variant="secondary"><Compass className="h-4 w-4" />Explore Directory</Button></Link>
          </div>
        </div>
      </Card>

      <Card variant="dashboard" className="relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,rgba(63,43,203,0.18),rgba(22,163,74,0.08))]" />
        <div className="relative flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">App preview</p>
              <h3 className="mt-1 text-lg font-semibold text-lokals-charcoal">Mobile-first by design</h3>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple">
              <Smartphone className="h-5 w-5" />
            </span>
          </div>
          <div className="rounded-[26px] border border-white/70 bg-white/95 p-4 shadow-soft">
            <div className="space-y-3">
              <div className="h-10 rounded-2xl bg-slate-100" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-2xl bg-lokals-purple-soft" />
                <div className="h-20 rounded-2xl bg-lokals-green-soft" />
                <div className="h-20 rounded-2xl bg-amber-50" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-2/3 rounded-full bg-slate-200" />
                <div className="h-3 w-full rounded-full bg-slate-100" />
                <div className="h-3 w-4/5 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
          <div className="rounded-[22px] bg-lokals-bg p-4">
            <p className="text-sm font-semibold text-lokals-charcoal">Fast actions, trusted providers, and town updates stay one tap away.</p>
          </div>
        </div>
      </Card>
    </section>
  )
}
