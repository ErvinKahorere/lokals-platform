import { lazy, Suspense, type ReactElement } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/ui/AppShell'
import { LoadingScreen } from './components/ui/LoadingSkeleton'
import { getDashboardWorkspaceData } from './lib/dashboardWorkspaceData'
import { getRoleHomePath, hasActiveRole } from './lib/roles'
import { useAuthStore } from './store/auth'

const HomePage = lazy(async () => ({ default: (await import('./pages/HomePage')).HomePage }))
const LandingPage = lazy(async () => ({ default: (await import('./pages/LandingPage')).LandingPage }))
const LoginPage = lazy(async () => ({ default: (await import('./pages/LoginPage')).LoginPage }))
const OnboardingPage = lazy(async () => ({ default: (await import('./pages/OnboardingPage')).OnboardingPage }))
const RegisterPage = lazy(async () => ({ default: (await import('./pages/RegisterPage')).RegisterPage }))
const DirectoryPage = lazy(async () => ({ default: (await import('./pages/DirectoryPage')).DirectoryPage }))
const MorePage = lazy(async () => ({ default: (await import('./pages/MorePage')).MorePage }))
const ReportIssuePage = lazy(async () => ({ default: (await import('./pages/ReportIssuePage')).ReportIssuePage }))
const SosPage = lazy(async () => ({ default: (await import('./pages/SosPage')).SosPage }))
const SettingsPage = lazy(async () => ({ default: (await import('./pages/SettingsPage')).SettingsPage }))
const AlertsPage = lazy(async () => ({ default: (await import('./pages/AlertsPage')).AlertsPage }))
const NotificationsPage = lazy(async () => ({ default: (await import('./pages/NotificationsPage')).NotificationsPage }))
const NewsPage = lazy(async () => ({ default: (await import('./pages/NewsPage')).NewsPage }))
const NewsDetailsPage = lazy(async () => ({ default: (await import('./pages/NewsDetailsPage')).NewsDetailsPage }))
const ArticleBrowserPage = lazy(async () => ({ default: (await import('./pages/ArticleBrowserPage')).ArticleBrowserPage }))
const CommunityProjectsPage = lazy(async () => ({ default: (await import('./pages/CommunityProjectsPage')).CommunityProjectsPage }))
const CommunityProjectDetailsPage = lazy(async () => ({ default: (await import('./pages/CommunityProjectDetailsPage')).CommunityProjectDetailsPage }))
const SubmitCommunityProjectPage = lazy(async () => ({ default: (await import('./pages/SubmitCommunityProjectPage')).SubmitCommunityProjectPage }))
const MyCommunityProjectsPage = lazy(async () => ({ default: (await import('./pages/MyCommunityProjectsPage')).MyCommunityProjectsPage }))
const MyCommunityPledgesPage = lazy(async () => ({ default: (await import('./pages/MyCommunityPledgesPage')).MyCommunityPledgesPage }))
const TownManagerCommunityProjectsPage = lazy(async () => ({ default: (await import('./pages/TownManagerCommunityProjectsPage')).TownManagerCommunityProjectsPage }))
const TownManagerCommunityProjectReviewPage = lazy(async () => ({ default: (await import('./pages/TownManagerCommunityProjectReviewPage')).TownManagerCommunityProjectReviewPage }))
const FeedPage = lazy(async () => ({ default: (await import('./pages/FeedPage')).FeedPage }))
const InboxPage = lazy(async () => ({ default: (await import('./pages/InboxPage')).InboxPage }))
const ConversationPage = lazy(async () => ({ default: (await import('./pages/ConversationPage')).ConversationPage }))
const EventsPage = lazy(async () => ({ default: (await import('./pages/EventsPage')).EventsPage }))
const EventDetailsPage = lazy(async () => ({ default: (await import('./pages/EventDetailsPage')).EventDetailsPage }))
const EventCalendarPage = lazy(async () => ({ default: (await import('./pages/EventCalendarPage')).EventCalendarPage }))
const CreateEventPage = lazy(async () => ({ default: (await import('./pages/CreateEventPage')).CreateEventPage }))
const ManageEventPage = lazy(async () => ({ default: (await import('./pages/ManageEventPage')).ManageEventPage }))
const EventTicketsPage = lazy(async () => ({ default: (await import('./pages/EventTicketsPage')).EventTicketsPage }))
const MarketplacePage = lazy(async () => ({ default: (await import('./pages/MarketplacePage')).MarketplacePage }))
const StorePage = lazy(async () => ({ default: (await import('./pages/StorePage')).StorePage }))
const ProductDetailsPage = lazy(async () => ({ default: (await import('./pages/ProductDetailsPage')).ProductDetailsPage }))
const OrdersPage = lazy(async () => ({ default: (await import('./pages/OrdersPage')).OrdersPage }))
const OrderDetailsPage = lazy(async () => ({ default: (await import('./pages/OrderDetailsPage')).OrderDetailsPage }))
const CheckoutPage = lazy(async () => ({ default: (await import('./pages/CheckoutPage')).CheckoutPage }))
const HirePage = lazy(async () => ({ default: (await import('./pages/HirePage')).HirePage }))
const HireItemDetailsPage = lazy(async () => ({ default: (await import('./pages/HireItemDetailsPage')).HireItemDetailsPage }))
const MyHireBookingsPage = lazy(async () => ({ default: (await import('./pages/MyHireBookingsPage')).MyHireBookingsPage }))
const HireBookingPage = lazy(async () => ({ default: (await import('./pages/HireBookingPage')).HireBookingPage }))
const MyHireItemsPage = lazy(async () => ({ default: (await import('./pages/MyHireItemsPage')).MyHireItemsPage }))
const AccommodationPage = lazy(async () => ({ default: (await import('./pages/AccommodationPage')).AccommodationPage }))
const AccommodationDetailsPage = lazy(async () => ({ default: (await import('./pages/AccommodationDetailsPage')).AccommodationDetailsPage }))
const ServicesPage = lazy(async () => ({ default: (await import('./pages/ServicesPage')).ServicesPage }))
const ServiceProviderDetailsPage = lazy(async () => ({ default: (await import('./pages/ServiceProviderDetailsPage')).ServiceProviderDetailsPage }))
const BookingPage = lazy(async () => ({ default: (await import('./pages/BookingPage')).BookingPage }))
const DeliveryPage = lazy(async () => ({ default: (await import('./pages/DeliveryPage')).DeliveryPage }))
const DeliveryDetailsPage = lazy(async () => ({ default: (await import('./pages/DeliveryDetailsPage')).DeliveryDetailsPage }))
const RidePage = lazy(async () => ({ default: (await import('./pages/RidePage')).RidePage }))
const RideDetailsPage = lazy(async () => ({ default: (await import('./pages/RideDetailsPage')).RideDetailsPage }))
const WorkersPage = lazy(async () => ({ default: (await import('./pages/WorkersPage')).WorkersPage }))
const WorkerProfilePage = lazy(async () => ({ default: (await import('./pages/WorkerProfilePage')).WorkerProfilePage }))
const JobsPage = lazy(async () => ({ default: (await import('./pages/JobsPage')).JobsPage }))
const ListingDetailsPage = lazy(async () => ({ default: (await import('./pages/ListingDetailsPage')).ListingDetailsPage }))
const JobDetailsPage = lazy(async () => ({ default: (await import('./pages/JobDetailsPage')).JobDetailsPage }))
const DirectoryDetailsPage = lazy(async () => ({ default: (await import('./pages/DirectoryDetailsPage')).DirectoryDetailsPage }))
const SearchResultsPage = lazy(async () => ({ default: (await import('./pages/SearchResultsPage')).SearchResultsPage }))
const ActivityPage = lazy(async () => ({ default: (await import('./pages/ActivityPage')).ActivityPage }))
const SavedItemsPage = lazy(async () => ({ default: (await import('./pages/dashboard/SavedItemsPage')).SavedItemsPage }))
const TownPortalPage = lazy(async () => ({ default: (await import('./pages/TownPortalPage')).TownPortalPage }))
const CommunityImpactDashboardPage = lazy(async () => ({ default: (await import('./pages/community/CommunityImpactDashboardPage')).CommunityImpactDashboardPage }))
const CommunityImpactHistoryPage = lazy(async () => ({ default: (await import('./pages/community/CommunityImpactHistoryPage')).CommunityImpactHistoryPage }))
const CommunityImpactLeaderboardPage = lazy(async () => ({ default: (await import('./pages/community/CommunityImpactLeaderboardPage')).CommunityImpactLeaderboardPage }))
const CommunityImpactPrivacyPage = lazy(async () => ({ default: (await import('./pages/community/CommunityImpactPrivacyPage')).CommunityImpactPrivacyPage }))
const CommunityImpactRedemptionsPage = lazy(async () => ({ default: (await import('./pages/community/CommunityImpactRedemptionsPage')).CommunityImpactRedemptionsPage }))
const CommunityImpactRewardsPage = lazy(async () => ({ default: (await import('./pages/community/CommunityImpactRewardsPage')).CommunityImpactRewardsPage }))
const SupportPage = lazy(async () => ({ default: (await import('./pages/SupportPage')).SupportPage }))
const DashboardPage = lazy(async () => ({ default: (await import('./pages/dashboard/DashboardPage')).DashboardPage }))
const CitizenDashboardPage = lazy(async () => ({ default: (await import('./pages/dashboard/CitizenDashboardPage')).CitizenDashboardPage }))
const WorkerDashboardPage = lazy(async () => ({ default: (await import('./pages/dashboard/WorkerDashboardPage')).WorkerDashboardPage }))
const DriverDashboardPage = lazy(async () => ({ default: (await import('./pages/dashboard/DriverDashboardPage')).DriverDashboardPage }))
const CourierDashboardPage = lazy(async () => ({ default: (await import('./pages/dashboard/CourierDashboardPage')).CourierDashboardPage }))
const CourierOrdersPage = lazy(async () => ({ default: (await import('./pages/dashboard/CourierOrdersPage')).CourierOrdersPage }))
const DashboardWorkspacePage = lazy(async () => ({ default: (await import('./pages/dashboard/DashboardWorkspacePage')).DashboardWorkspacePage }))
const MyBookingsPage = lazy(async () => ({ default: (await import('./pages/dashboard/MyBookingsPage')).MyBookingsPage }))
const MyTicketsPage = lazy(async () => ({ default: (await import('./pages/dashboard/MyTicketsPage')).MyTicketsPage }))
const MyListingsPage = lazy(async () => ({ default: (await import('./pages/dashboard/MyListingsPage')).MyListingsPage }))
const MyJobsPage = lazy(async () => ({ default: (await import('./pages/dashboard/MyJobsPage')).MyJobsPage }))
const MyReportsPage = lazy(async () => ({ default: (await import('./pages/dashboard/MyReportsPage')).MyReportsPage }))
const ReportDetailsPage = lazy(async () => ({ default: (await import('./pages/dashboard/ReportDetailsPage')).ReportDetailsPage }))
const ProfilePage = lazy(async () => ({ default: (await import('./pages/dashboard/ProfilePage')).ProfilePage }))
const EditProfilePage = lazy(async () => ({ default: (await import('./pages/dashboard/EditProfilePage')).EditProfilePage }))
const RoleApplicationsPage = lazy(async () => ({ default: (await import('./pages/dashboard/RoleApplicationsPage')).RoleApplicationsPage }))
const BusinessDashboardPage = lazy(async () => ({ default: (await import('./pages/dashboard/BusinessDashboardPage')).BusinessDashboardPage }))
const SellerDashboardPage = lazy(async () => ({ default: (await import('./pages/dashboard/SellerDashboardPage')).SellerDashboardPage }))
const SellerOrdersPage = lazy(async () => ({ default: (await import('./pages/dashboard/SellerOrdersPage')).SellerOrdersPage }))
const HireOwnerBookingsPage = lazy(async () => ({ default: (await import('./pages/dashboard/HireOwnerBookingsPage')).HireOwnerBookingsPage }))
const ServiceProviderDashboardPage = lazy(async () => ({ default: (await import('./pages/dashboard/ServiceProviderDashboardPage')).ServiceProviderDashboardPage }))
const OrganizationDashboardPage = lazy(async () => ({ default: (await import('./pages/dashboard/OrganizationDashboardPage')).OrganizationDashboardPage }))
const FollowingFeedPage = lazy(async () => ({ default: (await import('./pages/dashboard/FollowingFeedPage')).FollowingFeedPage }))
const AdminProvidersPage = lazy(async () => ({ default: (await import('./pages/admin/AdminProvidersPage')).AdminProvidersPage }))
const AdminBookingsPage = lazy(async () => ({ default: (await import('./pages/admin/AdminBookingsPage')).AdminBookingsPage }))
const AdminListingsPage = lazy(async () => ({ default: (await import('./pages/admin/AdminListingsPage')).AdminListingsPage }))
const AdminUsersPage = lazy(async () => ({ default: (await import('./pages/admin/AdminUsersPage')).AdminUsersPage }))
const MunicipalityDashboardPage = lazy(async () => ({ default: (await import('./pages/admin/MunicipalityDashboardPage')).MunicipalityDashboardPage }))
const SuperAdminDashboardPage = lazy(async () => ({ default: (await import('./pages/admin/SuperAdminDashboardPage')).SuperAdminDashboardPage }))
const AdminOverviewPage = lazy(async () => ({ default: (await import('./pages/admin/AdminOverviewPage')).AdminOverviewPage }))
const AdminReportsPage = lazy(async () => ({ default: (await import('./pages/admin/AdminReportsPage')).AdminReportsPage }))
const RoleApplicationsAdminPage = lazy(async () => ({ default: (await import('./pages/admin/RoleApplicationsAdminPage')).RoleApplicationsAdminPage }))
const CommunityImpactPendingPage = lazy(async () => ({ default: (await import('./pages/admin/CommunityImpactPendingPage')).CommunityImpactPendingPage }))
const CommunityImpactRewardsManagePage = lazy(async () => ({ default: (await import('./pages/admin/CommunityImpactRewardsManagePage')).CommunityImpactRewardsManagePage }))
const CommunityImpactRedemptionsAdminPage = lazy(async () => ({ default: (await import('./pages/admin/CommunityImpactRedemptionsPage')).CommunityImpactRedemptionsAdminPage }))
const CommunityImpactUserProfilePage = lazy(async () => ({ default: (await import('./pages/admin/CommunityImpactUserProfilePage')).CommunityImpactUserProfilePage }))
const FeedModerationPage = lazy(async () => ({ default: (await import('./pages/admin/FeedModerationPage')).FeedModerationPage }))
const AdminAuditLogsPage = lazy(async () => ({ default: (await import('./pages/admin/AdminAuditLogsPage')).AdminAuditLogsPage }))
const AdminFeatureFlagsPage = lazy(async () => ({ default: (await import('./pages/admin/AdminFeatureFlagsPage')).AdminFeatureFlagsPage }))
const AdminNotificationsPage = lazy(async () => ({ default: (await import('./pages/admin/AdminNotificationsPage')).AdminNotificationsPage }))
const AdminSystemHealthPage = lazy(async () => ({ default: (await import('./pages/admin/AdminSystemHealthPage')).AdminSystemHealthPage }))
const AdminTownsPage = lazy(async () => ({ default: (await import('./pages/admin/AdminTownsPage')).AdminTownsPage }))
const AdminOrdersPage = lazy(async () => ({ default: (await import('./pages/admin/AdminOrdersPage')).AdminOrdersPage }))
const AdminHirePage = lazy(async () => ({ default: (await import('./pages/admin/AdminHirePage')).AdminHirePage }))

