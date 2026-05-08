import { Bell, BookOpen, CalendarDays, ChevronDown, LayoutDashboard, LogOut, MapPin, Menu, Search, Settings, ShieldAlert, Store, Ticket, UserRound } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMarkAllNotificationsRead, useMe, useMyBusinesses, useNotifications, usePreferences, useUpdatePreferences, useUpdateProfile } from '../../hooks/queries'
import { useAuthStore } from '../../store/auth'
import { NotificationBell } from '../experience/NotificationBell'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { MobileBottomNav } from './MobileBottomNav'
import { ProfileAvatar } from './ProfileAvatar'
import { RoleSwitcher } from './RoleSwitcher'
import { SearchBar } from './SearchBar'

const desktopLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/directory', label: 'Directory' },
  { to: '/store', label: 'Store' },
  { to: '/jobs', label: 'Work' },
  { to: '/events', label: 'Events' },
  { to: '/news', label: 'News' },
]

const mobileLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/alerts', label: 'Activity' },
  { to: '/store', label: 'Store' },
  { to: '/events', label: 'Events' },
  { to: '/news', label: 'News' },
  { to: '/directory', label: 'Directory' },
]

const businessRoles = ['seller', 'service_provider', 'business_owner', 'organization_admin', 'super_admin']
const locationOptions = [
  { town: 'Windhoek', area: 'CBD' },
  { town: 'Windhoek', area: 'Katutura' },
  { town: 'Windhoek', area: 'Khomasdal' },
  { town: 'Swakopmund', area: 'Town Centre' },
  { town: 'Walvis Bay', area: 'Narraville' },
  { town: 'Oshakati', area: 'Central' },
]

const formatRole = (role?: string | null) =>
  role ? role.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Citizen'

const socialLinks = [
  {
    label: 'X',
    href: '#',
    viewBox: '0 0 24 24',
    path: 'M18.901 1.153h3.68l-8.039 9.19L24 22.847h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.291 19.492h2.039L6.486 3.248H4.298L17.61 20.645Z',
    tone: 'text-slate-900 bg-slate-100 hover:bg-slate-200',
  },
  {
    label: 'Facebook',
    href: '#',
    viewBox: '0 0 24 24',
    path: 'M22 12.073C22 6.503 17.523 2 12 2S2 6.503 2 12.073c0 5.017 3.657 9.177 8.438 9.927v-7.02H7.898v-2.907h2.54V9.845c0-2.52 1.492-3.914 3.777-3.914 1.094 0 2.239.196 2.239.196v2.474h-1.261c-1.243 0-1.63.773-1.63 1.566v1.906h2.773l-.443 2.907h-2.33V22C18.343 21.25 22 17.09 22 12.073Z',
    tone: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
  },
  {
    label: 'Instagram',
    href: '#',
    viewBox: '0 0 24 24',
    path: 'M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.9 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 6.85A5.15 5.15 0 1 1 6.85 12 5.16 5.16 0 0 1 12 6.85Zm0 1.8A3.35 3.35 0 1 0 15.35 12 3.35 3.35 0 0 0 12 8.65Z',
    tone: 'text-pink-600 bg-pink-50 hover:bg-pink-100',
  },
  {
    label: 'TikTok',
    href: '#',
    viewBox: '0 0 24 24',
    path: 'M14.5 2h2.57A4.93 4.93 0 0 0 21 5.93v2.62a7.44 7.44 0 0 1-4.98-1.9v7.16A6.19 6.19 0 1 1 9.83 7.7v2.73a3.46 3.46 0 1 0 2.73 3.38V2h1.94Z',
    tone: 'text-[#111111] bg-rose-50 hover:bg-rose-100',
  },
  {
    label: 'LinkedIn',
    href: '#',
    viewBox: '0 0 24 24',
    path: 'M4.98 3.5A1.98 1.98 0 1 1 3 5.48 1.98 1.98 0 0 1 4.98 3.5ZM3.3 8.25h3.35V21H3.3V8.25Zm5.3 0h3.21v1.74h.05c.45-.85 1.55-1.74 3.19-1.74 3.42 0 4.05 2.25 4.05 5.17V21h-3.35v-6.73c0-1.61-.03-3.68-2.24-3.68-2.24 0-2.58 1.75-2.58 3.56V21H8.6V8.25Z',
    tone: 'text-sky-700 bg-sky-50 hover:bg-sky-100',
  },
] as const

