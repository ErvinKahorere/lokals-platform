import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, LockKeyhole, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Input, PageHeader } from '../components/Ui'
import { api, getApiErrorMessage } from '../lib/api'
import { demoLogins } from '../data/demo'
import { getRoleHomePath } from '../lib/roles'
import { useAuthStore } from '../store/auth'

export function LoginPage() {
  const [phone, setPhone] = useState(demoLogins[0].phone)
  const [password, setPassword] = useState(demoLogins[0].password)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const nextPath = typeof (location.state as { from?: string } | null)?.from === 'string' ? (location.state as { from?: string }).from! : null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { phone, password })
      const user = data.user.data ?? data.user
      setSession(data.token, user)
      navigate(nextPath ?? getRoleHomePath(user))
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Unable to sign in right now. Try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader eyebrow="Sign in" title="Phone-first access for city life" description="Keep login short now, and keep the account ready for OTP and profile completion later." />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[28px] border border-violet-100 bg-white p-8 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <img src="/brand/lokals-logo.svg" alt="LOKALS" className="h-10 w-auto" />
          <p className="mt-5 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">Local life in one place</p>
          <h2 className="mt-4 text-4xl font-semibold text-lokals-charcoal">Everything in your city.</h2>
          <p className="mt-4 max-w-xl text-sm text-lokals-muted">Find services, follow public providers, discover products, browse accommodation, report city issues, and keep local life moving from one account.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-4 w-4" />Trusted local access</div>
            <div className="inline-flex items-center gap-2 rounded-full bg-lokals-gold-soft px-3 py-2 text-xs font-semibold text-lokals-charcoal"><LockKeyhole className="h-4 w-4" />Fast sign-in</div>
          </div>
          <div className="mt-8 grid gap-3">
            {[
              { icon: Phone, title: 'Phone-first sign in', body: 'Fast access with less typing.' },
              { icon: MapPin, title: 'Location-aware home', body: 'Results adapt to Okahandja, your town, and your area.' },
              { icon: ArrowRight, title: 'Tap -> confirm -> act', body: 'Friction stays low across booking, selling, and reporting.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[22px] border border-slate-100 bg-slate-50/90 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{title}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-lokals-border bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-lokals-charcoal">Phone number</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+264..." autoComplete="tel" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-lokals-charcoal">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
            </div>
            {error ? <p className="text-sm text-lokals-danger">{error}</p> : null}
            <Button className="w-full" disabled={loading}>{loading ? 'Signing you in...' : 'Continue'}</Button>
            <button type="button" onClick={() => navigate('/')} className="w-full rounded-lokals-xl border border-lokals-border bg-lokals-surface px-4 py-3 text-sm font-semibold text-lokals-charcoal">
              Browse as guest
            </button>
          </form>
          <div className="mt-5 flex items-center justify-between gap-3 text-sm text-lokals-muted">
            <span>New here?</span>
            <Link to="/register" className="font-semibold text-lokals-green">Create profile</Link>
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Demo accounts</p>
            {demoLogins.map((demo) => (
              <button key={demo.label} className="w-full rounded-[20px] border border-lokals-border bg-lokals-surface px-4 py-3 text-left transition hover:border-lokals-purple/20 hover:bg-violet-50/40" onClick={() => { setPhone(demo.phone); setPassword(demo.password) }}>
                <p className="font-semibold text-lokals-charcoal">{demo.label}</p>
                <p className="mt-1 text-sm text-lokals-muted">{demo.phone}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
