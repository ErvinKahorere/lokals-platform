import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Bell, Building2, MapPin, Palette, Shield, UserRoundCog } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppearanceSettings } from '../components/account/AppearanceSettings'
import { LocationSettings } from '../components/account/LocationSettings'
import { NotificationPreferences } from '../components/account/NotificationPreferences'
import { RoleSwitcher } from '../components/account/RoleSwitcher'
import { roleLabel } from '../components/account/accountUtils'
import { Button, PageHeader, SectionCard } from '../components/Ui'
import { useMe, useMyBusinesses, usePreferences, useSwitchRole, useUpdatePreferences, useUpdateProfile } from '../hooks/queries'
import { normalizePilotArea, PILOT_LOCATION_MESSAGE, PILOT_TOWN } from '../lib/pilot'

type AppearanceMode = 'light' | 'system' | 'dark'

const appearanceStorageKey = 'lokals-appearance'

export function SettingsPage() {
  const meQuery = useMe()
  const preferencesQuery = usePreferences()
  const businessesQuery = useMyBusinesses()
  const updatePreferences = useUpdatePreferences()
  const updateProfile = useUpdateProfile()
  const switchRole = useSwitchRole()
  const user = useMemo(() => {
    const payload = meQuery.data?.user
    if (!payload) return undefined
    return 'data' in payload ? payload.data : payload
  }, [meQuery.data])
  const [town, setTown] = useState(PILOT_TOWN)
  const [area, setArea] = useState('')
  const [radius, setRadius] = useState('10')
  const [appearance, setAppearance] = useState<AppearanceMode>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const stored = window.localStorage.getItem(appearanceStorageKey)
    return stored === 'dark' || stored === 'system' ? stored : 'light'
  })
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    alerts_from_followed_entities: true,
    booking_updates: true,
    job_updates: true,
    news_updates: true,
    promotions: true,
    city_alerts: true,
  })

  useEffect(() => {
    if (!user) return
    setTown(PILOT_TOWN)
    setArea(normalizePilotArea(user.default_area ?? preferencesQuery.data?.default_area))
    setRadius(String(user.service_radius ?? preferencesQuery.data?.service_radius ?? 10))
    setNotifications({
      alerts_from_followed_entities: preferencesQuery.data?.notification_preferences?.alerts_from_followed_entities ?? true,
      booking_updates: preferencesQuery.data?.notification_preferences?.booking_updates ?? true,
      job_updates: preferencesQuery.data?.notification_preferences?.job_updates ?? true,
      news_updates: preferencesQuery.data?.notification_preferences?.news_updates ?? true,
      promotions: preferencesQuery.data?.notification_preferences?.promotions ?? preferencesQuery.data?.notification_preferences?.sale_alerts ?? true,
      city_alerts: preferencesQuery.data?.notification_preferences?.city_alerts ?? true,
    })
  }, [preferencesQuery.data, user])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(appearanceStorageKey, appearance)
  }, [appearance])

  const saveLocation = async (event?: FormEvent) => {
    event?.preventDefault()
    await Promise.all([
      updateProfile.mutateAsync({ default_town: town, default_area: area, service_radius: Number(radius) }),
      updatePreferences.mutateAsync({ default_town: town, default_area: area, service_radius: Number(radius), notification_preferences: notifications }),
    ])
  }

  const saveNotifications = async () => {
    await updatePreferences.mutateAsync({
      default_town: town,
      default_area: area,
      service_radius: Number(radius),
      notification_preferences: notifications,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Settings" description="Manage your account, location, alerts, roles, privacy, and ownership preferences." />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><UserRoundCog className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Account</h2>
              <p className="text-sm text-lokals-muted">{user?.phone ?? 'Phone unavailable'}{user?.email ? ` - ${user.email}` : ''}</p>
            </div>
          </div>
          <div className="mt-4 rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
            <p className="text-sm font-semibold text-lokals-charcoal">{user?.name ?? 'LOKALS user'}</p>
            <p className="mt-1 text-sm text-lokals-muted">{[user?.default_area, user?.default_town].filter(Boolean).join(', ') || user?.location || `${PILOT_TOWN}, Namibia`}</p>
            <div className="mt-3">
              <Link to="/dashboard/profile/edit">
                <Button variant="secondary">Edit profile</Button>
              </Link>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><MapPin className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Location</h2>
              <p className="text-sm text-lokals-muted">{PILOT_LOCATION_MESSAGE}</p>
            </div>
          </div>
          <div className="mt-4">
            <LocationSettings
              town={town}
              area={area}
              radius={radius}
              onAreaChange={setArea}
              onRadiusChange={setRadius}
              onSubmit={() => void saveLocation()}
              isSaving={updatePreferences.isPending || updateProfile.isPending}
            />
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><Bell className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Notifications</h2>
              <p className="text-sm text-lokals-muted">Choose the updates that matter most to you.</p>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <NotificationPreferences values={notifications} onToggle={(key, checked) => setNotifications((current) => ({ ...current, [key]: checked }))} />
            <div className="flex justify-end">
              <Button onClick={() => void saveNotifications()} disabled={updatePreferences.isPending}>{updatePreferences.isPending ? 'Saving...' : 'Save notifications'}</Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-gold/25 text-lokals-charcoal"><Palette className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Appearance</h2>
              <p className="text-sm text-lokals-muted">Save how you want LOKALS to behave on this device.</p>
            </div>
          </div>
          <div className="mt-4">
            <AppearanceSettings value={appearance} onChange={setAppearance} />
          </div>
        </SectionCard>

        <SectionCard className="bg-white lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><UserRoundCog className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Roles</h2>
              <p className="text-sm text-lokals-muted">Current role: {roleLabel(user?.current_role ?? user?.roles?.[0])}</p>
            </div>
          </div>
          <div className="mt-4">
            <RoleSwitcher
              roles={user?.roles ?? []}
              currentRole={user?.current_role}
              isSwitching={switchRole.isPending}
              onSwitch={(role) => void switchRole.mutateAsync(role)}
            />
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><Building2 className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Business shortcuts</h2>
              <p className="text-sm text-lokals-muted">{businessesQuery.data?.data?.length ?? 0} business profile(s)</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {(businessesQuery.data?.data ?? []).slice(0, 3).map((business) => (
              <div key={business.id} className="rounded-[18px] border border-lokals-border px-4 py-3">
                <p className="font-semibold text-lokals-charcoal">{business.name}</p>
                <p className="text-sm text-lokals-muted">{business.category} - {business.area ?? business.town ?? business.location ?? 'Windhoek'}</p>
              </div>
            ))}
            {!businessesQuery.data?.data?.length ? <p className="text-sm text-lokals-muted">Business, service, and organization shortcuts will appear here once you create or link those profiles.</p> : null}
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-lokals-danger"><Shield className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Privacy and support</h2>
              <p className="text-sm text-lokals-muted">Keep control over what others can see.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-lokals-muted">
            <p>Profile visibility: <span className="font-semibold text-lokals-charcoal">{user?.profile_visibility ?? 'public'}</span></p>
            <p>Blocked users and support flows stay intentionally lightweight for now, but the links in Profile now land on real placeholder destinations instead of breaking.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
