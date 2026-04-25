import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Bell, BriefcaseBusiness, Building2, MapPin, MoonStar, Shield } from 'lucide-react'
import { Button, Input, PageHeader, SectionCard } from '../components/Ui'
import { useMe, usePreferences, useUpdatePreferences, useUpdateProfile, useMyBusinesses } from '../hooks/queries'
import { useTheme } from '../providers/ThemeProvider'

export function SettingsPage() {
  const meQuery = useMe()
  const preferencesQuery = usePreferences()
  const businessesQuery = useMyBusinesses()
  const updatePreferences = useUpdatePreferences()
  const updateProfile = useUpdateProfile()
  const { theme, setTheme } = useTheme()
  const user = useMemo(() => {
    const payload = meQuery.data?.user
    if (!payload) return undefined
    return 'data' in payload ? payload.data : payload
  }, [meQuery.data])
  const [town, setTown] = useState('Windhoek')
  const [area, setArea] = useState('Katutura')
  const [radius, setRadius] = useState('10')
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    alerts_from_followed_entities: true,
    booking_updates: true,
    job_updates: true,
    sale_alerts: true,
    city_alerts: true,
  })

  useEffect(() => {
    if (!user) return
    setTown(user.default_town ?? preferencesQuery.data?.default_town ?? 'Windhoek')
    setArea(user.default_area ?? preferencesQuery.data?.default_area ?? 'Katutura')
    setRadius(String(user.service_radius ?? 10))
    setNotifications({
      alerts_from_followed_entities: preferencesQuery.data?.notification_preferences?.alerts_from_followed_entities ?? true,
      booking_updates: preferencesQuery.data?.notification_preferences?.booking_updates ?? true,
      job_updates: preferencesQuery.data?.notification_preferences?.job_updates ?? true,
      sale_alerts: preferencesQuery.data?.notification_preferences?.sale_alerts ?? true,
      city_alerts: preferencesQuery.data?.notification_preferences?.city_alerts ?? true,
    })
  }, [preferencesQuery.data, user])

  const saveLocation = async (event: FormEvent) => {
    event.preventDefault()
    await Promise.all([
      updateProfile.mutateAsync({ default_town: town, default_area: area, service_radius: Number(radius) }),
      updatePreferences.mutateAsync({ default_town: town, default_area: area, service_radius: Number(radius), notification_preferences: notifications }),
    ])
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Location, roles, theme, and business tools" description="Keep your city results personal, your notifications useful, and your business tools easy to reach." />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><MapPin className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Location</h2>
              <p className="text-sm text-lokals-muted">Set your default town, area, and service radius.</p>
            </div>
          </div>
          <form className="mt-4 space-y-3" onSubmit={saveLocation}>
            <Input value={town} onChange={(event) => setTown(event.target.value)} placeholder="Town" />
            <Input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Area" />
            <Input value={radius} onChange={(event) => setRadius(event.target.value)} placeholder="Service radius (km)" />
            <Button disabled={updatePreferences.isPending || updateProfile.isPending}>{updatePreferences.isPending || updateProfile.isPending ? 'Saving location...' : 'Save location settings'}</Button>
          </form>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-gold/20 text-lokals-charcoal"><MoonStar className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Theme</h2>
              <p className="text-sm text-lokals-muted">Choose light, dark, or follow your device.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['light', 'dark', 'system'] as const).map((option) => (
              <Button key={option} variant={theme === option ? 'primary' : 'secondary'} onClick={() => setTheme(option)}>
                {option[0].toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="bg-white lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><Bell className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Notifications</h2>
              <p className="text-sm text-lokals-muted">Only keep the city updates you care about.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['alerts_from_followed_entities', 'Alerts from followed entities'],
              ['booking_updates', 'Booking updates'],
              ['job_updates', 'Job updates'],
              ['sale_alerts', 'Sale alerts'],
              ['city_alerts', 'City alerts'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-[20px] border border-lokals-border px-4 py-3 text-sm font-medium text-lokals-charcoal">
                <span>{label}</span>
                <input type="checkbox" checked={Boolean(notifications[key])} onChange={(event) => setNotifications((current) => ({ ...current, [key]: event.target.checked }))} />
              </label>
            ))}
          </div>
          <div className="mt-4">
            <Button onClick={() => updatePreferences.mutateAsync({ default_town: town, default_area: area, service_radius: Number(radius), notification_preferences: notifications })} disabled={updatePreferences.isPending}>
              {updatePreferences.isPending ? 'Saving notifications...' : 'Save notification settings'}
            </Button>
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><BriefcaseBusiness className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Roles</h2>
              <p className="text-sm text-lokals-muted">{(user?.roles ?? []).map((role) => role.replace(/_/g, ' ')).join(', ') || 'Citizen'}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><Building2 className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Manage My Business</h2>
              <p className="text-sm text-lokals-muted">{businessesQuery.data?.data?.length ?? 0} business profile(s)</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(businessesQuery.data?.data ?? []).slice(0, 3).map((business) => (
              <div key={business.id} className="rounded-[18px] border border-lokals-border px-4 py-3">
                <p className="font-semibold text-lokals-charcoal">{business.name}</p>
                <p className="text-sm text-lokals-muted">{business.category} • {business.area ?? business.town ?? business.location ?? 'Windhoek'}</p>
              </div>
            ))}
            {!(businessesQuery.data?.data?.length) ? <p className="text-sm text-lokals-muted">Business tools will appear here when you create a business profile.</p> : null}
          </div>
        </SectionCard>

        <SectionCard className="bg-white lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-lokals-danger"><Shield className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Privacy</h2>
              <p className="text-sm text-lokals-muted">Profile visibility and support tools stay simple here.</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-lokals-muted">Current profile visibility: <span className="font-semibold text-lokals-charcoal">{user?.profile_visibility ?? 'public'}</span></p>
        </SectionCard>
      </div>
    </div>
  )
}
