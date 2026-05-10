import { BellRing, Home, ShoppingBag, Sparkles, UserRound } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '../../store/auth'

export function MobileBottomNav() {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  const items = [
    { to: '/home', label: 'Home', icon: Home, match: (pathname: string) => pathname === '/' || pathname.startsWith('/home') || pathname.startsWith('/search') || pathname.startsWith('/okahandja') },
    { to: '/services', label: 'Services', icon: Sparkles, match: (pathname: string) => pathname.startsWith('/services') || pathname.startsWith('/directory') || pathname.startsWith('/workers') },
    { to: '/store', label: 'Market', icon: ShoppingBag, match: (pathname: string) => pathname.startsWith('/store') || pathname.startsWith('/marketplace') || pathname.startsWith('/accommodation') },
    { to: '/activity', label: 'Activity', icon: BellRing, match: (pathname: string) => pathname.startsWith('/activity') || pathname.startsWith('/alerts') || pathname.startsWith('/notifications') || pathname.startsWith('/news') || pathname.startsWith('/events') || pathname.startsWith('/reports') },
    { to: token ? '/dashboard/profile' : '/login', label: 'Profile', icon: UserRound, match: (pathname: string) => pathname.startsWith('/dashboard') || pathname.startsWith('/settings') || pathname.startsWith('/saved-items') || pathname.startsWith('/my-bookings') || pathname.startsWith('/my-tickets') || pathname.startsWith('/dashboard/profile') },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-lokals-border bg-white/96 px-3 pb-safe pt-2 shadow-[0_-12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-2">
        {items.map(({ to, label, icon: Icon, match }) => (
          <NavLink
            key={to}
            to={to}
            className={() =>
              clsx(
                'flex min-h-[56px] flex-col items-center justify-center rounded-lokals-lg text-[11px] font-semibold',
                (match?.(location.pathname) ?? location.pathname === to)
                  ? 'bg-violet-50 text-lokals-purple shadow-[0_10px_20px_rgba(124,58,237,0.16)]'
                  : 'text-lokals-muted',
              )
            }
          >
            <Icon className="mb-1 h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
