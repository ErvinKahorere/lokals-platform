import type { ReactNode } from 'react'
import { Clock3, MapPin } from 'lucide-react'
import { Tabs } from '../Ui'
import { LocationPreviewMap } from '../maps/LocationPreviewMap'
import { formatCoordinates, type LocationPoint } from '../../lib/location'

export function TransportTabs({
  items,
  value,
  onChange,
}: {
  items: Array<{ label: string; value: string }>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="overflow-x-auto pb-1">
      <Tabs items={items} value={value} onChange={onChange} />
    </div>
  )
}

export function TransportMapHero({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  meta,
}: {
  eyebrow: string
  title: string
  description: string
  primary?: LocationPoint | null
  secondary?: LocationPoint | null
  primaryLabel: string
  secondaryLabel?: string
  meta?: ReactNode
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-lokals-purple/10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_34%),linear-gradient(180deg,#ffffff,#f8faff)] p-4 shadow-card md:p-5">
      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(22,163,74,0.08),transparent)]" />
      <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="min-w-0 overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-soft">
          <LocationPreviewMap
            primary={primary}
            secondary={secondary}
            primaryLabel={primaryLabel}
            secondaryLabel={secondaryLabel}
          />
        </div>
        <div className="relative flex flex-col justify-between gap-4 rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-soft">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lokals-purple">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-lokals-charcoal">{title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-lokals-muted">{description}</p>
          </div>
          <div className="space-y-3">
            <TransportRouteMarker tone="pickup" label="Pickup" value={primaryLabel} coordinates={formatCoordinates(primary ?? null)} />
            {secondaryLabel ? <TransportRouteMarker tone="dropoff" label="Drop-off" value={secondaryLabel} coordinates={formatCoordinates(secondary ?? null)} /> : null}
          </div>
          {meta ? <div className="rounded-[22px] bg-slate-50 p-4">{meta}</div> : null}
        </div>
      </div>
    </div>
  )
}

export function TransportSummaryCard({
  title,
  items,
  cta,
  sticky = false,
}: {
  title: string
  items: Array<{ label: string; value: ReactNode; accent?: boolean }>
  cta?: ReactNode
  sticky?: boolean
}) {
  return (
    <div className={`rounded-[28px] border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#f9faff)] p-5 shadow-card ${sticky ? 'lg:sticky lg:top-24' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className={`flex items-center justify-between gap-3 rounded-[20px] px-4 py-3 ${item.accent ? 'bg-lokals-purple text-white' : 'bg-slate-50 text-lokals-charcoal'}`}>
            <span className={`text-sm ${item.accent ? 'text-white/80' : 'text-lokals-muted'}`}>{item.label}</span>
            <span className="text-sm font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
      {cta ? <div className="mt-5">{cta}</div> : null}
    </div>
  )
}

export function TransportPanel({
  title,
  description,
  children,
  aside,
}: {
  title: string
  description: string
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className="rounded-[28px] border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-lokals-charcoal">{title}</h3>
          <p className="mt-1 text-sm text-lokals-muted">{description}</p>
        </div>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  )
}

export function TransportRouteMarker({
  tone,
  label,
  value,
  coordinates,
}: {
  tone: 'pickup' | 'dropoff'
  label: string
  value: string
  coordinates: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-4 py-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone === 'pickup' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
        <MapPin className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{label}</p>
        <p className="truncate font-semibold text-lokals-charcoal">{value}</p>
        <p className="text-sm text-lokals-muted">{coordinates}</p>
      </div>
    </div>
  )
}

export function TransportMiniMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[18px] bg-white px-4 py-3 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{label}</p>
      <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-lokals-charcoal">
        <Clock3 className="h-4 w-4 text-lokals-purple" />
        {value}
      </p>
    </div>
  )
}
