import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, PageHeader, Select } from '../components/Ui'
import { api, getApiErrorMessage } from '../lib/api'
import { OKAHANDJA_AREAS, PILOT_LOCATION_MESSAGE, PILOT_TOWN } from '../lib/pilot'
import { useAuthStore } from '../store/auth'

const roleOptions = ['citizen', 'worker', 'seller', 'business_owner', 'service_provider', 'driver', 'organization_representative']

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['citizen'])
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: 'Password123!',
    password_confirmation: 'Password123!',
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
        roles: selectedRoles,
        interests: ['Find services', 'Follow alerts'],
      })
      setSession(data.token, data.user.data ?? data.user)
      navigate('/')
    } catch (error) {
      setError(getApiErrorMessage(error, 'Something went wrong. Try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Create profile" title="Start with your phone. Grow the rest later." description="A short setup keeps LOKALS fast to join and ready for OTP later." />
      <div className="overflow-hidden rounded-[28px] border border-violet-100 bg-white p-8 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
        <img src="/brand/lokals-logo.svg" alt="LOKALS" className="h-10 w-auto" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.28em] text-lokals-purple">Everything in your city</p>
        <h2 className="mt-3 text-3xl font-semibold text-lokals-charcoal">Create your LOKALS profile</h2>
        <p className="mt-3 max-w-2xl text-sm text-lokals-muted">{PILOT_LOCATION_MESSAGE} Choose your area and what you want to use the app for. The experience will personalize around your next action.</p>
      </div>
      <div className="rounded-[24px] border border-lokals-border bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
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
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-semibold text-lokals-charcoal">Choose role(s)</p>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => {
                const active = selectedRoles.includes(role)
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRoles((current) => active ? current.filter((item) => item !== role) : [...current, role])}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-lokals-purple text-white shadow-[0_12px_28px_rgba(124,58,237,0.22)]' : 'border border-lokals-border bg-white text-lokals-charcoal hover:border-lokals-purple/20 hover:bg-violet-50/40'}`}
                  >
                    {role.replace(/_/g, ' ')}
                  </button>
                )
              })}
            </div>
          </div>
          {error ? <p className="text-sm text-lokals-danger md:col-span-2">{error}</p> : null}
          <Button className="md:col-span-2" disabled={loading}>{loading ? 'Creating your profile...' : 'Continue'}</Button>
        </form>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-lokals-muted">
          <span>Already have a profile?</span>
          <Link to="/login" className="font-semibold text-lokals-green">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
