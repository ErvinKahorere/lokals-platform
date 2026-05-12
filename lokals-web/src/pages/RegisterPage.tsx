import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Input, PageHeader, Select, StatusBadge } from '../components/Ui'
import { api, getApiErrorMessage } from '../lib/api'
import { OKAHANDJA_AREAS, PILOT_LOCATION_MESSAGE, PILOT_TOWN } from '../lib/pilot'
import { useAuthStore } from '../store/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    password_confirmation: '',
    default_town: PILOT_TOWN,
    default_area: 'Nau-Aib',
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/register', {
        ...form,
        roles: ['citizen'],
        interests: ['Find services', 'Follow alerts'],
      })
      const user = data.user.data ?? data.user
      setSession(data.token, user)
      navigate('/home')
    } catch (error) {
      setError(getApiErrorMessage(error, 'Something went wrong. Try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Create profile" title="Start with your phone. Grow the rest later." description="A short setup keeps LOKALS fast to join while saving your Okahandja area from day one." />
      <Card variant="dashboard" className="overflow-hidden p-8">
        <img src="/brand/lokals-logo.svg" alt="LOKALS" className="h-10 w-auto" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.28em] text-lokals-purple">Everything in your city</p>
        <h2 className="mt-3 text-3xl font-semibold text-lokals-charcoal">Create your LOKALS profile</h2>
        <p className="mt-3 max-w-2xl text-sm text-lokals-muted">{PILOT_LOCATION_MESSAGE} Your first account opens as a citizen, and you can switch roles later if your work in the city grows.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <StatusBadge value="Citizen first" tone="accent" />
          <StatusBadge value="Area saved" tone="success" />
          <StatusBadge value="Fast setup" tone="neutral" />
        </div>
      </Card>
      <Card className="p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-lokals-charcoal">Full name</label>
            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Enter your name" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-lokals-charcoal">Phone number</label>
            <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="+264..." required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-lokals-charcoal">Password</label>
            <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Create a password" autoComplete="new-password" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-lokals-charcoal">Confirm password</label>
            <Input type="password" value={form.password_confirmation} onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))} placeholder="Repeat your password" autoComplete="new-password" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-lokals-charcoal">Town</label>
            <Input value={form.default_town} readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-lokals-charcoal">Area</label>
            <Select value={form.default_area} onChange={(event) => setForm((current) => ({ ...current, default_area: event.target.value }))}>
              {OKAHANDJA_AREAS.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </Select>
          </div>
          {error ? <p className="text-sm text-lokals-danger md:col-span-2">{error}</p> : null}
          <Button className="md:col-span-2" isLoading={loading} loadingLabel="Creating your profile...">Create Account</Button>
        </form>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-lokals-muted">
          <span>Already have a profile?</span>
          <Link to="/login" className="font-semibold text-lokals-green">Sign in</Link>
        </div>
      </Card>
    </div>
  )
}
