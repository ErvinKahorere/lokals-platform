import {
  Ambulance,
  BriefcaseBusiness,
  Building2,
  CarFront,
  HeartPulse,
  Home,
  Package,
  Paintbrush2,
  Plug,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Wrench,
} from 'lucide-react'

export const lokalsTheme = {
  colors: {
    primary: '#16A34A',
    charcoal: '#0F172A',
    gold: '#FACC15',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    muted: '#64748B',
    border: '#E5E7EB',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    hero: '24px',
  },
}

export const quickActions = [
  { label: 'Find Service', to: '/services', color: 'bg-lokals-green-soft text-lokals-green', icon: Sparkles },
  { label: 'Find Work', to: '/jobs', color: 'bg-lokals-sky-soft text-lokals-info', icon: BriefcaseBusiness },
  { label: 'Shop', to: '/store', color: 'bg-lokals-gold-soft text-lokals-charcoal', icon: ShoppingBag },
  { label: 'Stay', to: '/accommodation', color: 'bg-violet-50 text-violet-700', icon: Home },
  { label: 'Send Parcel', to: '/delivery', color: 'bg-emerald-50 text-emerald-700', icon: Package },
]

export const categoryMeta = {
  services: { icon: Sparkles, color: 'bg-lokals-green-soft text-lokals-green' },
  jobs: { icon: BriefcaseBusiness, color: 'bg-lokals-sky-soft text-lokals-info' },
  marketplace: { icon: ShoppingBag, color: 'bg-lokals-gold-soft text-lokals-charcoal' },
  delivery: { icon: Package, color: 'bg-emerald-50 text-emerald-700' },
  ride: { icon: CarFront, color: 'bg-violet-50 text-violet-700' },
  sos: { icon: ShieldAlert, color: 'bg-rose-50 text-rose-700' },
  health: { icon: HeartPulse, color: 'bg-emerald-50 text-emerald-700' },
  beauty: { icon: Paintbrush2, color: 'bg-pink-50 text-pink-700' },
  plumbing: { icon: Wrench, color: 'bg-sky-50 text-sky-700' },
  electrical: { icon: Plug, color: 'bg-yellow-50 text-yellow-700' },
  cleaning: { icon: Sparkles, color: 'bg-cyan-50 text-cyan-700' },
  mechanics: { icon: Wrench, color: 'bg-orange-50 text-orange-700' },
  tutors: { icon: Building2, color: 'bg-indigo-50 text-indigo-700' },
  directory: { icon: Home, color: 'bg-slate-100 text-slate-700' },
  announcements: { icon: Stethoscope, color: 'bg-lokals-sky-soft text-lokals-info' },
  default: { icon: Ambulance, color: 'bg-slate-100 text-slate-700' },
} as const
