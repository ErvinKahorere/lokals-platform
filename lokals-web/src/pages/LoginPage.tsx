import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, MapPin, Phone } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/glass/GlassCard'
import { Button, Input, PageHeader } from '../components/Ui'
import { api } from '../lib/api'
import { demoLogins } from '../data/demo'
import { useAuthStore } from '../store/auth'

export function LoginPage() {
  const [phone, setPhone] = useState(demoLogins[0].phone)
  const [password, setPassword] = useState(demoLogins[0].password)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { phone, password })
      setSession(data.token, data.user.data ?? data.user)
      navigate('/')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader eyebrow="Sign in" title="Phone-first access for city life" description="Keep login short now, and keep the account ready for OTP and profile completion later." />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="overflow-hidden bg-[linear-gradient(135deg,rgba(49,46,129,0.95)_0%,rgba(79,70,229,0.92)_50%,rgba(124,58,237,0.9)_100%)] p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">LOKALS</p>
          <h2 className="mt-3 text-4xl font-semibold">Everything in your city.</h2>
          <p className="mt-4 max-w-xl text-sm text-white/80">Find services, follow public providers, discover products, browse accommodation, report city issues, and keep local life moving from one account.</p>
          <div className="mt-8 grid gap-3">
            {[
              { icon: Phone, title: 'Phone-first sign in', body: 'Fast access with less typing.' },
              { icon: MapPin, title: 'Location-aware home', body: 'Results adapt to Windhoek, your town, and your area.' },
              { icon: ArrowRight, title: 'Tap -> confirm -> act', body: 'Friction stays low across booking, selling, and reporting.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[22px] bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-white/75">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <form className="space-y-4" onSubmit={submit}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" required />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            {error ? <p className="text-sm text-lokals-danger">{error}</p> : null}
            <Button className="w-full" disabled={loading}>{loading ? 'Signing you in...' : 'Continue'}</Button>
            <button type="button" onClick={() => navigate('/')} className="w-full rounded-lokals-xl border border-lokals-border bg-lokals-surface px-4 py-3 text-sm font-semibold text-lokals-charcoal">
              Browse as guest
            </button>
          </form>
          <div className="mt-5 flex items-center justify-between gap-3 text-sm text-lokals-muted">
            <span>New here?</span>
            <Link to="/register" className="font-semibold text-lokals-purple">Create profile</Link>
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Demo accounts</p>
            {demoLogins.map((demo) => (
              <button key={demo.label} className="w-full rounded-[20px] border border-lokals-border bg-lokals-surface/80 px-4 py-3 text-left backdrop-blur-xl" onClick={() => { setPhone(demo.phone); setPassword(demo.password) }}>
                <p className="font-semibold text-lokals-charcoal">{demo.label}</p>
                <p className="mt-1 text-sm text-lokals-muted">{demo.phone}</p>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