function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  return token ? children : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}`, prompt: 'Sign in to continue' }} />
}

function RootRoute() {
  const token = useAuthStore((state) => state.token)
  const onboardingComplete =
    typeof window !== 'undefined' &&
    window.localStorage.getItem('lokals-onboarding-complete') === 'true'

  if (!token && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return token ? <Navigate to="/home" replace /> : <LandingPage />
}

function AdminRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  return hasActiveRole(user, ['super_admin', 'operator']) ? children : <Navigate to={getRoleHomePath(user)} replace />
}

function BusinessRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  return hasActiveRole(user, ['seller', 'business_owner']) ? children : <Navigate to={getRoleHomePath(user)} replace />
}

function WorkerRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  return hasActiveRole(user, ['worker']) ? children : <Navigate to={getRoleHomePath(user)} replace />
}

function DriverRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  return hasActiveRole(user, ['driver']) ? children : <Navigate to={getRoleHomePath(user)} replace />
}

function CourierRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  return hasActiveRole(user, ['courier']) ? children : <Navigate to={getRoleHomePath(user)} replace />
}

function ServiceProviderRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  return hasActiveRole(user, ['service_provider']) ? children : <Navigate to={getRoleHomePath(user)} replace />
}

function MunicipalityRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  return hasActiveRole(user, ['town_manager', 'municipality_admin']) ? children : <Navigate to={getRoleHomePath(user)} replace />
}

function EventPublisherRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  const canPublishEvents = Boolean(user?.roles?.some((role) => [
    'seller',
    'service_provider',
    'business_owner',
    'organization_admin',
    'municipality_admin',
    'town_manager',
    'super_admin',
  ].includes(role)))
  return canPublishEvents ? children : <Navigate to="/" replace />
}

function OrganizationRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  return hasActiveRole(user, ['organization_admin']) ? children : <Navigate to={getRoleHomePath(user)} replace />
}

function RouteFallback() {
  return <LoadingScreen title="Loading screen" message="Bringing the next part of your city into view..." />
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<RootRoute />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/store/:id" element={<ProductDetailsPage />} />
          <Route path="/hire" element={<HirePage />} />
          <Route path="/hire/bookings" element={<ProtectedRoute><MyHireBookingsPage /></ProtectedRoute>} />
          <Route path="/hire/bookings/:id" element={<ProtectedRoute><HireBookingPage /></ProtectedRoute>} />
          <Route path="/hire/my-items" element={<ProtectedRoute><MyHireItemsPage /></ProtectedRoute>} />
          <Route path="/hire/owner/bookings" element={<ProtectedRoute><HireOwnerBookingsPage /></ProtectedRoute>} />
          <Route path="/hire/:id" element={<HireItemDetailsPage />} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
          <Route path="/accommodation" element={<AccommodationPage />} />
          <Route path="/accommodation/:id" element={<AccommodationDetailsPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/marketplace/:id" element={<ListingDetailsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceProviderDetailsPage />} />
          <Route path="/services/:id/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/delivery/:id" element={<ProtectedRoute><DeliveryDetailsPage /></ProtectedRoute>} />
          <Route path="/ride" element={<RidePage />} />
          <Route path="/ride/:id" element={<ProtectedRoute><RideDetailsPage /></ProtectedRoute>} />
          <Route path="/sos" element={<SosPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/workers/:id" element={<WorkerProfilePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/directory/:id" element={<DirectoryDetailsPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/conversations" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
          <Route path="/conversations/:id" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
          <Route path="/get-involved" element={<CommunityProjectsPage />} />
          <Route path="/get-involved/submit" element={<ProtectedRoute><SubmitCommunityProjectPage /></ProtectedRoute>} />
          <Route path="/get-involved/:slug" element={<CommunityProjectDetailsPage />} />
          <Route path="/town/okahandja" element={<TownPortalPage />} />
          <Route path="/okahandja" element={<TownPortalPage />} />
          <Route path="/organizations" element={<ProtectedRoute><DirectoryPage /></ProtectedRoute>} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/report-issue" element={<ProtectedRoute><ReportIssuePage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><RoleApplicationsPage /></ProtectedRoute>} />
          <Route path="/following-organizations" element={<ProtectedRoute><FollowingFeedPage /></ProtectedRoute>} />
          <Route path="/community-impact" element={<ProtectedRoute><CommunityImpactDashboardPage /></ProtectedRoute>} />
          <Route path="/community-impact/history" element={<ProtectedRoute><CommunityImpactHistoryPage /></ProtectedRoute>} />
          <Route path="/community-impact/rewards" element={<ProtectedRoute><CommunityImpactRewardsPage /></ProtectedRoute>} />
          <Route path="/community-impact/redemptions" element={<ProtectedRoute><CommunityImpactRedemptionsPage /></ProtectedRoute>} />
          <Route path="/community-impact/leaderboard" element={<ProtectedRoute><CommunityImpactLeaderboardPage /></ProtectedRoute>} />
          <Route path="/community-impact/privacy" element={<ProtectedRoute><CommunityImpactPrivacyPage /></ProtectedRoute>} />

          <Route path="/dashboard/feed" element={<ProtectedRoute><FollowingFeedPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/resident" element={<ProtectedRoute><CitizenDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/citizen" element={<ProtectedRoute><CitizenDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/worker" element={<WorkerRoute><WorkerDashboardPage /></WorkerRoute>} />
          <Route path="/dashboard/driver" element={<DriverRoute><DriverDashboardPage /></DriverRoute>} />
          <Route path="/dashboard/driver/requests" element={<DriverRoute><DashboardWorkspacePage mode="driver" path="/dashboard/driver/requests" title="Available ride requests" description="Review open requests, recent demand, and matching readiness from one queue." {...getDashboardWorkspaceData('/dashboard/driver/requests')} /></DriverRoute>} />
          <Route path="/dashboard/driver/active-trip" element={<DriverRoute><DashboardWorkspacePage mode="driver" path="/dashboard/driver/active-trip" title="Active trip" description="Keep current pickup, rider contact, and trip timeline in one focused view." {...getDashboardWorkspaceData('/dashboard/driver/active-trip')} /></DriverRoute>} />
          <Route path="/dashboard/driver/history" element={<DriverRoute><DashboardWorkspacePage mode="driver" path="/dashboard/driver/history" title="Trip history" description="See completed trips, recent cancellations, and operational patterns." {...getDashboardWorkspaceData('/dashboard/driver/history')} /></DriverRoute>} />
          <Route path="/dashboard/driver/earnings" element={<DriverRoute><DashboardWorkspacePage mode="driver" path="/dashboard/driver/earnings" title="Driver earnings" description="Track trip totals, pending payouts, and weekly momentum." {...getDashboardWorkspaceData('/dashboard/driver/earnings')} /></DriverRoute>} />
          <Route path="/dashboard/driver/vehicle" element={<DriverRoute><DashboardWorkspacePage mode="driver" path="/dashboard/driver/vehicle" title="Vehicle profile" description="Keep vehicle details, plate information, and driver profile readiness clean and current." {...getDashboardWorkspaceData('/dashboard/driver/vehicle')} /></DriverRoute>} />
          <Route path="/dashboard/driver/documents" element={<DriverRoute><DashboardWorkspacePage mode="driver" path="/dashboard/driver/documents" title="Driver documents" description="Review license, registration, and verification document status." {...getDashboardWorkspaceData('/dashboard/driver/documents')} /></DriverRoute>} />
          <Route path="/dashboard/driver/ratings" element={<DriverRoute><DashboardWorkspacePage mode="driver" path="/dashboard/driver/ratings" title="Driver ratings" description="Stay close to rider sentiment, feedback patterns, and profile trust." {...getDashboardWorkspaceData('/dashboard/driver/ratings')} /></DriverRoute>} />
          <Route path="/dashboard/driver/support" element={<DriverRoute><DashboardWorkspacePage mode="driver" path="/dashboard/driver/support" title="Driver support" description="Get help with trips, verification, and driver account questions." {...getDashboardWorkspaceData('/dashboard/driver/support')} /></DriverRoute>} />
          <Route path="/dashboard/courier" element={<CourierRoute><CourierDashboardPage /></CourierRoute>} />
          <Route path="/dashboard/courier/orders" element={<CourierRoute><CourierOrdersPage /></CourierRoute>} />
          <Route path="/dashboard/courier/requests" element={<CourierRoute><DashboardWorkspacePage mode="courier" path="/dashboard/courier/requests" title="Available deliveries" description="See open parcel requests, urgency, and pickup/drop-off readiness." {...getDashboardWorkspaceData('/dashboard/courier/requests')} /></CourierRoute>} />
          <Route path="/dashboard/courier/active-delivery" element={<CourierRoute><DashboardWorkspacePage mode="courier" path="/dashboard/courier/active-delivery" title="Active delivery" description="Track current pickup, parcel state, and next operational step." {...getDashboardWorkspaceData('/dashboard/courier/active-delivery')} /></CourierRoute>} />
          <Route path="/dashboard/courier/history" element={<CourierRoute><DashboardWorkspacePage mode="courier" path="/dashboard/courier/history" title="Delivery history" description="Review completed deliveries and recent delivery performance." {...getDashboardWorkspaceData('/dashboard/courier/history')} /></CourierRoute>} />
          <Route path="/dashboard/courier/earnings" element={<CourierRoute><DashboardWorkspacePage mode="courier" path="/dashboard/courier/earnings" title="Courier earnings" description="Track delivery payouts, estimated totals, and courier performance windows." {...getDashboardWorkspaceData('/dashboard/courier/earnings')} /></CourierRoute>} />
          <Route path="/dashboard/courier/profile" element={<CourierRoute><DashboardWorkspacePage mode="courier" path="/dashboard/courier/profile" title="Courier vehicle and profile" description="Keep bicycle, motorbike, or vehicle details aligned with your courier profile." {...getDashboardWorkspaceData('/dashboard/courier/profile')} /></CourierRoute>} />
          <Route path="/dashboard/courier/documents" element={<CourierRoute><DashboardWorkspacePage mode="courier" path="/dashboard/courier/documents" title="Courier documents" description="Track courier verification document status and approval feedback." {...getDashboardWorkspaceData('/dashboard/courier/documents')} /></CourierRoute>} />
          <Route path="/dashboard/courier/ratings" element={<CourierRoute><DashboardWorkspacePage mode="courier" path="/dashboard/courier/ratings" title="Courier ratings" description="Monitor customer trust signals and delivery quality feedback." {...getDashboardWorkspaceData('/dashboard/courier/ratings')} /></CourierRoute>} />
          <Route path="/dashboard/courier/support" element={<CourierRoute><DashboardWorkspacePage mode="courier" path="/dashboard/courier/support" title="Courier support" description="Reach support quickly for account, payout, and delivery help." {...getDashboardWorkspaceData('/dashboard/courier/support')} /></CourierRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/jobs" element={<ProtectedRoute><MyJobsPage /></ProtectedRoute>} />
          <Route path="/dashboard/reports" element={<ProtectedRoute><MyReportsPage /></ProtectedRoute>} />
          <Route path="/dashboard/reports/:id" element={<ProtectedRoute><ReportDetailsPage /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/modes" element={<ProtectedRoute><RoleApplicationsPage /></ProtectedRoute>} />
          <Route path="/dashboard/community-projects" element={<ProtectedRoute><MyCommunityProjectsPage /></ProtectedRoute>} />
          <Route path="/dashboard/community-project-pledges" element={<ProtectedRoute><MyCommunityPledgesPage /></ProtectedRoute>} />
          <Route path="/dashboard/products" element={<ProtectedRoute><Navigate to="/store" replace /></ProtectedRoute>} />
          <Route path="/dashboard/accommodation" element={<ProtectedRoute><Navigate to="/accommodation" replace /></ProtectedRoute>} />
          <Route path="/dashboard/saved" element={<ProtectedRoute><SavedItemsPage /></ProtectedRoute>} />
          <Route path="/saved-items" element={<ProtectedRoute><SavedItemsPage /></ProtectedRoute>} />
          <Route path="/dashboard/support" element={<ProtectedRoute><Navigate to="/settings" replace /></ProtectedRoute>} />
          <Route path="/dashboard/business-shortcuts" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
          <Route path="/dashboard/seller" element={<BusinessRoute><SellerDashboardPage /></BusinessRoute>} />
          <Route path="/dashboard/business" element={<BusinessRoute><BusinessDashboardPage /></BusinessRoute>} />
          <Route path="/dashboard/seller" element={<BusinessRoute><BusinessDashboardPage /></BusinessRoute>} />
          <Route path="/dashboard/business/profile" element={<BusinessRoute><DashboardWorkspacePage mode="business" path="/dashboard/business/profile" title="Business profile" description="Keep storefront details, public trust, and contact info complete." {...getDashboardWorkspaceData('/dashboard/business/profile')} /></BusinessRoute>} />
          <Route path="/dashboard/business/orders" element={<BusinessRoute><SellerOrdersPage /></BusinessRoute>} />
          <Route path="/dashboard/business/hire-items" element={<BusinessRoute><MyHireItemsPage /></BusinessRoute>} />
          <Route path="/dashboard/business/hire-bookings" element={<BusinessRoute><HireOwnerBookingsPage /></BusinessRoute>} />
          <Route path="/dashboard/business/promotions" element={<BusinessRoute><DashboardWorkspacePage mode="business" path="/dashboard/business/promotions" title="Promotions" description="Plan simple promotions, offers, and boosted visibility moments." {...getDashboardWorkspaceData('/dashboard/business/promotions')} /></BusinessRoute>} />
          <Route path="/dashboard/business/reviews" element={<BusinessRoute><DashboardWorkspacePage mode="business" path="/dashboard/business/reviews" title="Reviews" description="See customer trust signals and response opportunities." {...getDashboardWorkspaceData('/dashboard/business/reviews')} /></BusinessRoute>} />
          <Route path="/dashboard/business/analytics" element={<BusinessRoute><DashboardWorkspacePage mode="business" path="/dashboard/business/analytics" title="Business analytics" description="Track listing reach, enquiries, and promotion performance." {...getDashboardWorkspaceData('/dashboard/business/analytics')} /></BusinessRoute>} />
          <Route path="/dashboard/service-provider" element={<ServiceProviderRoute><ServiceProviderDashboardPage /></ServiceProviderRoute>} />
          <Route path="/dashboard/provider" element={<ServiceProviderRoute><ServiceProviderDashboardPage /></ServiceProviderRoute>} />
          <Route path="/dashboard/provider/requests" element={<ServiceProviderRoute><DashboardWorkspacePage mode="provider" path="/dashboard/provider/requests" title="Service requests" description="Keep new leads, follow-ups, and readiness queues visible." {...getDashboardWorkspaceData('/dashboard/provider/requests')} /></ServiceProviderRoute>} />
          <Route path="/dashboard/provider/bookings" element={<ServiceProviderRoute><DashboardWorkspacePage mode="provider" path="/dashboard/provider/bookings" title="Provider bookings" description="Track booking demand, readiness, and follow-up actions from one practical operations queue." {...getDashboardWorkspaceData('/dashboard/provider/bookings')} /></ServiceProviderRoute>} />
          <Route path="/dashboard/provider/reviews" element={<ServiceProviderRoute><DashboardWorkspacePage mode="provider" path="/dashboard/provider/reviews" title="Provider reviews" description="See customer ratings, trust signals, and fast-responder patterns." {...getDashboardWorkspaceData('/dashboard/provider/reviews')} /></ServiceProviderRoute>} />
          <Route path="/dashboard/provider/earnings" element={<ServiceProviderRoute><DashboardWorkspacePage mode="provider" path="/dashboard/provider/earnings" title="Provider earnings" description="Track booking income, outstanding work, and payout readiness in one practical finance view." {...getDashboardWorkspaceData('/dashboard/provider/earnings')} /></ServiceProviderRoute>} />
          <Route path="/provider-bookings" element={<ServiceProviderRoute><Navigate to="/dashboard/provider/bookings" replace /></ServiceProviderRoute>} />
          <Route path="/dashboard/organization" element={<OrganizationRoute><OrganizationDashboardPage /></OrganizationRoute>} />
          <Route path="/dashboard/organisation" element={<OrganizationRoute><OrganizationDashboardPage /></OrganizationRoute>} />
          <Route path="/dashboard/organisation/posts" element={<OrganizationRoute><DashboardWorkspacePage mode="organisation" path="/dashboard/organisation/posts" title="Organisation posts" description="Publish updates, highlight initiatives, and keep followers informed." {...getDashboardWorkspaceData('/dashboard/organisation/posts')} /></OrganizationRoute>} />
          <Route path="/dashboard/organisation/volunteers" element={<OrganizationRoute><DashboardWorkspacePage mode="organisation" path="/dashboard/organisation/volunteers" title="Volunteers" description="Track volunteer interest and participation readiness." {...getDashboardWorkspaceData('/dashboard/organisation/volunteers')} /></OrganizationRoute>} />
          <Route path="/dashboard/organisation/analytics" element={<OrganizationRoute><DashboardWorkspacePage mode="organisation" path="/dashboard/organisation/analytics" title="Organisation analytics" description="Follower, event, and post momentum in one clean view." {...getDashboardWorkspaceData('/dashboard/organisation/analytics')} /></OrganizationRoute>} />
          <Route path="/dashboard/municipality" element={<MunicipalityRoute><MunicipalityDashboardPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager" element={<MunicipalityRoute><MunicipalityDashboardPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/pending-approvals" element={<MunicipalityRoute><DashboardWorkspacePage mode="town_manager" path="/dashboard/town-manager/pending-approvals" title="Pending approvals" description="Review the approval queue across role applications, projects, rewards, and moderated content." {...getDashboardWorkspaceData('/dashboard/town-manager/pending-approvals')} /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-projects" element={<MunicipalityRoute><TownManagerCommunityProjectsPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-projects/:id" element={<MunicipalityRoute><TownManagerCommunityProjectReviewPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/emergencies" element={<MunicipalityRoute><DashboardWorkspacePage mode="town_manager" path="/dashboard/town-manager/emergencies" title="Emergency alerts" description="Keep emergency communications and active critical situations readable and operationally useful." {...getDashboardWorkspaceData('/dashboard/town-manager/emergencies')} /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-impact/pending" element={<MunicipalityRoute><CommunityImpactPendingPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/role-applications" element={<MunicipalityRoute><RoleApplicationsAdminPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-impact/rewards" element={<MunicipalityRoute><CommunityImpactRewardsManagePage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-impact/redemptions" element={<MunicipalityRoute><CommunityImpactRedemptionsAdminPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-impact/users/:userId" element={<MunicipalityRoute><CommunityImpactUserProfilePage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/feed/pending" element={<MunicipalityRoute><FeedModerationPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/business-verification" element={<MunicipalityRoute><DashboardWorkspacePage mode="town_manager" path="/dashboard/town-manager/business-verification" title="Business verification" description="Review business applications, documents, and trust status without leaving the operational dashboard." {...getDashboardWorkspaceData('/dashboard/town-manager/business-verification')} /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/service-providers" element={<MunicipalityRoute><DashboardWorkspacePage mode="town_manager" path="/dashboard/town-manager/service-providers" title="Service providers" description="Monitor service provider verification, coverage, and public readiness." {...getDashboardWorkspaceData('/dashboard/town-manager/service-providers')} /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/residents" element={<MunicipalityRoute><DashboardWorkspacePage mode="town_manager" path="/dashboard/town-manager/residents" title="Residents" description="A resident-facing operational view for account pressure, support trends, and current activity." {...getDashboardWorkspaceData('/dashboard/town-manager/residents')} /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/analytics" element={<MunicipalityRoute><DashboardWorkspacePage mode="town_manager" path="/dashboard/town-manager/analytics" title="Town analytics" description="Track workload, response time, issue pressure, and town engagement patterns." {...getDashboardWorkspaceData('/dashboard/town-manager/analytics')} /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/reports" element={<MunicipalityRoute><AdminReportsPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/reports/:id" element={<MunicipalityRoute><ReportDetailsPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/hire" element={<MunicipalityRoute><AdminHirePage variant="town" /></MunicipalityRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailsPage />} />
          <Route path="/article" element={<ArticleBrowserPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/calendar" element={<EventCalendarPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/events/:id/manage" element={<BusinessRoute><ManageEventPage /></BusinessRoute>} />
          <Route path="/events/:id/tickets" element={<BusinessRoute><EventTicketsPage /></BusinessRoute>} />
          <Route path="/dashboard/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
          <Route path="/dashboard/events/create" element={<EventPublisherRoute><CreateEventPage /></EventPublisherRoute>} />

          <Route path="/admin" element={<AdminRoute><SuperAdminDashboardPage /></AdminRoute>} />
          <Route path="/dashboard/admin" element={<AdminRoute><SuperAdminDashboardPage /></AdminRoute>} />
          <Route path="/dashboard/admin/towns" element={<AdminRoute><AdminTownsPage /></AdminRoute>} />
          <Route path="/dashboard/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
          <Route path="/dashboard/admin/hire" element={<AdminRoute><AdminHirePage /></AdminRoute>} />
          <Route path="/dashboard/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/dashboard/admin/role-applications" element={<AdminRoute><RoleApplicationsAdminPage /></AdminRoute>} />
          <Route path="/dashboard/admin/roles" element={<AdminRoute><RoleApplicationsAdminPage /></AdminRoute>} />
          <Route path="/dashboard/admin/system-health" element={<AdminRoute><AdminSystemHealthPage /></AdminRoute>} />
          <Route path="/dashboard/admin/feature-flags" element={<AdminRoute><AdminFeatureFlagsPage /></AdminRoute>} />
          <Route path="/dashboard/admin/feed-engine" element={<AdminRoute><FeedModerationPage /></AdminRoute>} />
          <Route path="/dashboard/admin/ai-logs" element={<AdminRoute><AdminAuditLogsPage /></AdminRoute>} />
          <Route path="/dashboard/admin/notifications" element={<AdminRoute><AdminNotificationsPage /></AdminRoute>} />
          <Route path="/dashboard/admin/audit-logs" element={<AdminRoute><AdminAuditLogsPage /></AdminRoute>} />
          <Route path="/dashboard/admin/rewards" element={<AdminRoute><CommunityImpactPendingPage /></AdminRoute>} />
          <Route path="/admin/providers" element={<AdminRoute><AdminProvidersPage /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
          <Route path="/admin/listings" element={<AdminRoute><AdminListingsPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/reports/:id" element={<AdminRoute><ReportDetailsPage /></AdminRoute>} />
          <Route path="/admin/role-applications" element={<AdminRoute><RoleApplicationsAdminPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/overview" element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
          <Route path="/admin/towns" element={<AdminRoute><Navigate to="/dashboard/admin/towns" replace /></AdminRoute>} />
          <Route path="/admin/system-health" element={<AdminRoute><Navigate to="/dashboard/admin/system-health" replace /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><Navigate to="/dashboard/admin/audit-logs" replace /></AdminRoute>} />
          <Route path="/admin/feature-flags" element={<AdminRoute><Navigate to="/dashboard/admin/feature-flags" replace /></AdminRoute>} />
        </Route>
      </Routes>
    </Suspense>
  )
}
