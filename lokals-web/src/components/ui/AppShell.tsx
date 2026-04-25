import { LayoutDashboard, LogOut, MapPin, Menu, MoonStar, ShieldAlert, SunMedium } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMe } from '../../hooks/queries'
import { useTheme } from '../../providers/ThemeProvider'
import { useAuthStore } from '../../store/auth'
import { GlassNav } from '../glass/GlassNav'
import { NotificationBell } from '../experience/NotificationBell'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { LocationSwitcher } from './LocationSwitcher'
import { MobileBottomNav } from './MobileBottomNav'
import { ProfileAvatar } from './ProfileAvatar'
import { RoleSwitcher } from './RoleSwitcher'
import { DemoModeBanner } from './DemoModeBanner'

const desktopLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/jobs', label: 'Work' },
  { to: '/store', label: 'Market' },
  { to: '/dashboard/profile', label: 'Profile' },
]

const businessRoles = ['seller', 'service_provider', 'business_owner', 'organization_admin', 'super_admin']

export function AppShell() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const meQuery = useMe()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const currentUser = meQuery.data?.user ? ('data' in meQuery.data.user ? meQuery.data.user.data : meQuery.data.user) : user
  const isAdmin = Boolean(currentUser?.roles?.some((role: string) => ['super_admin', 'operator', 'municipality_admin'].includes(role)))
  const isBusinessUser = Boolean(currentUser?.roles?.some((role: string) => businessRoles.includes(role)))
  const activeRole = currentUser?.current_role ?? currentUser?.roles?.[0] ?? null
  const dashboardLink = activeRole === 'municipality_admin'
    ? '/dashboard/municipality'
    : activeRole === 'organization_admin'
      ? '/dashboard/organization'
      : isBusinessUser
        ? '/dashboard/business'
        : '/dashboard/profile'

  return (
    <div className="min-h-screen bg-lokals-bg pb-24 md:pb-0">
      <DemoModeBanner />
      <header className="glass-surface sticky top-0 z-30 border-b border-lokals-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" className="glass-surface flex h-11 w-11 items-center justify-center rounded-2xl border border-lokals-border md:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5 text-lokals-charcoal" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4F46E5,#312E81)] text-white shadow-brand">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lokals-purple">LOKALS</p>
                <h1 className="text-sm font-semibold text-lokals-charcoal md:text-base">Everything in your city.</h1>
              </div>
            </div>
          </div>
          <GlassNav className="hidden items-center gap-2 md:flex">
            {desktopLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${isActive ? 'bg-lokals-purple text-white shadow-brand' : 'text-lokals-muted hover:text-lokals-charcoal'}`}>
                {link.label}
              </NavLink>
            ))}
          </GlassNav>
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              className="glass-surface flex h-11 w-11 items-center justify-center rounded-full border border-lokals-border"
              onClick={() => setTheme(theme === 'system' ? (resolvedTheme === 'dark' ? 'light' : 'dark') : theme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? <SunMedium className="h-4 w-4 text-lokals-gold" /> : <MoonStar className="h-4 w-4 text-lokals-purple" />}
            </button>
            <NotificationBell count={3} />
            <NavLink to="/more" aria-label="Open more actions" className="glass-surface hidden h-11 items-center gap-2 rounded-full border border-lokals-border px-4 text-sm font-semibold text-lokals-charcoal sm:inline-flex">
              <ShieldAlert className="h-4 w-4" />
              More
            </NavLink>
            {currentUser ? (
              <>
                <div className="hidden items-center gap-2 lg:flex">
                  <ProfileAvatar name={currentUser.name} avatar={currentUser.avatar ?? currentUser.profile?.avatar_url ?? null} size="sm" />
                  <div className="text-right">
                    <p className="text-sm font-semibold text-lokals-charcoal">{currentUser.name}</p>
                    <p className="text-xs text-lokals-muted">{currentUser.default_town ?? currentUser.location ?? 'Windhoek'} {activeRole ? `• ${activeRole.replaceAll('_', ' ')}` : ''}</p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 xl:flex">
                  <RoleSwitcher roles={currentUser.roles} currentRole={currentUser.current_role} />
                  <LocationSwitcher town={currentUser.default_town} area={currentUser.default_area} onClick={() => navigate('/settings')} />
                </div>
              </>
            ) : null}
            {currentUser ? (
              <NavLink to={dashboardLink} className="glass-surface hidden h-11 items-center gap-2 rounded-full border border-lokals-border px-4 text-sm font-semibold text-lokals-charcoal lg:inline-flex">
                <LayoutDashboard className="h-4 w-4" />
                {activeRole === 'municipality_admin' ? 'Town Manager' : activeRole === 'organization_admin' ? 'Organization' : isBusinessUser ? 'Business' : 'Dashboard'}
              </NavLink>
            ) : null}
            {isAdmin && activeRole !== 'municipality_admin' ? (
              <NavLink to="/admin" className="glass-surface hidden h-11 items-center gap-2 rounded-full border border-lokals-border px-4 text-sm font-semibold text-lokals-charcoal xl:inline-flex">
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </NavLink>
            ) : null}
            {currentUser ? (
              <Button variant="secondary" className="hidden sm:inline-flex" onClick={async () => { await logout(); navigate('/login') }}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <NavLink to="/login"><Button>Login</Button></NavLink>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          {desktopLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="glass-surface block rounded-lokals-lg border border-lokals-border px-4 py-3 text-sm font-semibold text-lokals-charcoal">
              {link.label}
            </NavLink>
          ))}
          {currentUser ? (
            <NavLink to={dashboardLink} onClick={() => setOpen(false)} className="glass-surface block rounded-lokals-lg border border-lokals-border px-4 py-3 text-sm font-semibold text-lokals-charcoal">
              {activeRole === 'municipality_admin' ? 'Town Manager Dashboard' : isBusinessUser ? 'Business Dashboard' : 'Profile'}
            </NavLink>
          ) : null}
          <NavLink to="/settings" onClick={() => setOpen(false)} className="glass-surface block rounded-lokals-lg border border-lokals-border px-4 py-3 text-sm font-semibold text-lokals-charcoal">
            Settings
          </NavLink>
          <NavLink to="/store" onClick={() => setOpen(false)} className="glass-surface block rounded-lokals-lg border border-lokals-border px-4 py-3 text-sm font-semibold text-lokals-charcoal">
            Shop
          </NavLink>
          <NavLink to="/accommodation" onClick={() => setOpen(false)} className="glass-surface block rounded-lokals-lg border border-lokals-border px-4 py-3 text-sm font-semibold text-lokals-charcoal">
            Stay
          </NavLink>
          <NavLink to="/delivery" onClick={() => setOpen(false)} className="glass-surface block rounded-lokals-lg border border-lokals-border px-4 py-3 text-sm font-semibold text-lokals-charcoal">
            Send Parcel
          </NavLink>
          <NavLink to="/more" onClick={() => setOpen(false)} className="glass-surface block rounded-lokals-lg border border-lokals-border px-4 py-3 text-sm font-semibold text-lokals-charcoal">
            More
          </NavLink>
        </div>
      </BottomSheet>
      <MobileBottomNav />
    </div>
  )
}
