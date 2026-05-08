import { CalendarPlus } from 'lucide-react'

export function AddToCalendarButton({ icsUrl }: { icsUrl?: string | null }) {
  if (!icsUrl) return null

  return (
    <a
      href={icsUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[18px] border border-lokals-border px-4 py-2 text-sm font-semibold text-lokals-charcoal transition hover:-translate-y-0.5"
    >
      <CalendarPlus className="h-4 w-4" />
      Add to calendar
    </a>
  )
}
