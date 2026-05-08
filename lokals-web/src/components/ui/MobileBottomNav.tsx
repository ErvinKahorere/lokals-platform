import { Compass, BellRing, Home, Sparkles, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '../../store/auth'

export function MobileBottomNav() {
  const token = useAuthStore((state) => state.token)
  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/services', label: 'Services', icon: Sparkles },
    { to: '/alerts', label: 'Activity', icon: BellRing },
    { to: '/more', label: 'Explore', icon: Compass },
    { to: token ? '/dashboard/profile' : '/login', label: 'Profile', icon: UserRound },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-lokals-border bg-white/96 px-3 pb-safe pt-2 shadow-[0_-12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex min-h-[56px] flex-col items-center justify-center rounded-lokals-lg text-[11px] font-semibold',
                isActive ? 'bg-lokals-green text-white shadow-[0_10px_20px_rgba(22,163,74,0.22)]' : 'text-lokals-muted',
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