function SocialIcon({ label, viewBox, path }: { label: string; viewBox: string; path: string }) {
  return (
    <>
      <svg viewBox={viewBox} className="h-4.5 w-4.5 fill-current" aria-hidden="true">
        <path d={path} />
      </svg>
      <span className="sr-only">{label}</span>
    </>
  )
}

function AppleBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M16.37 12.41c.02 2.19 1.92 2.92 1.94 2.93-.02.05-.3 1.03-.99 2.04-.6.87-1.22 1.74-2.2 1.76-.95.02-1.26-.57-2.35-.57-1.09 0-1.43.55-2.33.59-.94.03-1.66-.94-2.26-1.81-1.24-1.79-2.19-5.05-.92-7.27.63-1.1 1.76-1.79 2.98-1.81.93-.02 1.81.63 2.39.63.58 0 1.68-.78 2.84-.67.49.02 1.85.2 2.73 1.49-.07.04-1.63.95-1.61 2.69ZM14.56 5.06c.5-.61.85-1.47.76-2.31-.72.03-1.6.48-2.12 1.09-.47.54-.88 1.42-.77 2.26.81.06 1.63-.41 2.13-1.04Z" />
    </svg>
  )
}

function PlayBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#34A853" d="M4.54 3.76 13.85 13 4.56 20.24A2.18 2.18 0 0 1 4 18.7V5.3c0-.57.21-1.1.54-1.54Z" />
      <path fill="#4285F4" d="m16.86 15.99-2.96-2.99 2.97-2.96 3.58 2.03c1 .57 1 1.99 0 2.56l-3.59 1.36Z" />
      <path fill="#FBBC04" d="M4.54 3.76c.38-.5 1.08-.68 1.71-.31l10.62 6.59-2.97 2.96L4.54 3.76Z" />
      <path fill="#EA4335" d="m4.56 20.24 9.34-7.24 2.96 2.99-10.6 4.57c-.65.28-1.34.09-1.7-.32Z" />
    </svg>
  )
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const locationRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLDivElement | null>(null)
  const { user, logout } = useAuthStore()
  const meQuery = useMe()
  const preferencesQuery = usePreferences()
  const notificationsQuery = useNotifications()
  const businessesQuery = useMyBusinesses()
  const updatePreferences = useUpdatePreferences()
  const updateProfile = useUpdateProfile()
  const markAllRead = useMarkAllNotificationsRead()
  const navigate = useNavigate()
  const currentUser = meQuery.data?.user ? ('data' in meQuery.data.user ? meQuery.data.user.data : meQuery.data.user) : user
  const unreadCount = (notificationsQuery.data ?? []).filter((item) => !item.read_at).length
  const isAdmin = Boolean(currentUser?.roles?.some((role: string) => ['super_admin', 'operator', 'municipality_admin', 'town_manager'].includes(role)))
  const isBusinessUser = Boolean(currentUser?.roles?.some((role: string) => businessRoles.includes(role)))
  const activeRole = currentUser?.current_role ?? currentUser?.roles?.[0] ?? null
  const dashboardLink = activeRole === 'municipality_admin' || activeRole === 'town_manager'
    ? '/dashboard/town-manager'
    : activeRole === 'organization_admin'
      ? '/dashboard/organization'
      : isBusinessUser
        ? '/dashboard/business'
        : '/dashboard/profile'
  const locationLabel = [currentUser?.default_area ?? preferencesQuery.data?.default_area, currentUser?.default_town ?? preferencesQuery.data?.default_town ?? currentUser?.location ?? 'Windhoek'].filter(Boolean).join(', ')
  const profileMenu = useMemo(() => {
    const items = [
      { to: '/dashboard/profile', label: 'View Profile', icon: UserRound, show: Boolean(currentUser) },
      { to: '/activity', label: 'My Activity', icon: Bell, show: Boolean(currentUser) },
      { to: '/dashboard/bookings', label: 'My Bookings', icon: BookOpen, show: Boolean(currentUser) },
      { to: '/my-tickets', label: 'My Tickets', icon: Ticket, show: Boolean(currentUser) },
      { to: '/dashboard/saved', label: 'Saved Items', icon: CalendarDays, show: Boolean(currentUser) },
      { to: '/dashboard/business', label: 'Manage Business', icon: Store, show: isBusinessUser || (businessesQuery.data?.data?.length ?? 0) > 0 },
      { to: dashboardLink, label: 'Dashboard', icon: LayoutDashboard, show: Boolean(currentUser) },
      { to: '/settings', label: 'Settings', icon: Settings, show: Boolean(currentUser) },
    ]

    return items.filter((item) => item.show)
  }, [businessesQuery.data?.data?.length, currentUser, dashboardLink, isBusinessUser])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    const handleOutside = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false)
      }
      if (!locationRef.current?.contains(event.target as Node)) {
        setLocationOpen(false)
      }
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousedown', handleOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousedown', handleOutside)
    }
  }, [])

  const saveLocation = async (town: string, area: string) => {
    setLocationOpen(false)
    await Promise.all([
      updateProfile.mutateAsync({ default_town: town, default_area: area }),
      updatePreferences.mutateAsync({ default_town: town, default_area: area }),
    ])
  }

  const submitGlobalSearch = (value: string) => {
    const query = value.trim()
    setSearch(query)
    setSearchOpen(false)
    if (!query) return

    if (query.toLowerCase().includes('news')) {
      navigate(`/news?search=${encodeURIComponent(query)}`)
      return
    }

    if (query.toLowerCase().includes('event')) {
      navigate(`/events?search=${encodeURIComponent(query)}`)
      return
    }

    if (query.toLowerCase().includes('business') || query.toLowerCase().includes('directory')) {
      navigate(`/directory?search=${encodeURIComponent(query)}`)
      return
    }

    if (query.toLowerCase().includes('product') || query.toLowerCase().includes('shop') || query.toLowerCase().includes('store')) {
      navigate(`/store?search=${encodeURIComponent(query)}`)
      return
    }

    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen bg-lokals-bg pb-24 md:pb-0">
      <header className={`sticky top-0 z-30 border-b border-lokals-border bg-white/96 backdrop-blur transition-shadow ${scrolled ? 'shadow-[0_12px_32px_rgba(15,23,42,0.08)]' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Open navigation"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lokals-border bg-white md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5 text-lokals-charcoal" />
            </button>
            <NavLink to="/" className="flex min-w-0 items-center gap-3">
              <img src="/brand/lokals-logo.png" alt="LOKALS" className="h-10 w-auto" />
            </NavLink>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div ref={searchRef} className="relative hidden md:block">
              <button
                type="button"
                aria-label="Open search"
                onClick={() => setSearchOpen((value) => !value)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-lokals-border bg-white shadow-card transition ${searchOpen ? 'text-lokals-purple' : 'text-lokals-charcoal'}`}
              >
                <Search className="h-4.5 w-4.5" />
              </button>
              {searchOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.65rem)] z-40 w-[min(30rem,calc(100vw-2rem))] rounded-[24px] border border-lokals-border bg-white p-3 shadow-soft-lg">
                  <SearchBar
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        submitGlobalSearch(search)
                      }
                    }}
                    onValueSelect={submitGlobalSearch}
                    recentKey="global"
                    placeholder="Search services, businesses, news, events..."
                    suggestions={[
                      'Barber nearby',
                      'Local businesses',
                      'Events this weekend',
                      'Breaking local news',
                      'Shops near me',
                    ]}
                    shortcuts={[
                      { label: 'Services', value: 'services near me' },
                      { label: 'Directory', value: 'directory nearby' },
                      { label: 'Store', value: 'shop local products' },
                      { label: 'Events', value: 'events this weekend' },
                      { label: 'News', value: 'latest local news' },
                    ]}
                  />
                </div>
              ) : null}
            </div>

            <NotificationBell count={unreadCount} to="/alerts" />

            <div ref={locationRef} className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setLocationOpen((value) => !value)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-lokals-border bg-white px-3 py-2 text-sm font-semibold text-lokals-charcoal shadow-card"
              >
                <MapPin className="h-4 w-4 text-lokals-purple" />
                <span className="max-w-36 truncate">{locationLabel}</span>
                <ChevronDown className="h-4 w-4 text-lokals-muted" />
              </button>
              {locationOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-72 rounded-[20px] border border-lokals-border bg-white p-2 shadow-soft-lg">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Switch location</p>
                  <div className="space-y-1">
                    {locationOptions.map((option) => {
                      const active = option.town === (currentUser?.default_town ?? preferencesQuery.data?.default_town ?? 'Windhoek') && option.area === (currentUser?.default_area ?? preferencesQuery.data?.default_area ?? '')
                      return (
                        <button
                          key={`${option.town}-${option.area}`}
                          type="button"
                          disabled={updateProfile.isPending || updatePreferences.isPending}
                          onClick={() => void saveLocation(option.town, option.area)}
                          className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${active ? 'bg-lokals-purple text-white' : 'text-lokals-charcoal hover:bg-slate-100'}`}
                        >
                          <span>{option.area}, {option.town}</span>
                          <span className={`text-xs ${active ? 'text-white/80' : 'text-lokals-muted'}`}>{active ? 'Current' : 'Switch'}</span>
                        </button>
                      )
                    })}
                    <NavLink to="/settings" onClick={() => setLocationOpen(false)} className="block rounded-2xl px-3 py-3 text-sm font-medium text-lokals-purple hover:bg-violet-50">
                      Open location settings
                    </NavLink>
                  </div>
                </div>
              ) : null}
            </div>

            {currentUser ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-lokals-border bg-white px-2.5 py-2 shadow-card"
                >
                  <ProfileAvatar name={currentUser.name} avatar={currentUser.avatar ?? currentUser.profile?.avatar_url ?? null} size="sm" />
                  <div className="hidden text-left md:block">
                    <p className="max-w-28 truncate text-sm font-semibold text-lokals-charcoal">{currentUser.name}</p>
                    <p className="text-xs text-lokals-muted">{formatRole(activeRole)}</p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-lokals-muted md:block" />
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-80 rounded-[24px] border border-lokals-border bg-white p-3 shadow-soft-lg">
                    <div className="flex items-center gap-3 rounded-[20px] bg-lokals-surface p-3">
                      <ProfileAvatar name={currentUser.name} avatar={currentUser.avatar ?? currentUser.profile?.avatar_url ?? null} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-lokals-charcoal">{currentUser.name}</p>
                        <p className="truncate text-sm text-lokals-muted">{locationLabel}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <RoleSwitcher roles={currentUser.roles} currentRole={currentUser.current_role} />
                    </div>
                    <div className="mt-3 space-y-1">
                      {profileMenu.map((item) => {
                        const Icon = item.icon
                        return (
                          <NavLink key={item.label} to={item.to} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-lokals-charcoal transition hover:bg-slate-100">
                            <Icon className="h-4 w-4 text-lokals-purple" />
                            {item.label}
                          </NavLink>
                        )
                      })}
                      {isAdmin && activeRole !== 'municipality_admin' && activeRole !== 'town_manager' ? (
                        <NavLink to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-lokals-charcoal transition hover:bg-slate-100">
                          <ShieldAlert className="h-4 w-4 text-lokals-purple" />
                          Admin
                        </NavLink>
                      ) : null}
                      <button
                        type="button"
                        disabled={markAllRead.isPending}
                        onClick={() => void markAllRead.mutateAsync()}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-lokals-charcoal transition hover:bg-slate-100"
                      >
                        <Bell className="h-4 w-4 text-lokals-purple" />
                        {markAllRead.isPending ? 'Marking notifications...' : 'Mark notifications read'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileOpen(false)
                          await logout()
                          navigate('/login')
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-lokals-danger transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <NavLink to="/login"><Button>Login</Button></NavLink>
            )}
          </div>
        </div>

        <div className="mx-auto hidden max-w-7xl items-center justify-between gap-3 px-4 pb-3 md:flex md:px-6">
          <nav className="flex flex-wrap items-center gap-2">
            {desktopLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${isActive ? 'bg-lokals-purple text-white shadow-brand' : 'text-lokals-muted hover:bg-lokals-surface hover:text-lokals-charcoal'}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          {currentUser ? (
            <NavLink to={dashboardLink} className="inline-flex h-11 items-center gap-2 rounded-full border border-lokals-border bg-white px-4 text-sm font-semibold text-lokals-charcoal shadow-card">
              <LayoutDashboard className="h-4 w-4" />
              {activeRole === 'municipality_admin' || activeRole === 'town_manager' ? 'Town Manager' : activeRole === 'organization_admin' ? 'Organization' : activeRole === 'worker' ? 'Work Dashboard' : isBusinessUser ? 'Business Dashboard' : 'Dashboard'}
            </NavLink>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-lokals-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr,1fr,1fr] md:px-6">
          <div>
            <NavLink to="/" className="inline-flex items-center gap-3">
              <img src="/brand/lokals-logo.png" alt="LOKALS" className="h-10 w-auto" />
            </NavLink>
            <p className="mt-3 max-w-sm text-sm text-lokals-muted">Local services, trusted businesses, events, news, and daily help in one simple platform.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-lokals-charcoal">Quick links</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {desktopLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className="text-lokals-muted transition hover:text-lokals-purple">
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-lokals-charcoal">Stay connected</p>
            <div className="mt-3 space-y-2 text-sm text-lokals-muted">
              <p>support@lokals.app</p>
              <p>Windhoek, Namibia</p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {socialLinks.map(({ label, href, viewBox, path, tone }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-white shadow-sm transition ${tone}`}
                  >
                    <SocialIcon label={label} viewBox={viewBox} path={path} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
          <div className="w-full rounded-[26px] border border-lokals-border bg-gradient-to-r from-violet-50 via-white to-emerald-50 p-5 shadow-card">
            <p className="text-sm font-semibold text-lokals-charcoal">Download the LOKALS app</p>
            <p className="mt-1 text-xs text-lokals-muted">Get the mobile experience on Apple App Store or Google Play.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                href="#"
                aria-label="Download on the App Store"
                className="inline-flex w-full min-h-[58px] items-center gap-3 rounded-[18px] border border-slate-900 bg-slate-950 px-4 py-3 text-white transition hover:-translate-y-0.5"
              >
                <AppleBadgeIcon />
                <span className="text-left">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/70">Download on the</span>
                  <span className="block text-sm font-semibold">App Store</span>
                </span>
              </a>
              <a
                href="#"
                aria-label="Get it on Google Play"
                className="inline-flex w-full min-h-[58px] items-center gap-3 rounded-[18px] border border-slate-900 bg-slate-950 px-4 py-3 text-white transition hover:-translate-y-0.5"
              >
                <PlayBadgeIcon />
                <span className="text-left">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/70">Get it on</span>
                  <span className="block text-sm font-semibold">Google Play</span>
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-lokals-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-lokals-muted md:flex-row md:items-center md:justify-between md:px-6">
            <p>© 2026 LOKALS. Built for local life.</p>
            <div className="flex items-center gap-4">
              <NavLink to="/settings" className="transition hover:text-lokals-purple">Privacy</NavLink>
              <NavLink to="/settings" className="transition hover:text-lokals-purple">Terms</NavLink>
            </div>
          </div>
        </div>
      </footer>

      <BottomSheet open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div className="space-y-3">
          <div className="rounded-[24px] border border-lokals-border bg-white p-4">
            <p className="text-sm font-semibold text-lokals-charcoal">{currentUser?.name ?? 'Explore LOKALS'}</p>
            <p className="mt-1 text-sm text-lokals-muted">{locationLabel}</p>
          </div>
          <div className="space-y-2">
            {mobileLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block rounded-lokals-lg border border-lokals-border bg-white px-4 py-3 text-sm font-semibold text-lokals-charcoal">
                {link.label}
              </NavLink>
            ))}
            {currentUser ? (
              <>
                <NavLink to="/my-tickets" onClick={() => setMobileOpen(false)} className="block rounded-lokals-lg border border-lokals-border bg-white px-4 py-3 text-sm font-semibold text-lokals-charcoal">
                  My Tickets
                </NavLink>
                <NavLink to="/settings" onClick={() => setMobileOpen(false)} className="block rounded-lokals-lg border border-lokals-border bg-white px-4 py-3 text-sm font-semibold text-lokals-charcoal">
                  Settings
                </NavLink>
              </>
            ) : null}
          </div>
        </div>
      </BottomSheet>
      <MobileBottomNav />
    </div>
  )
}
