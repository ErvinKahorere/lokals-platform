import { PhoneCall, ShieldAlert, Siren, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../components/Ui'
import { Card } from '../components/ui/Card'

export function SosPage() {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      setSent(true)
      setCountdown(null)
      return
    }

    const timer = window.setTimeout(() => setCountdown((value) => (value ?? 1) - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-rose-300 bg-[linear-gradient(180deg,#7f1d1d,#dc2626)] p-6 text-white shadow-[0_24px_60px_rgba(127,29,29,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-100">Emergency mode</p>
        <h1 className="mt-3 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight">SOS for urgent help</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-rose-50">Your location will be shared with emergency contacts. SMS and WhatsApp alert integration will be connected later.</p>
      </section>

      {sent ? (
        <Card variant="emergency" className="p-6">
          <h2 className="text-2xl font-semibold text-lokals-charcoal">SOS sent</h2>
          <p className="mt-2 text-sm text-lokals-muted">Your emergency contacts have been notified.</p>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr,0.95fr]">
        <Card variant="emergency" className="border-rose-200 text-center">
          <div className="flex flex-col items-center">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-rose-100">
              <div className="absolute inset-4 animate-pulse rounded-full border-8 border-rose-200" />
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-rose-600 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
                <ShieldAlert className="h-12 w-12" />
              </div>
            </div>
            <h3 className="mt-6 text-3xl font-bold text-lokals-charcoal">Send SOS now</h3>
            <p className="mt-3 max-w-md text-sm text-lokals-muted">Use only for urgent situations. This screen is intentionally stripped back so the next action is unmistakable.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="danger" onClick={() => { setSent(false); setCountdown(3) }}>
                {countdown !== null ? `Sending in ${countdown}` : 'Send SOS'}
              </Button>
              {countdown !== null ? <Button variant="secondary" onClick={() => setCountdown(null)}>Cancel</Button> : null}
            </div>
          </div>
        </Card>

        <Card variant="emergency">
          <h3 className="text-lg font-semibold text-lokals-charcoal">Emergency contacts</h3>
          <div className="mt-4 space-y-3">
            {[
              ['Mom', '+264 81 123 4567'],
              ['Dad', '+264 81 987 6543'],
              ['Sister', '+264 81 456 7890'],
            ].map(([name, phone]) => (
              <div key={phone} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{name}</p>
                    <p className="text-sm text-lokals-muted">{phone}</p>
                  </div>
                </div>
                <a href={`tel:${phone.replace(/\s+/g, '')}`}><Button variant="secondary">Call</Button></a>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="inline-flex items-center gap-2 font-semibold text-rose-700"><TriangleAlert className="h-4 w-4" />Use for real emergencies</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="inline-flex items-center gap-2 font-semibold text-lokals-charcoal"><Siren className="h-4 w-4" />Response workflows ready for Phase 3</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
