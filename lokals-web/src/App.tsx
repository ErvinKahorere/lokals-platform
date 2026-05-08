import { lazy, Suspense, type ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/ui/AppShell'
import { SkeletonCard } from './components/ui/LoadingSkeleton'
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
import { AccountPlaceholderPage } from './pages/dashboard/AccountPlaceholderPage'
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
import { ServiceProviderDashboardPage } from './pages/dashboard/ServiceProviderDashboardPage'
import { SearchResultsPage } from './pages/SearchResultsPage'
import { ActivityPage } from './pages/ActivityPage'
import { SavedItemsPage } from './pages/dashboard/SavedItemsPage'
import { TownPortalPage } from './pages/TownPortalPage'
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
  return token ? children : <Navigate to="/login" replace />
}

function RootRoute() {
  const token = useAuthStore((state) => state.token)
  return token ? <HomePage /> : <LandingPage />
}

function AdminRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  const isAdmin = Boolean(user?.roles?.some((role) => ['super_admin', 'operator', 'municipality_admin', 'town_manager'].includes(role)))
  return isAdmin ? children : <Navigate to="/" replace />
}

function BusinessRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  const isBusinessUser = Boolean(user?.roles?.some((role) => ['seller', 'service_provider', 'business_owner', 'organization_admin', 'super_admin'].includes(role)))
  return isBusinessUser ? children : <Navigate to="/" replace />
}

function WorkerRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  const isWorker = Boolean(user?.roles?.some((role) => ['worker', 'super_admin'].includes(role)))
  return isWorker ? children : <Navigate to="/" replace />
}

function ServiceProviderRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  const isProvider = Boolean(user?.roles?.some((role) => ['service_provider', 'super_admin'].includes(role)))
  return isProvider ? children : <Navigate to="/" replace />
}

function MunicipalityRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  const isMunicipalityAdmin = Boolean(user?.roles?.some((role) => ['town_manager', 'municipality_admin', 'super_admin'].includes(role)))
  return isMunicipalityAdmin ? children : <Navigate to="/" replace />
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
  const isOrganizationAdmin = Boolean(user?.roles?.some((role) => ['organization_admin', 'super_admin'].includes(role)))
  return isOrganizationAdmin ? children : <Navigate to="/" replace />
}

function RouteFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<RootRoute />} />
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
          <Route path="/town/okahandja" element={<TownPortalPage />} />
          <Route path="/okahandja" element={<TownPortalPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/report-issue" element={<ProtectedRoute><ReportIssuePage /></ProtectedRoute>} />

          <Route path="/dashboard/feed" element={<ProtectedRoute><FollowingFeedPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/citizen" element={<ProtectedRoute><CitizenDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/worker" element={<WorkerRoute><WorkerDashboardPage /></WorkerRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/jobs" element={<ProtectedRoute><MyJobsPage /></ProtectedRoute>} />
          <Route path="/dashboard/reports" element={<ProtectedRoute><MyReportsPage /></ProtectedRoute>} />
          <Route path="/dashboard/reports/:id" element={<ProtectedRoute><ReportDetailsPage /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/products" element={<ProtectedRoute><AccountPlaceholderPage title="My Products" description="A dedicated saved and managed products area is being polished here." /></ProtectedRoute>} />
          <Route path="/dashboard/accommodation" element={<ProtectedRoute><AccountPlaceholderPage title="My Accommodation" description="Your accommodation ownership and listing shortcuts will live here." /></ProtectedRoute>} />
          <Route path="/dashboard/saved" element={<ProtectedRoute><SavedItemsPage /></ProtectedRoute>} />
          <Route path="/saved-items" element={<ProtectedRoute><SavedItemsPage /></ProtectedRoute>} />
          <Route path="/dashboard/support" element={<ProtectedRoute><AccountPlaceholderPage title="Help & Support" description="Support, issue reporting, and help resources are being organized here." /></ProtectedRoute>} />
          <Route path="/dashboard/business-shortcuts" element={<ProtectedRoute><AccountPlaceholderPage title="Manage My Business" description="This space will collect business, seller, provider, and organization shortcuts in one place." /></ProtectedRoute>} />
          <Route path="/dashboard/business" element={<BusinessRoute><BusinessDashboardPage /></BusinessRoute>} />
          <Route path="/dashboard/service-provider" element={<ServiceProviderRoute><ServiceProviderDashboardPage /></ServiceProviderRoute>} />
          <Route path="/dashboard/organization" element={<OrganizationRoute><OrganizationDashboardPage /></OrganizationRoute>} />
          <Route path="/dashboard/municipality" element={<MunicipalityRoute><MunicipalityDashboardPage /></MunicipalityRoute>} />
          <Route path="/dashboard/town-manager" element={<MunicipalityRoute><MunicipalityDashboardPage /></MunicipalityRoute>} />
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
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/overview" element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
        </Route>
      </Routes>
    </Suspense>
  )
}
