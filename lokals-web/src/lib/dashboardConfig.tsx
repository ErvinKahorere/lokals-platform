import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CarFront,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Flag,
  Gift,
  HeartHandshake,
  Home,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  MapPinned,
  Megaphone,
  MessageSquare,
  Package,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  ShieldPlus,
  ShoppingBag,
  Siren,
  Sparkles,
  Store,
  UserCheck,
  UserRound,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from 'lucide-react'
import type { Role } from '../types'

export type DashboardMode =
  | 'resident'
  | 'driver'
  | 'courier'
  | 'provider'
  | 'business'
  | 'organisation'
  | 'town_manager'
  | 'admin'

export type DashboardNavItem = {
  label: string
  to: string
  icon: LucideIcon
  description?: string
  badge?: string
}

export type DashboardNavGroup = {
  label: string
  items: DashboardNavItem[]
}

export type DashboardConfig = {
  mode: DashboardMode
  label: string
  shortLabel: string
  title: string
  description: string
  basePath: string
  homeRoute: string
  accent: string
  roleKeys: Array<Role | string>
  nav: DashboardNavGroup[]
}

const residentNav: DashboardNavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Overview', to: '/dashboard/resident', icon: LayoutDashboard, description: 'Your local workspace' },
      { label: 'Report Issue', to: '/report-issue', icon: Flag, description: 'Send a civic issue quickly' },
      { label: 'My Issues', to: '/dashboard/reports', icon: ClipboardList, description: 'Track status updates' },
    ],
  },
  {
    label: 'Everyday life',
    items: [
      { label: 'Services', to: '/services', icon: Search, description: 'Find local providers' },
      { label: 'Taxi', to: '/ride', icon: CarFront, description: 'Request a ride' },
      { label: 'Delivery', to: '/delivery', icon: Package, description: 'Send a parcel' },
      { label: 'Orders', to: '/orders', icon: ShoppingBag, description: 'Track local food and shop orders' },
      { label: 'Hire / Rentals', to: '/hire', icon: Warehouse, description: 'Browse rentable local equipment and event gear' },
      { label: 'Marketplace', to: '/store', icon: ShoppingBag, description: 'Browse local deals' },
      { label: 'Events', to: '/events', icon: CalendarDays, description: 'See what is nearby' },
      { label: 'Jobs', to: '/jobs', icon: BriefcaseBusiness, description: 'Find nearby work' },
      { label: 'Rentals', to: '/accommodation', icon: Home, description: 'Browse local stays' },
      { label: 'Get Involved', to: '/get-involved', icon: HeartHandshake, description: 'Join projects' },
    ],
  },
  {
    label: 'My account',
    items: [
      { label: 'Rewards', to: '/community-impact', icon: Gift, description: 'Points and milestones' },
      { label: 'Messages', to: '/conversations', icon: MessageSquare, description: 'Chats and support' },
      { label: 'Notifications', to: '/notifications', icon: Bell, description: 'Unread updates' },
      { label: 'Saved Items', to: '/saved-items', icon: ShieldPlus, description: 'Saved discoveries' },
      { label: 'Profile', to: '/dashboard/profile', icon: UserRound, description: 'Your account details' },
    ],
  },
]

