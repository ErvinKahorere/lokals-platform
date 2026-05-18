import type { LucideIcon } from 'lucide-react'
import { Activity, CarFront, ClipboardCheck, ClipboardList, MessageSquare, Package, ShieldCheck, Siren, Store, Wallet, Wrench } from 'lucide-react'

export type DashboardWorkspaceRow = {
  status: string
  summary: string
  owner: string
  next_step: string
}

export type DashboardWorkspaceAction = {
  label: string
  to: string
  icon: LucideIcon
  accentClass?: string
}

export type DashboardWorkspaceFilter = {
  label: string
  value: string
}

type DashboardWorkspaceSeed = {
  actions?: DashboardWorkspaceAction[]
  filters?: DashboardWorkspaceFilter[]
  rows?: DashboardWorkspaceRow[]
}

export const DASHBOARD_WORKSPACE_SEEDS: Record<string, DashboardWorkspaceSeed> = {
  '/dashboard/driver/requests': {
    actions: [
      { label: 'Open ride map', to: '/ride', icon: CarFront, accentClass: 'bg-amber-50 text-amber-700' },
      { label: 'Driver support', to: '/dashboard/driver/support', icon: MessageSquare, accentClass: 'bg-slate-100 text-slate-700' },
    ],
    filters: [{ label: 'Open', value: 'open' }, { label: 'Assigned', value: 'assigned' }],
    rows: [
      { status: 'Open', summary: 'Nau-Aib to Town Centre', owner: 'Resident pickup nearby', next_step: 'Review trip estimate and accept' },
      { status: 'Assigned', summary: 'School run request', owner: 'Queued for available drivers', next_step: 'Watch live demand' },
    ],
  },
  '/dashboard/driver/active-trip': {
    actions: [
      { label: 'Open rides', to: '/ride', icon: CarFront, accentClass: 'bg-amber-50 text-amber-700' },
      { label: 'Message resident', to: '/conversations', icon: MessageSquare, accentClass: 'bg-violet-50 text-violet-700' },
    ],
    filters: [{ label: 'En route', value: 'route' }, { label: 'In progress', value: 'progress' }],
    rows: [{ status: 'En route', summary: 'Pickup at Nau-Aib Clinic', owner: 'Current assigned resident', next_step: 'Confirm arrival when nearby' }],
  },
  '/dashboard/driver/history': {
    actions: [{ label: 'Driver earnings', to: '/dashboard/driver/earnings', icon: Wallet, accentClass: 'bg-emerald-50 text-emerald-700' }],
    filters: [{ label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }],
    rows: [
      { status: 'Completed', summary: 'Town Centre to Five Rand', owner: 'Morning trip', next_step: 'Review rider rating' },
      { status: 'Completed', summary: 'Okahandja CBD to Nau-Aib', owner: 'Afternoon trip', next_step: 'Included in earnings summary' },
    ],
  },
  '/dashboard/driver/earnings': {
    actions: [{ label: 'Trip history', to: '/dashboard/driver/history', icon: ClipboardList, accentClass: 'bg-slate-100 text-slate-700' }],
    filters: [{ label: 'This week', value: 'week' }, { label: 'This month', value: 'month' }],
    rows: [{ status: 'This week', summary: 'Trip earnings', owner: 'Payout batch', next_step: 'Review payout schedule' }],
  },
  '/dashboard/driver/vehicle': {
    actions: [{ label: 'Documents', to: '/dashboard/driver/documents', icon: Wrench, accentClass: 'bg-slate-100 text-slate-700' }],
    rows: [{ status: 'Ready', summary: 'Vehicle details', owner: 'Driver profile', next_step: 'Update plate and make if needed' }],
  },
  '/dashboard/driver/documents': {
    actions: [{ label: 'Role applications', to: '/dashboard/modes', icon: ClipboardCheck, accentClass: 'bg-lokals-purple-soft text-lokals-purple' }],
    filters: [{ label: 'Approved', value: 'approved' }, { label: 'Pending', value: 'pending' }],
    rows: [
      { status: 'Approved', summary: 'Driving license', owner: 'Town approval', next_step: 'Renew when required' },
      { status: 'Pending', summary: 'Roadworthy proof', owner: 'Awaiting review', next_step: 'Upload clearer copy if requested' },
    ],
  },
  '/dashboard/driver/ratings': {
    rows: [{ status: 'Ready', summary: 'Recent rider feedback', owner: 'Resident trip reviews', next_step: 'Keep service quality high' }],
  },
  '/dashboard/driver/support': {
    actions: [{ label: 'Open messages', to: '/conversations', icon: MessageSquare, accentClass: 'bg-violet-50 text-violet-700' }],
    rows: [{ status: 'Ready', summary: 'Support inbox', owner: 'Driver operations', next_step: 'Start a support conversation when needed' }],
  },
  '/dashboard/courier/requests': {
    actions: [{ label: 'Open delivery board', to: '/delivery', icon: Package, accentClass: 'bg-emerald-50 text-emerald-700' }],
    filters: [{ label: 'Open', value: 'open' }, { label: 'Urgent', value: 'urgent' }],
    rows: [{ status: 'Open', summary: 'Parcel to Five Rand', owner: 'Business request', next_step: 'Review parcel size and accept' }],
  },
  '/dashboard/courier/active-delivery': {
    actions: [{ label: 'Open deliveries', to: '/delivery', icon: Package, accentClass: 'bg-emerald-50 text-emerald-700' }],
    rows: [{ status: 'In transit', summary: 'Medicine parcel delivery', owner: 'Current assigned customer', next_step: 'Confirm delivered once complete' }],
  },
  '/dashboard/courier/history': {
    rows: [{ status: 'Completed', summary: 'Town Centre to Nau-Aib', owner: 'Courier trip history', next_step: 'Review rating and notes' }],
  },
  '/dashboard/courier/earnings': {
    actions: [{ label: 'Delivery history', to: '/dashboard/courier/history', icon: Wallet, accentClass: 'bg-amber-50 text-amber-700' }],
    rows: [{ status: 'This week', summary: 'Courier earnings', owner: 'Payout summary', next_step: 'Watch completed delivery totals' }],
  },
  '/dashboard/courier/profile': {
    rows: [{ status: 'Ready', summary: 'Courier profile', owner: 'Transport details', next_step: 'Update vehicle or operating area if needed' }],
  },
  '/dashboard/courier/documents': {
    rows: [{ status: 'Pending', summary: 'Courier document review', owner: 'Town approval queue', next_step: 'Resubmit if changes are requested' }],
  },
  '/dashboard/courier/ratings': {
    rows: [{ status: 'Ready', summary: 'Recent delivery ratings', owner: 'Customer feedback', next_step: 'Use comments to improve service' }],
  },
  '/dashboard/courier/support': {
    actions: [{ label: 'Open support chat', to: '/support', icon: MessageSquare, accentClass: 'bg-violet-50 text-violet-700' }],
    rows: [{ status: 'Ready', summary: 'Courier support queue', owner: 'Operations team', next_step: 'Open a conversation when needed' }],
  },
  '/dashboard/business/profile': {
    actions: [{ label: 'Open marketplace', to: '/store', icon: Store, accentClass: 'bg-violet-50 text-violet-700' }],
    rows: [{ status: 'Ready', summary: 'Profile completeness', owner: 'Business profile', next_step: 'Refresh contact and location details' }],
  },
  '/dashboard/business/orders': {
    rows: [{ status: 'Open', summary: 'New customer enquiry', owner: 'Marketplace or service request', next_step: 'Respond through messages' }],
  },
  '/dashboard/business/promotions': {
    rows: [{ status: 'Ready', summary: 'Promotion draft', owner: 'Business marketing', next_step: 'Publish when ready' }],
  },
  '/dashboard/business/reviews': {
    rows: [{ status: 'Ready', summary: 'Customer review summary', owner: 'Business reputation', next_step: 'Respond to feedback politely' }],
  },
  '/dashboard/business/analytics': {
    actions: [{ label: 'Open listings', to: '/dashboard/listings', icon: Activity, accentClass: 'bg-sky-50 text-sky-700' }],
    rows: [{ status: 'Ready', summary: 'Weekly view summary', owner: 'Business analytics', next_step: 'Compare listings and enquiries' }],
  },
  '/dashboard/provider/requests': {
    rows: [{ status: 'Open', summary: 'Resident request for electrical repair', owner: 'Incoming provider lead', next_step: 'Reply or convert to booking' }],
  },
  '/dashboard/provider/reviews': {
    rows: [{ status: 'Ready', summary: 'Latest customer feedback', owner: 'Provider profile', next_step: 'Respond where appropriate' }],
  },
  '/dashboard/provider/earnings': {
    actions: [{ label: 'Open bookings', to: '/dashboard/provider/bookings', icon: Wallet, accentClass: 'bg-emerald-50 text-emerald-700' }],
    rows: [{ status: 'Operational', summary: 'Earnings summary', owner: 'Provider finance view', next_step: 'Review completed jobs, unpaid work, and payout readiness' }],
  },
  '/dashboard/organisation/posts': {
    rows: [{ status: 'Ready', summary: 'Post planning queue', owner: 'Organisation communications', next_step: 'Publish the next update' }],
  },
  '/dashboard/organisation/volunteers': {
    rows: [{ status: 'Ready', summary: 'Volunteer interest', owner: 'Community participants', next_step: 'Contact or assign when approved' }],
  },
  '/dashboard/organisation/analytics': {
    rows: [{ status: 'Ready', summary: 'Engagement snapshot', owner: 'Organisation analytics', next_step: 'Compare events and posts over time' }],
  },
  '/dashboard/town-manager/pending-approvals': {
    actions: [
      { label: 'Role applications', to: '/dashboard/town-manager/role-applications', icon: ClipboardCheck, accentClass: 'bg-lokals-purple-soft text-lokals-purple' },
      { label: 'Feed moderation', to: '/dashboard/town-manager/feed/pending', icon: ShieldCheck, accentClass: 'bg-emerald-50 text-emerald-700' },
    ],
    filters: [{ label: 'Pending', value: 'pending' }, { label: 'Changes requested', value: 'changes' }],
    rows: [
      { status: 'Pending', summary: 'Driver application review', owner: 'Transport approvals', next_step: 'Approve, reject, or request changes' },
      { status: 'Pending', summary: 'Business verification request', owner: 'Trust queue', next_step: 'Check documents and approve' },
    ],
  },
  '/dashboard/town-manager/emergencies': {
    actions: [{ label: 'Open alerts', to: '/alerts', icon: Siren, accentClass: 'bg-red-50 text-red-600' }],
    rows: [{ status: 'Ready', summary: 'Emergency response workspace', owner: 'Town operations', next_step: 'Send or monitor critical alerts' }],
  },
  '/dashboard/town-manager/business-verification': {
    rows: [{ status: 'Pending', summary: 'Local pharmacy verification', owner: 'Business trust queue', next_step: 'Review registration and approve' }],
  },
  '/dashboard/town-manager/service-providers': {
    rows: [{ status: 'Ready', summary: 'Provider roster', owner: 'Town operations', next_step: 'Review provider trust signals' }],
  },
  '/dashboard/town-manager/residents': {
    rows: [{ status: 'Ready', summary: 'Resident activity snapshot', owner: 'Town support operations', next_step: 'Follow up on urgent resident issues' }],
  },
  '/dashboard/town-manager/analytics': {
    actions: [{ label: 'Open reports', to: '/dashboard/town-manager/reports', icon: Activity, accentClass: 'bg-sky-50 text-sky-700' }],
    rows: [{ status: 'Ready', summary: 'Response time overview', owner: 'Town performance', next_step: 'Compare departments and issue types' }],
  },
  '/dashboard/admin/towns': {
    rows: [{ status: 'Ready', summary: 'Town onboarding overview', owner: 'Platform operations', next_step: 'Open or pause towns safely' }],
  },
  '/dashboard/admin/roles': {
    rows: [{ status: 'Ready', summary: 'Role matrix', owner: 'Platform access control', next_step: 'Review elevated role assignments' }],
  },
  '/dashboard/admin/system-health': {
    rows: [{ status: 'Ready', summary: 'Platform health checks', owner: 'System operations', next_step: 'Review failed jobs and queue health' }],
  },
  '/dashboard/admin/feature-flags': {
    rows: [{ status: 'Pending API', summary: 'Feature flag controls', owner: 'Platform release management', next_step: 'Connect backend feature flags when ready' }],
  },
  '/dashboard/admin/feed-engine': {
    rows: [{ status: 'Ready', summary: 'Feed moderation control', owner: 'Platform content operations', next_step: 'Review pending or flagged content' }],
  },
  '/dashboard/admin/ai-logs': {
    rows: [{ status: 'Pending API', summary: 'AI assist audit trail', owner: 'Platform AI operations', next_step: 'Connect live usage metrics and logs' }],
  },
  '/dashboard/admin/notifications': {
    rows: [{ status: 'Ready', summary: 'Notification operations', owner: 'Platform communications', next_step: 'Review delivery and unread trends' }],
  },
  '/dashboard/admin/audit-logs': {
    rows: [{ status: 'Pending API', summary: 'Audit trail workspace', owner: 'Platform governance', next_step: 'Connect live audit log feed' }],
  },
  '/dashboard/admin/rewards': {
    rows: [{ status: 'Ready', summary: 'Rewards oversight', owner: 'Sponsor and incentive operations', next_step: 'Open rewards management or approvals' }],
  },
}

export function getDashboardWorkspaceData(path: string): DashboardWorkspaceSeed {
  return DASHBOARD_WORKSPACE_SEEDS[path] ?? {}
}
