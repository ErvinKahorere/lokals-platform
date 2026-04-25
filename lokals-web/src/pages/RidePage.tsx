import { CarFront, Clock3, MapPin } from 'lucide-react'
import { PageHeader, SectionCard, StatusBadge } from '../components/Ui'

const rideOptions = [
  { name: 'Standard', eta: '3 min', fare: 'N$ 25 - 35' },
  { name: 'Comfort', eta: '5 min', fare: 'N$ 35 - 50' },
  { name: 'XL', eta: '7 min', fare: 'N$ 55 - 75' },
]

export function RidePage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-lokals-border bg-white p-5 shadow-card">
        <PageHeader
          eyebrow="Ride"
          title="Book a city ride with quick pickup and clear fare options"
          description="A simple ride request experience with pickup, destination, fast options, and future-ready dispatch structure."
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <SectionCard>
          <h3 className="text-lg font-semibold text-lokals-charcoal">Trip details</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lokals-muted">Pickup</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-lokals-charcoal"><MapPin className="h-4 w-4 text-lokals-green" />Current location</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lokals-muted">Destination</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-lokals-charcoal"><MapPin className="h-4 w-4 text-lokals-danger" />Enter destination</p>
            </div>
            <div className="rounded-[24px] border border-dashed border-lokals-border bg-[linear-gradient(180deg,#e0f2fe,#f8fafc)] p-12 text-center text-sm text-lokals-muted">
              Map preview placeholder
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <h3 className="text-lg font-semibold text-lokals-charcoal">Ride options</h3>
          <div className="mt-4 space-y-3">
            {rideOptions.map((option) => (
              <article key={option.name} className="rounded-2xl bg-white p-4 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <CarFront className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lokals-charcoal">{option.name}</h4>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-lokals-muted"><Clock3 className="h-4 w-4" />{option.eta}</p>
                    </div>
                  </div>
                  <StatusBadge value={option.fare} tone="accent" />
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
