import { PhoneCall, ShieldAlert, Siren, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, QueryState, SectionCard, Select, StatusBadge } from '../components/Ui'
import { RequestSuccessState } from '../components/transport/RequestSuccessState'
import { useCreateSos, useSosFeed } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { useAuthStore } from '../store/auth'

const emergencyTypes = ['Personal safety', 'Medical', 'Roadside', 'Fire', 'Public disturbance']
const emergencyMessages = [
  'Need urgent help near my location',
  'Medical emergency',
  'Unsafe situation, need help now',
  'Roadside emergency',
]
const emergencyLocations = ['Windhoek CBD', 'Khomasdal', 'Katutura', 'Klein Windhoek', 'Hosea Kutako International Airport']

export function SosPage() {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState(emergencyMessages[0])
  const [location, setLocation] = useState(emergencyLocations[0])
  const [emergencyType, setEmergencyType] = useState(emergencyTypes[0])
  const [error, setError] = useState('')
  const createSos = useCreateSos()
  const token = useAuthStore((state) => state.token)
  const sosFeedQuery = useSosFeed(Boolean(token))

  const [area, town] = useMemo(() => {
    const parts = location.split(',').map((part) => part.trim()).filter(Boolean)
    if (parts.length > 1) return [parts[0], parts[1]]
    return [location, 'Windhoek']
  }, [location])

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      void (async () => {
        try {
          await createSos.mutateAsync({
            message,
            location,
            emergency_type: emergencyType,
            town,
            area,
          })
          setSent(true)
          setError('')
        } catch (caught) {
          setError(getApiErrorMessage(caught, 'Unable to send SOS right now.'))
        } finally {
          setCountdown(null)
        }
      })()
      return
    }

    const timer = window.setTimeout(() => setCountdown((value) => (value ?? 1) - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [area, countdown, createSos, emergencyType, location, message, town])

  if (!token) {
    return <EmptyState title="Login to use SOS" body="SOS events should be tied to your account so emergency history and contact context stay accurate." action={<Link to="/login"><Button>Login</Button></Link>} />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-rose-200 bg-[linear-gradient(180deg,#ff5c5c,#ef4444)] p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Emergency mode</p>
        <h1 className="mt-3 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-white">SOS for urgent help</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">Use only for real emergencies. Keep it short, confirm the area, and send the alert quickly.</p>
      </section>

      {sent ? (
        <RequestSuccessState
          title="SOS sent"
          body="Your emergency alert was recorded. Keep your phone close while responders or emergency contacts follow up."
          meta={
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Emergency type</p>
                <p className="mt-1 font-semibold text-lokals-charcoal">{emergencyType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Location</p>
                <p className="mt-1 font-semibold text-lokals-charcoal">{location}</p>
              </div>
            </div>
          }
          primaryLabel="View alert history"
          onPrimary={() => window.location.assign('/alerts')}
          secondaryLabel="Back home"
          onSecondary={() => window.location.assign('/')}
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr,0.95fr]">
        <SectionCard className="border-rose-200 bg-white text-center">
          <div className="flex flex-col items-center">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-rose-100">
              <div className="absolute inset-4 animate-pulse rounded-full border-8 border-rose-200" />
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-rose-600 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
                <ShieldAlert className="h-12 w-12" />
              </div>
            </div>
            <h3 className="mt-6 text-3xl font-bold text-lokals-charcoal">Tap to send SOS</h3>
            <p className="mt-3 max-w-md text-sm text-lokals-muted">Your location, emergency type, and recent account context will help this alert stay actionable.</p>
            <div className="mt-5 grid w-full max-w-md gap-3 text-left">
              <label className="space-y-2">
                <span className="text-sm font-medium text-lokals-charcoal">Emergency type</span>
                <Select value={emergencyType} onChange={(event) => setEmergencyType(event.target.value)}>
                  {emergencyTypes.map((option) => <option key={option} value={option}>{option}</option>)}
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-lokals-charcoal">Emergency reason</span>
                <Select value={message} onChange={(event) => setMessage(event.target.value)}>
                  {emergencyMessages.map((option) => <option key={option} value={option}>{option}</option>)}
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-lokals-charcoal">Location</span>
                <Select value={location} onChange={(event) => setLocation(event.target.value)}>
                  {emergencyLocations.map((option) => <option key={option} value={option}>{option}</option>)}
                </Select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <StatusBadge value={area} tone="danger" />
              <StatusBadge value={town} tone="danger" />
            </div>
            {error ? <p className="mt-4 text-sm font-medium text-lokals-danger">{error}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="danger" disabled={createSos.isPending} onClick={() => { setSent(false); setCountdown(3) }}>
                {countdown !== null ? `Sending in ${countdown}` : createSos.isPending ? 'Sending SOS...' : 'Send SOS'}
              </Button>
              {countdown !== null ? <Button variant="secondary" onClick={() => setCountdown(null)}>Cancel</Button> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard className="border-rose-200 bg-white">
          <h3 className="text-lg font-semibold text-lokals-charcoal">Emergency contacts</h3>
          <div className="mt-4 space-y-3">
            {[
              ['Mom', '+264 81 123 4567'],
              ['Dad', '+264 81 987 6543'],
              ['Sister', '+264 81 456 7890'],
            ].map(([name, phone]) => (
              <div key={phone} className="flex items-center justify-between gap-3 rounded-2xl border border-lokals-border bg-white p-4">
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
              <p className="inline-flex items-center gap-2 font-semibold text-rose-700"><TriangleAlert className="h-4 w-4" />Use only for real emergencies</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="inline-flex items-center gap-2 font-semibold text-lokals-charcoal"><Siren className="h-4 w-4" />Recent alerts stay visible in your history</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard className="border-rose-200 bg-white">
        <h3 className="text-lg font-semibold text-lokals-charcoal">Recent SOS alerts</h3>
        <QueryState isLoading={sosFeedQuery.isLoading} error={sosFeedQuery.error} empty={(sosFeedQuery.data?.data ?? []).length === 0}>
          <div className="mt-4 space-y-3">
            {(sosFeedQuery.data?.data ?? []).slice(0, 5).map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-lokals-border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{alert.message}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{alert.location ?? 'Location unknown'}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge value={alert.emergency_type ?? 'Emergency'} tone="danger" />
                    <StatusBadge value={alert.status ?? 'sent'} tone="danger" className="mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </QueryState>
      </SectionCard>
    </div>
  )
}
