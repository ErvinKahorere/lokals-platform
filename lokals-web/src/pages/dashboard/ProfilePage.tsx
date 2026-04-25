import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Activity, Bell, BriefcaseBusiness, Camera, MapPin, Settings, ShoppingBag, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/ui/Avatar'
import { Button, Input, PageHeader, SectionCard, TextArea } from '../../components/Ui'
import { NotificationBell } from '../../components/experience/NotificationBell'
import { Card } from '../../components/ui/Card'
import { useMe, useUpdateProfile, useUploadProfileAvatar } from '../../hooks/queries'
import { resolveMediaUrl } from '../../lib/display'
import { useTheme } from '../../providers/ThemeProvider'
import { useAuthStore } from '../../store/auth'

export function ProfilePage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const { data } = useMe()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadProfileAvatar()
  const { theme, setTheme } = useTheme()
  const user = useMemo(() => {
    const payload = data?.user
    if (!payload) {
      return undefined
    }

    return 'data' in payload ? payload.data : payload
  }, [data])
  const [preview, setPreview] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    profession: '',
    business_name: '',
    default_town: '',
    default_area: '',
    whatsapp: '',
    secondary_phone: '',
    profile_visibility: 'public',
  })

  useEffect(() => {
    if (!user) {
      return
    }

    setForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      location: user.location ?? '',
      bio: user.bio ?? user.profile?.bio ?? '',
      profession: user.profession ?? user.profile?.profession ?? '',
      business_name: user.business_name ?? user.profile?.business_name ?? '',
      default_town: user.default_town ?? user.profile?.default_town ?? '',
      default_area: user.default_area ?? user.profile?.default_area ?? '',
      whatsapp: user.whatsapp ?? user.profile?.whatsapp ?? '',
      secondary_phone: user.secondary_phone ?? user.profile?.secondary_phone ?? '',
      profile_visibility: user.profile_visibility ?? user.profile?.profile_visibility ?? 'public',
    })
  }, [user])

  const stats = [
    { label: 'Bookings', value: '12' },
    { label: 'Jobs', value: '5' },
    { label: 'Listings', value: '7' },
  ]
  const menu = [
    { to: '/dashboard/bookings', label: 'My Bookings', icon: Bell, description: 'Appointments and status' },
    { to: '/dashboard/jobs', label: 'My Jobs', icon: BriefcaseBusiness, description: 'Hiring and applications' },
    { to: '/dashboard/listings', label: 'My Listings', icon: ShoppingBag, description: 'Marketplace items' },
    { to: '/services', label: 'My Services', icon: Store, description: 'Provider setup and bookings' },
    { to: '/activity', label: 'Activity', icon: Activity, description: 'Updates and notifications' },
    { to: '/settings', label: 'Settings', icon: Settings, description: 'Preferences and support' },
  ]

  const handleAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setPreview(URL.createObjectURL(file))
    await uploadAvatar.mutateAsync(file)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await updateProfile.mutateAsync(form)
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dashboard" title="Profile" description="Your overview, actions, and progress all in one place." />

      <Card variant="dashboard" className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={user?.name ?? 'LOKALS User'} src={(preview || resolveMediaUrl(user?.avatar ?? user?.profile?.avatar_url ?? null)) ?? undefined} className="h-20 w-20 border border-lokals-border" />
              <label className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-lokals-green text-white shadow-brand">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleAvatar} />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-lokals-charcoal">{user?.name ?? 'LOKALS User'}</h2>
              <p className="mt-1 text-sm text-lokals-muted">{user?.phone ?? 'Phone unavailable'}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-lokals-muted"><MapPin className="h-4 w-4" />{user?.location ?? 'Windhoek, Namibia'}</p>
              <p className="mt-1 text-sm text-lokals-muted">{[user?.default_area ?? user?.profile?.default_area, user?.default_town ?? user?.profile?.default_town].filter(Boolean).join(', ')}</p>
              <p className="mt-2 text-sm text-lokals-muted">{user?.profession ?? user?.profile?.profession ?? 'Profession not added yet'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(user?.roles ?? []).map((role) => (
                  <span key={role} className={`rounded-full px-3 py-1 text-xs font-semibold ${role === user?.current_role ? 'bg-lokals-green-soft text-lokals-green' : 'bg-violet-50 text-lokals-purple'}`}>
                    {role.replaceAll('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell count={2} to="/activity" />
            <div className="rounded-[20px] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Profile</p>
              <p className="mt-1 text-lg font-semibold text-lokals-charcoal">{data?.enrichment?.percentage ?? 0}% complete</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} variant="dashboard" className="p-5">
            <p className="text-sm text-lokals-muted">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-lokals-charcoal">{stat.value}</p>
          </Card>
        ))}
      </div>

      <SectionCard className="bg-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-lokals-charcoal">Edit profile</h3>
            <p className="mt-1 text-sm text-lokals-muted">Saved details are reused across bookings, jobs, and selling flows.</p>
          </div>
          <Button variant="secondary" disabled>{uploadAvatar.isPending ? 'Uploading photo...' : 'Preview updates live'}</Button>
        </div>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" required />
          <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Primary phone" required />
          <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" />
          <Input value={form.default_town} onChange={(event) => setForm((current) => ({ ...current, default_town: event.target.value }))} placeholder="Default town" />
          <Input value={form.default_area} onChange={(event) => setForm((current) => ({ ...current, default_area: event.target.value }))} placeholder="Default area" />
          <Input value={form.profession} onChange={(event) => setForm((current) => ({ ...current, profession: event.target.value }))} placeholder="Profession" />
          <Input value={form.business_name} onChange={(event) => setForm((current) => ({ ...current, business_name: event.target.value }))} placeholder="Business name" />
          <Input value={form.whatsapp} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} placeholder="WhatsApp" />
          <Input value={form.secondary_phone} onChange={(event) => setForm((current) => ({ ...current, secondary_phone: event.target.value }))} placeholder="Secondary phone" />
          <Input value={form.profile_visibility} onChange={(event) => setForm((current) => ({ ...current, profile_visibility: event.target.value as 'public' | 'private' }))} placeholder="Profile visibility" />
          <TextArea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} placeholder="Short bio" rows={4} className="md:col-span-2" />
          <Button className="md:col-span-2" disabled={updateProfile.isPending}>{updateProfile.isPending ? 'Saving profile...' : 'Save profile'}</Button>
        </form>
      </SectionCard>

      <SectionCard className="bg-white">
        <h3 className="text-lg font-semibold text-lokals-charcoal">Appearance</h3>
        <p className="mt-1 text-sm text-lokals-muted">Choose light, dark, or follow your system theme.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(['light', 'dark', 'system'] as const).map((option) => (
            <Button key={option} variant={theme === option ? 'primary' : 'secondary'} onClick={() => setTheme(option)}>
              {option[0].toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </SectionCard>

      <Card variant="dashboard" className="p-6">
        <h3 className="text-lg font-semibold text-lokals-charcoal">Menu</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {menu.map(({ to, label, icon: Icon, description }) => (
            <Link key={to} to={to} className="rounded-[20px] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lokals-charcoal">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-lokals-charcoal">{label}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={async () => { await logout(); navigate('/login') }}>Logout</Button>
      </div>
    </div>
  )
}