const driverNav: DashboardNavGroup[] = [
  {
    label: 'Work',
    items: [
      { label: 'Overview', to: '/dashboard/driver', icon: LayoutDashboard },
      { label: 'Available Ride Requests', to: '/dashboard/driver/requests', icon: CarFront },
      { label: 'Active Trip', to: '/dashboard/driver/active-trip', icon: MapPinned },
      { label: 'Trip History', to: '/dashboard/driver/history', icon: ScrollText },
      { label: 'Earnings', to: '/dashboard/driver/earnings', icon: Wallet },
    ],
  },
  {
    label: 'Driver account',
    items: [
      { label: 'Vehicle Profile', to: '/dashboard/driver/vehicle', icon: Wrench },
      { label: 'Documents', to: '/dashboard/driver/documents', icon: ClipboardCheck },
      { label: 'Ratings', to: '/dashboard/driver/ratings', icon: Sparkles },
      { label: 'Support', to: '/dashboard/driver/support', icon: LifeBuoy },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

const courierNav: DashboardNavGroup[] = [
  {
    label: 'Work',
    items: [
      { label: 'Overview', to: '/dashboard/courier', icon: LayoutDashboard },
      { label: 'Available Deliveries', to: '/dashboard/courier/requests', icon: Package },
      { label: 'Order Deliveries', to: '/dashboard/courier/orders', icon: ShoppingBag },
      { label: 'Active Delivery', to: '/dashboard/courier/active-delivery', icon: MapPinned },
      { label: 'Delivery History', to: '/dashboard/courier/history', icon: ScrollText },
      { label: 'Earnings', to: '/dashboard/courier/earnings', icon: Wallet },
    ],
  },
  {
    label: 'Courier account',
    items: [
      { label: 'Vehicle/Profile', to: '/dashboard/courier/profile', icon: Wrench },
      { label: 'Documents', to: '/dashboard/courier/documents', icon: ClipboardCheck },
      { label: 'Ratings', to: '/dashboard/courier/ratings', icon: Sparkles },
      { label: 'Support', to: '/dashboard/courier/support', icon: LifeBuoy },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

const providerNav: DashboardNavGroup[] = [
  {
    label: 'Operations',
    items: [
      { label: 'Overview', to: '/dashboard/provider', icon: LayoutDashboard },
      { label: 'Service Requests', to: '/dashboard/provider/requests', icon: ClipboardList },
      { label: 'Bookings', to: '/dashboard/bookings', icon: CalendarDays },
      { label: 'Listings', to: '/services', icon: Search },
      { label: 'Reviews', to: '/dashboard/provider/reviews', icon: Sparkles },
      { label: 'Earnings', to: '/dashboard/provider/earnings', icon: Wallet },
    ],
  },
  {
    label: 'Profile',
    items: [
      { label: 'Verification', to: '/verification', icon: ShieldCheck },
      { label: 'Messages', to: '/conversations', icon: MessageSquare },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

const businessNav: DashboardNavGroup[] = [
  {
    label: 'Business',
    items: [
      { label: 'Overview', to: '/dashboard/business', icon: LayoutDashboard },
      { label: 'Business Profile', to: '/dashboard/business/profile', icon: Store },
      { label: 'Products/Listings', to: '/dashboard/listings', icon: ShoppingBag },
      { label: 'Orders/Requests', to: '/dashboard/business/orders', icon: ClipboardList },
      { label: 'Hire Items', to: '/dashboard/business/hire-items', icon: Warehouse },
      { label: 'Hire Bookings', to: '/dashboard/business/hire-bookings', icon: ClipboardCheck },
      { label: 'Promotions', to: '/dashboard/business/promotions', icon: Megaphone },
      { label: 'Messages', to: '/conversations', icon: MessageSquare },
      { label: 'Reviews', to: '/dashboard/business/reviews', icon: Sparkles },
      { label: 'Analytics', to: '/dashboard/business/analytics', icon: Activity },
      { label: 'Verification', to: '/verification', icon: ShieldCheck },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

const organisationNav: DashboardNavGroup[] = [
  {
    label: 'Organisation',
    items: [
      { label: 'Overview', to: '/dashboard/organisation', icon: LayoutDashboard },
      { label: 'Posts', to: '/dashboard/organisation/posts', icon: Megaphone },
      { label: 'Events', to: '/events', icon: CalendarDays },
      { label: 'Community Projects', to: '/dashboard/community-projects', icon: HeartHandshake },
      { label: 'Volunteers', to: '/dashboard/organisation/volunteers', icon: Users },
      { label: 'Followers', to: '/dashboard/feed', icon: UserCheck },
      { label: 'Messages', to: '/conversations', icon: MessageSquare },
      { label: 'Analytics', to: '/dashboard/organisation/analytics', icon: Activity },
      { label: 'Verification', to: '/verification', icon: ShieldCheck },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

const townManagerNav: DashboardNavGroup[] = [
  {
    label: 'Town operations',
    items: [
      { label: 'Overview', to: '/dashboard/town-manager', icon: LayoutDashboard },
      { label: 'Pending Approvals', to: '/dashboard/town-manager/pending-approvals', icon: ClipboardCheck },
      { label: 'Issue Management', to: '/dashboard/town-manager/reports', icon: Flag },
      { label: 'Announcements', to: '/alerts', icon: Megaphone },
      { label: 'Emergency Alerts', to: '/dashboard/town-manager/emergencies', icon: Siren },
      { label: 'Community Projects', to: '/dashboard/town-manager/community-projects', icon: HeartHandshake },
      { label: 'Feed Moderation', to: '/dashboard/town-manager/feed/pending', icon: ShieldCheck },
      { label: 'Drivers & Couriers', to: '/dashboard/town-manager/role-applications', icon: CarFront },
      { label: 'Business Verification', to: '/dashboard/town-manager/business-verification', icon: Building2 },
      { label: 'Service Providers', to: '/dashboard/town-manager/service-providers', icon: UserCheck },
      { label: 'Rewards Verification', to: '/dashboard/town-manager/community-impact/pending', icon: Gift },
      { label: 'Residents', to: '/dashboard/town-manager/residents', icon: Users },
      { label: 'Analytics', to: '/dashboard/town-manager/analytics', icon: Activity },
      { label: 'Hire Listings', to: '/dashboard/town-manager/hire', icon: Warehouse },
      { label: 'Messages & Support', to: '/conversations', icon: Inbox },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

const adminNav: DashboardNavGroup[] = [
  {
    label: 'Platform',
    items: [
      { label: 'Global Overview', to: '/dashboard/admin', icon: LayoutDashboard },
      { label: 'Towns', to: '/dashboard/admin/towns', icon: Building2 },
      { label: 'Orders', to: '/dashboard/admin/orders', icon: ShoppingBag },
      { label: 'Hire', to: '/dashboard/admin/hire', icon: Warehouse },
      { label: 'Users', to: '/dashboard/admin/users', icon: Users },
      { label: 'Roles & Permissions', to: '/dashboard/admin/roles', icon: ShieldCheck },
      { label: 'All Approvals', to: '/dashboard/admin/role-applications', icon: ClipboardCheck },
      { label: 'Platform Moderation', to: '/admin/reports', icon: Flag },
      { label: 'System Health', to: '/dashboard/admin/system-health', icon: Wrench },
      { label: 'Feature Flags', to: '/dashboard/admin/feature-flags', icon: Sparkles },
      { label: 'Feed Review', to: '/dashboard/admin/feed-engine', icon: Megaphone },
      { label: 'Approval Audit', to: '/dashboard/admin/ai-logs', icon: ShieldPlus },
      { label: 'Notifications', to: '/dashboard/admin/notifications', icon: Bell },
      { label: 'Audit Logs', to: '/dashboard/admin/audit-logs', icon: ScrollText },
      { label: 'Sponsors/Rewards', to: '/dashboard/admin/rewards', icon: Gift },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

export const DASHBOARD_CONFIG: Record<DashboardMode, DashboardConfig> = {
  resident: {
    mode: 'resident',
    label: 'Resident Mode',
    shortLabel: 'Resident',
    title: 'Resident dashboard',
    description: 'Everyday local life, requests, rewards, and trusted updates in one place.',
    basePath: '/dashboard/resident',
    homeRoute: '/dashboard/resident',
    accent: 'from-lokals-green/20 via-white to-lokals-purple-soft/50',
    roleKeys: ['citizen'],
    nav: residentNav,
  },
  driver: {
    mode: 'driver',
    label: 'Driver Mode',
    shortLabel: 'Driver',
    title: 'Driver dashboard',
    description: 'Ride requests, active trips, earnings, and readiness controls.',
    basePath: '/dashboard/driver',
    homeRoute: '/dashboard/driver',
    accent: 'from-amber-100 via-white to-lokals-purple-soft/50',
    roleKeys: ['driver'],
    nav: driverNav,
  },
  courier: {
    mode: 'courier',
    label: 'Courier Mode',
    shortLabel: 'Courier',
    title: 'Courier dashboard',
    description: 'Delivery requests, active drop-offs, and courier operations.',
    basePath: '/dashboard/courier',
    homeRoute: '/dashboard/courier',
    accent: 'from-emerald-100 via-white to-lokals-purple-soft/50',
    roleKeys: ['courier'],
    nav: courierNav,
  },
  provider: {
    mode: 'provider',
    label: 'Provider Mode',
    shortLabel: 'Provider',
    title: 'Service provider dashboard',
    description: 'Bookings, service requests, reviews, and profile trust.',
    basePath: '/dashboard/provider',
    homeRoute: '/dashboard/provider',
    accent: 'from-violet-100 via-white to-lokals-green-soft/50',
    roleKeys: ['service_provider'],
    nav: providerNav,
  },
  business: {
    mode: 'business',
    label: 'Business Mode',
    shortLabel: 'Business',
    title: 'Business dashboard',
    description: 'Listings, promotions, enquiries, and commercial analytics.',
    basePath: '/dashboard/business',
    homeRoute: '/dashboard/business',
    accent: 'from-lokals-gold/20 via-white to-lokals-purple-soft/40',
    roleKeys: ['seller', 'business_owner'],
    nav: businessNav,
  },
  organisation: {
    mode: 'organisation',
    label: 'Organisation Mode',
    shortLabel: 'Organisation',
    title: 'Organisation dashboard',
    description: 'Posts, events, volunteers, followers, and community impact.',
    basePath: '/dashboard/organisation',
    homeRoute: '/dashboard/organisation',
    accent: 'from-sky-100 via-white to-lokals-purple-soft/40',
    roleKeys: ['organization_admin', 'organization_representative'],
    nav: organisationNav,
  },
  town_manager: {
    mode: 'town_manager',
    label: 'Town Manager Mode',
    shortLabel: 'Town Manager',
    title: 'Town Manager dashboard',
    description: 'Approvals, reports, emergencies, resident activity, and analytics.',
    basePath: '/dashboard/town-manager',
    homeRoute: '/dashboard/town-manager',
    accent: 'from-lokals-purple-soft via-white to-emerald-50',
    roleKeys: ['town_manager', 'municipality_admin'],
    nav: townManagerNav,
  },
  admin: {
    mode: 'admin',
    label: 'Super Admin Mode',
    shortLabel: 'Super Admin',
    title: 'Super Admin dashboard',
    description: 'Platform control, approvals, health, moderation, and system insight.',
    basePath: '/dashboard/admin',
    homeRoute: '/dashboard/admin',
    accent: 'from-slate-100 via-white to-lokals-purple-soft/40',
    roleKeys: ['super_admin', 'operator'],
    nav: adminNav,
  },
}

export function getDashboardConfig(mode: DashboardMode) {
  return DASHBOARD_CONFIG[mode]
}

export function resolveDashboardModeFromRole(role?: string | null): DashboardMode {
  if (role === 'driver') return 'driver'
  if (role === 'courier') return 'courier'
  if (role === 'service_provider') return 'provider'
  if (role === 'seller' || role === 'business_owner') return 'business'
  if (role === 'organization_admin' || role === 'organization_representative') return 'organisation'
  if (role === 'town_manager' || role === 'municipality_admin') return 'town_manager'
  if (role === 'super_admin' || role === 'operator') return 'admin'
  return 'resident'
}

export function getDashboardHomeForMode(mode: DashboardMode) {
  return DASHBOARD_CONFIG[mode].homeRoute
}

export function getSidebarItems(mode: DashboardMode) {
  return DASHBOARD_CONFIG[mode].nav.flatMap((group) => group.items)
}

export function getNavItemMeta(mode: DashboardMode, path: string) {
  return getSidebarItems(mode).find((item) => item.to === path)
}

export const dashboardEmptyRows = [
  {
    status: 'Waiting',
    summary: 'No active rows yet',
    owner: 'This route is ready for API data',
    next_step: 'Connect a live endpoint or keep using this as a practical placeholder.',
  },
]

export function buildPlaceholderRows(items: DashboardNavItem[]) {
  return items.slice(0, 4).map((item, index) => ({
    status: index === 0 ? 'Ready' : index === 1 ? 'Pending API' : 'Configured',
    summary: item.label,
    owner: item.description ?? 'Dashboard route connected',
    next_step: index === 0 ? 'Open this flow' : 'Connect live data next',
  }))
}

export const dashboardPlaceholderCta = {
  label: 'Open role applications',
  to: '/dashboard/modes',
  icon: ChevronRight,
}
