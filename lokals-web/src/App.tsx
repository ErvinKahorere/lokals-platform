import { Building2, Verified } from 'lucide-react'
import { lazy, Suspense, type ReactElement } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/ui/AppShell'
import { LoadingScreen } from './components/ui/LoadingSkeleton'
import { HomePage } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { RegisterPage } from './pages/RegisterPage'
import { DeliveryPage } from './pages/DeliveryPage'
import { DeliveryDetailsPage } from './pages/DeliveryDetailsPage'
import { DirectoryPage } from './pages/DirectoryPage'
import { MorePage } from './pages/MorePage'
import { ReportIssuePage } from './pages/ReportIssuePage'
import { RidePage } from './pages/RidePage'
import { RideDetailsPage } from './pages/RideDetailsPage'
import { SosPage } from './pages/SosPage'
import { SettingsPage } from './pages/SettingsPage'
import { AlertsPage } from './pages/AlertsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { NewsPage } from './pages/NewsPage'
import { NewsDetailsPage } from './pages/NewsDetailsPage'
import { ArticleBrowserPage } from './pages/ArticleBrowserPage'
import { CommunityProjectsPage } from './pages/CommunityProjectsPage'
import { CommunityProjectDetailsPage } from './pages/CommunityProjectDetailsPage'
import { SubmitCommunityProjectPage } from './pages/SubmitCommunityProjectPage'
import { MyCommunityProjectsPage } from './pages/MyCommunityProjectsPage'
import { MyCommunityPledgesPage } from './pages/MyCommunityPledgesPage'
import { TownManagerCommunityProjectsPage } from './pages/TownManagerCommunityProjectsPage'
import { TownManagerCommunityProjectReviewPage } from './pages/TownManagerCommunityProjectReviewPage'
import { FeedPage } from './pages/FeedPage'
import { InboxPage } from './pages/InboxPage'
import { ConversationPage } from './pages/ConversationPage'
import { EventsPage } from './pages/EventsPage'
import { EventDetailsPage } from './pages/EventDetailsPage'
import { EventCalendarPage } from './pages/EventCalendarPage'
import { CreateEventPage } from './pages/CreateEventPage'
import { ManageEventPage } from './pages/ManageEventPage'
import { EventTicketsPage } from './pages/EventTicketsPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { AccommodationDetailsPage } from './pages/AccommodationDetailsPage'
import { MyBookingsPage } from './pages/dashboard/MyBookingsPage'
import { MyTicketsPage } from './pages/dashboard/MyTicketsPage'
import { MyListingsPage } from './pages/dashboard/MyListingsPage'
import { MyJobsPage } from './pages/dashboard/MyJobsPage'
import { MyReportsPage } from './pages/dashboard/MyReportsPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { EditProfilePage } from './pages/dashboard/EditProfilePage'
import { AdminProvidersPage } from './pages/admin/AdminProvidersPage'
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage'
import { AdminListingsPage } from './pages/admin/AdminListingsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { MunicipalityDashboardPage } from './pages/admin/MunicipalityDashboardPage'
import { SuperAdminDashboardPage } from './pages/admin/SuperAdminDashboardPage'
import { FollowingFeedPage } from './pages/dashboard/FollowingFeedPage'
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { ReportDetailsPage } from './pages/dashboard/ReportDetailsPage'
import { BusinessDashboardPage } from './pages/dashboard/BusinessDashboardPage'
import { OrganizationDashboardPage } from './pages/dashboard/OrganizationDashboardPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { CitizenDashboardPage } from './pages/dashboard/CitizenDashboardPage'
import { WorkerDashboardPage } from './pages/dashboard/WorkerDashboardPage'
import { DriverDashboardPage } from './pages/dashboard/DriverDashboardPage'
import { CourierDashboardPage } from './pages/dashboard/CourierDashboardPage'
import { ServiceProviderDashboardPage } from './pages/dashboard/ServiceProviderDashboardPage'
import { SellerDashboardPage } from './pages/dashboard/SellerDashboardPage'
import { RoleApplicationsPage } from './pages/dashboard/RoleApplicationsPage'
import { RoleApplicationsAdminPage } from './pages/admin/RoleApplicationsAdminPage'
import { SearchResultsPage } from './pages/SearchResultsPage'
import { ActivityPage } from './pages/ActivityPage'
import { SavedItemsPage } from './pages/dashboard/SavedItemsPage'
import { TownPortalPage } from './pages/TownPortalPage'
import { CommunityImpactDashboardPage } from './pages/community/CommunityImpactDashboardPage'
import { CommunityImpactHistoryPage } from './pages/community/CommunityImpactHistoryPage'
import { CommunityImpactLeaderboardPage } from './pages/community/CommunityImpactLeaderboardPage'
import { CommunityImpactPrivacyPage } from './pages/community/CommunityImpactPrivacyPage'
import { CommunityImpactRedemptionsPage } from './pages/community/CommunityImpactRedemptionsPage'
import { CommunityImpactRewardsPage } from './pages/community/CommunityImpactRewardsPage'
import { CommunityImpactPendingPage } from './pages/admin/CommunityImpactPendingPage'
import { CommunityImpactRewardsManagePage } from './pages/admin/CommunityImpactRewardsManagePage'
import { CommunityImpactRedemptionsAdminPage } from './pages/admin/CommunityImpactRedemptionsPage'
import { CommunityImpactUserProfilePage } from './pages/admin/CommunityImpactUserProfilePage'
import { FeedModerationPage } from './pages/admin/FeedModerationPage'
import { FeaturePlaceholderPage } from './pages/FeaturePlaceholderPage'
import { SupportPage } from './pages/SupportPage'
import { getRoleHomePath, hasActiveRole } from './lib/roles'
import { useAuthStore } from './store/auth'

