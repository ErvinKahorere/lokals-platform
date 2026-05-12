import { useMemo } from 'react'
import {
  Activity,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  HeartHandshake,
  Home,
  LogOut,
  Package,
  ReceiptText,
  Settings,
  ShoppingBag,
  Ticket,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { RoleSwitcher } from '../../components/account/RoleSwitcher'
import { Avatar } from '../../components/ui/Avatar'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusPill } from '../../components/Ui'
import { ProfileMenuItem } from '../../components/account/ProfileMenuItem'
import { roleLabel } from '../../components/account/accountUtils'
import { useMe, useSwitchRole } from '../../hooks/queries'
import { resolveMediaUrl } from '../../lib/display'
import { PILOT_TOWN } from '../../lib/pilot'
import { getRoleHomePath } from '../../lib/roles'
import { useAuthStore } from '../../store/auth'

export function ProfilePage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const switchRole = useSwitchRole()
  const { data, isLoading, error } = useMe()
  const user = useMemo(() => {
    const payload = data?.user
    if (!payload) {
      return undefined
    }

    return 'data' in payload ? payload.data : payload
  }, [data])
  const stats = data?.stats ?? {}
  const currentRole = user?.current_role ?? user?.roles?.[0] ?? 'citizen'

  const menu = [
    { to: '/dashboard/bookings', label: 'My Bookings', icon: CalendarClock, description: 'Appointments, ride bookings, and delivery requests.' },
    { to: '/dashboard/reports', label: 'My Reports', icon: ReceiptText, description: 'Issue reports, municipal feedback, and status updates.' },
    { to: '/dashboard/tickets', label: 'My Tickets', icon: Ticket, description: 'Reserved and confirmed event tickets.' },
    { to: '/dashboard/jobs', label: 'My Jobs', icon: BriefcaseBusiness, description: 'Posted jobs, applications, and worker activity.' },
    { to: '/dashboard/listings', label: 'My Listings', icon: ShoppingBag, description: 'Marketplace posts and public listings.' },
    { to: '/dashboard/products', label: 'My Products', icon: Package, description: 'Product posts and store shortcuts.' },
    { to: '/dashboard/accommodation', label: 'My Accommodation', icon: Home, description: 'Property and short-stay listings.' },
    { to: '/dashboard/saved', label: 'Saved Items', icon: HeartHandshake, description: 'Saved products, providers, accommodation, listings, and news.' },
    { to: '/activity', label: 'Activity', icon: Activity, description: 'Notifications, alerts, and local updates.' },
    { to: '/settings', label: 'Settings', icon: Settings, description: 'Roles, preferences, privacy, and appearance.' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Profile" description="Your identity, shortcuts, and account ownership tools all in one place." />

      <QueryState isLoading={isLoading} error={error}>
        {!user ? (
          <EmptyState title="Profile unavailable" body="Sign in again to restore your account details." />
        ) : (
          <>
            <SectionCard className="overflow-hidden bg-white p-0">
              <div className="bg-gradient-to-r from-lokals-purple via-[#5639dc] to-[#7c5cff] px-6 py-8 text-white">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={user.name}
                      src={resolveMediaUrl(user.avatar ?? user.profile?.avatar_url ?? null) ?? undefined}
                      className="h-24 w-24 border-4 border-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                    />
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Active role
                      </div>
                      <h2 className="mt-3 text-3xl font-semibold">{user.name}</h2>
                      <p className="mt-1 text-sm text-white/85">{user.phone}</p>
                      <p className="mt-1 text-sm text-white/85">{[user.default_area ?? user.profile?.default_area, user.default_town ?? user.profile?.default_town].filter(Boolean).join(', ') || user.location || `${PILOT_TOWN}, Namibia`}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">Okahandja pilot</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-lokals-purple">{roleLabel(currentRole)}</span>
                        {(user.roles ?? []).filter((role) => role !== currentRole).slice(0, 3).map((role) => (
                          <span key={role} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">{roleLabel(role)}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[26px] bg-white/12 px-5 py-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Profile completion</p>
                    <p className="mt-2 text-3xl font-semibold">{data?.enrichment?.percentage ?? 0}%</p>
                    <p className="mt-2 max-w-xs text-sm text-white/80">Keep your role, contact details, and location ready so LOKALS can personalize bookings, updates, and opportunities.</p>
                    <div className="mt-4">
                      <Link to="/dashboard/profile/edit">
                        <Button variant="secondary">Edit profile</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Bookings', stats.bookings ?? 0],
                ['Reports', stats.reports ?? 0],
                ['Tickets', stats.tickets ?? 0],
                ['Saved items', stats.saved_items ?? 0],
              ].map(([label, value], index) => (
                <SectionCard key={label} className={`bg-white p-5 ${index === 0 ? 'border-lokals-purple/20' : ''}`}>
                  <p className="text-sm text-lokals-muted">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-lokals-charcoal">{value}</p>
                </SectionCard>
              ))}
            </div>

            <SectionCard className="bg-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-lokals-charcoal">Role switching</h3>
                  <p className="mt-1 text-sm text-lokals-muted">Use the role you already own and jump straight to the right dashboard or Home.</p>
                </div>
                <StatusPill value={roleLabel(currentRole)} tone="accent" />
              </div>
              <div className="mt-4">
                <RoleSwitcher
                  roles={user.roles ?? []}
                  currentRole={user.current_role}
                  isSwitching={switchRole.isPending}
                  onSwitch={async (role) => {
                    const payload = await switchRole.mutateAsync(role)
                    const nextUser = payload.user?.data ?? payload.user
                    navigate(getRoleHomePath(nextUser ?? user))
                  }}
                />
              </div>
            </SectionCard>

            <SectionCard className="bg-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-lokals-charcoal">Quick ownership shortcuts</h3>
                  <p className="mt-1 text-sm text-lokals-muted">Move quickly between the areas you manage most often.</p>
                </div>
                <Link to="/settings" className="text-sm font-semibold text-lokals-purple">Open settings</Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {menu.map((item) => (
                  <ProfileMenuItem key={item.to} {...item} />
                ))}
              </div>
            </SectionCard>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </>
        )}
      </QueryState>
    </div>
  )
}
