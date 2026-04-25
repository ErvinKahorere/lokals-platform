import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/glass/GlassCard'
import { Button, Input, PageHeader } from '../components/Ui'
import { api } from '../lib/api'
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
    password: 'password',
    password_confirmation: 'password',
    default_town: 'Windhoek',
    default_area: 'Katutura',
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
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Create profile" title="Start with your phone. Grow the rest later." description="A short setup keeps LOKALS fast to join and ready for OTP later." />
      <GlassCard className="overflow-hidden bg-[linear-gradient(135deg,rgba(49,46,129,0.95)_0%,rgba(79,70,229,0.92)_50%,rgba(124,58,237,0.9)_100%)] p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">Everything in your city</p>
        <h2 className="mt-3 text-3xl font-semibold">Create your LOKALS profile</h2>
        <p className="mt-3 max-w-2xl text-sm text-white/80">Choose where you are and what you want to use the app for. The experience will personalize around your town, your roles, and your next action.</p>
      </GlassCard>
      <GlassCard className="p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" required />
          <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" required />
          <Input value={form.default_town} onChange={(event) => setForm((current) => ({ ...current, default_town: event.target.value }))} placeholder="Town" />
          <Input value={form.default_area} onChange={(event) => setForm((current) => ({ ...current, default_area: event.target.value }))} placeholder="Area" />
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
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-lokals-purple text-white shadow-brand' : 'border border-lokals-border text-lokals-charcoal'}`}
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
          <Link to="/login" className="font-semibold text-lokals-purple">Sign in</Link>
        </div>
      </GlassCard>
    </div>
  )
}