const MarketplacePage = lazy(async () => ({ default: (await import('./pages/MarketplacePage')).MarketplacePage }))
const StorePage = lazy(async () => ({ default: (await import('./pages/StorePage')).StorePage }))
const AccommodationPage = lazy(async () => ({ default: (await import('./pages/AccommodationPage')).AccommodationPage }))
const ServicesPage = lazy(async () => ({ default: (await import('./pages/ServicesPage')).ServicesPage }))
const ServiceProviderDetailsPage = lazy(async () => ({ default: (await import('./pages/ServiceProviderDetailsPage')).ServiceProviderDetailsPage }))
const BookingPage = lazy(async () => ({ default: (await import('./pages/BookingPage')).BookingPage }))
const WorkersPage = lazy(async () => ({ default: (await import('./pages/WorkersPage')).WorkersPage }))
const WorkerProfilePage = lazy(async () => ({ default: (await import('./pages/WorkerProfilePage')).WorkerProfilePage }))
const JobsPage = lazy(async () => ({ default: (await import('./pages/JobsPage')).JobsPage }))
const ListingDetailsPage = lazy(async () => ({ default: (await import('./pages/ListingDetailsPage')).ListingDetailsPage }))
const JobDetailsPage = lazy(async () => ({ default: (await import('./pages/JobDetailsPage')).JobDetailsPage }))
const DirectoryDetailsPage = lazy(async () => ({ default: (await import('./pages/DirectoryDetailsPage')).DirectoryDetailsPage }))

function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  return token ? children : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}`, prompt: 'Sign in to continue' }} />
}

function RootRoute() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const onboardingComplete = typeof window !== 'undefined' && window.localStorage.getItem('lokals-onboarding-complete') === 'true'
  if (!token && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return token ? <Navigate to={getRoleHomePath(user)} replace /> : <LandingPage />
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
          <Route path="/organizations" element={<ProtectedRoute><FeaturePlaceholderPage title="Organizations" description="A fuller organizations browser is being prepared. Use your followed organizations feed for now to keep community groups and updates close." ctaLabel="Open followed organizations" ctaTo="/dashboard/feed" icon={Building2} /></ProtectedRoute>} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/report-issue" element={<ProtectedRoute><ReportIssuePage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><FeaturePlaceholderPage title="Verification" description="Verification tools are being consolidated into a cleaner trust workflow. Use your profile page for identity and account updates in the meantime." ctaLabel="Open profile" ctaTo="/dashboard/profile" icon={Verified} /></ProtectedRoute>} />
          <Route path="/following-organizations" element={<ProtectedRoute><FollowingFeedPage /></ProtectedRoute>} />
          <Route path="/community-impact" element={<ProtectedRoute><CommunityImpactDashboardPage /></ProtectedRoute>} />
          <Route path="/community-impact/history" element={<ProtectedRoute><CommunityImpactHistoryPage /></ProtectedRoute>} />
          <Route path="/community-impact/rewards" element={<ProtectedRoute><CommunityImpactRewardsPage /></ProtectedRoute>} />
          <Route path="/community-impact/redemptions" element={<ProtectedRoute><CommunityImpactRedemptionsPage /></ProtectedRoute>} />
          <Route path="/community-impact/leaderboard" element={<ProtectedRoute><CommunityImpactLeaderboardPage /></ProtectedRoute>} />
          <Route path="/community-impact/privacy" element={<ProtectedRoute><CommunityImpactPrivacyPage /></ProtectedRoute>} />

          <Route path="/dashboard/feed" element={<ProtectedRoute><FollowingFeedPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/citizen" element={<ProtectedRoute><CitizenDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/worker" element={<WorkerRoute><WorkerDashboardPage /></WorkerRoute>} />
          <Route path="/dashboard/driver" element={<DriverRoute><DriverDashboardPage /></DriverRoute>} />
          <Route path="/dashboard/courier" element={<CourierRoute><CourierDashboardPage /></CourierRoute>} />
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
          <Route path="/dashboard/service-provider" element={<ServiceProviderRoute><ServiceProviderDashboardPage /></ServiceProviderRoute>} />
          <Route path="/dashboard/organization" element={<OrganizationRoute><OrganizationDashboardPage /></OrganizationRoute>} />
          <Route path="/dashboard/municipality" element={<MunicipalityRoute><MunicipalityDashboardPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager" element={<MunicipalityRoute><MunicipalityDashboardPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-projects" element={<MunicipalityRoute><TownManagerCommunityProjectsPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-projects/:id" element={<MunicipalityRoute><TownManagerCommunityProjectReviewPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-impact/pending" element={<MunicipalityRoute><CommunityImpactPendingPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/role-applications" element={<MunicipalityRoute><RoleApplicationsAdminPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-impact/rewards" element={<MunicipalityRoute><CommunityImpactRewardsManagePage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-impact/redemptions" element={<MunicipalityRoute><CommunityImpactRedemptionsAdminPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/community-impact/users/:userId" element={<MunicipalityRoute><CommunityImpactUserProfilePage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/feed/pending" element={<MunicipalityRoute><FeedModerationPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/reports" element={<MunicipalityRoute><AdminReportsPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager/reports/:id" element={<MunicipalityRoute><ReportDetailsPage /></MunicipalityRoute>} />
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
          <Route path="/admin/providers" element={<AdminRoute><AdminProvidersPage /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
          <Route path="/admin/listings" element={<AdminRoute><AdminListingsPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/reports/:id" element={<AdminRoute><ReportDetailsPage /></AdminRoute>} />
          <Route path="/admin/role-applications" element={<AdminRoute><RoleApplicationsAdminPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/overview" element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
        </Route>
      </Routes>
    </Suspense>
  )
}
