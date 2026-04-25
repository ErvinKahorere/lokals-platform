import { Card } from './Card'

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lokals-muted">{label}</p>
      <p className="mt-3 text-3xl font-bold text-lokals-charcoal">{value}</p>
      {hint ? <p className="mt-2 text-sm text-lokals-muted">{hint}</p> : null}
    </Card>
  )
}
