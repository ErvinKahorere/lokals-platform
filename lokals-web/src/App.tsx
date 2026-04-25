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
import { DirectoryPage } from './pages/DirectoryPage'
import { MorePage } from './pages/MorePage'
import { ReportIssuePage } from './pages/ReportIssuePage'
import { RidePage } from './pages/RidePage'
import { SosPage } from './pages/SosPage'
import { SettingsPage } from './pages/SettingsPage'
import { AlertsPage } from './pages/AlertsPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { AccommodationDetailsPage } from './pages/AccommodationDetailsPage'
import { MyBookingsPage } from './pages/dashboard/MyBookingsPage'
import { MyListingsPage } from './pages/dashboard/MyListingsPage'
import { MyJobsPage } from './pages/dashboard/MyJobsPage'
import { MyReportsPage } from './pages/dashboard/MyReportsPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { AdminProvidersPage } from './pages/admin/AdminProvidersPage'
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage'
import { AdminListingsPage } from './pages/admin/AdminListingsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { MunicipalityDashboardPage } from './pages/admin/MunicipalityDashboardPage'
import { SuperAdminDashboardPage } from './pages/admin/SuperAdminDashboardPage'
import { FollowingFeedPage } from './pages/dashboard/FollowingFeedPage'
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { BusinessDashboardPage } from './pages/dashboard/BusinessDashboardPage'
import { OrganizationDashboardPage } from './pages/dashboard/OrganizationDashboardPage'
import { useAuthStore } from './store/auth'

const MarketplacePage = lazy(async () => ({ default: (await import('./pages/MarketplacePage')).MarketplacePage }))
const StorePage = lazy(async () => ({ default: (await import('./pages/StorePage')).StorePage }))
const AccommodationPage = lazy(async () => ({ default: (await import('./pages/AccommodationPage')).AccommodationPage }))
const ServicesPage = lazy(async () => ({ default: (await import('./pages/ServicesPage')).ServicesPage }))
const ServiceProviderDetailsPage = lazy(async () => ({ default: (await import('./pages/ServiceProviderDetailsPage')).ServiceProviderDetailsPage }))
const BookingPage = lazy(async () => ({ default: (await import('./pages/BookingPage')).BookingPage }))
const WorkersPage = lazy(async () => ({ default: (await import('./pages/WorkersPage')).WorkersPage }))
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
  const isAdmin = Boolean(user?.roles?.some((role) => ['super_admin', 'operator', 'municipality_admin'].includes(role)))
  return isAdmin ? children : <Navigate to="/" replace />
}

function BusinessRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  const isBusinessUser = Boolean(user?.roles?.some((role) => ['seller', 'service_provider', 'business_owner', 'organization_admin', 'super_admin'].includes(role)))
  return isBusinessUser ? children : <Navigate to="/" replace />
}

function MunicipalityRoute({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user)
  const isMunicipalityAdmin = Boolean(user?.roles?.some((role) => ['municipality_admin', 'super_admin'].includes(role)))
  return isMunicipalityAdmin ? children : <Navigate to="/" replace />
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
          <Route path="/ride" element={<RidePage />} />
          <Route path="/sos" element={<SosPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/directory/:id" element={<DirectoryDetailsPage />} />
          <Route path="/report-issue" element={<ProtectedRoute><ReportIssuePage /></ProtectedRoute>} />

          <Route path="/dashboard/feed" element={<ProtectedRoute><FollowingFeedPage /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><FollowingFeedPage /></ProtectedRoute>} />
          <Route path="/dashboard/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/jobs" element={<ProtectedRoute><MyJobsPage /></ProtectedRoute>} />
          <Route path="/dashboard/reports" element={<ProtectedRoute><MyReportsPage /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/business" element={<BusinessRoute><BusinessDashboardPage /></BusinessRoute>} />
          <Route path="/dashboard/organization" element={<OrganizationRoute><OrganizationDashboardPage /></OrganizationRoute>} />
          <Route path="/dashboard/municipality" element={<MunicipalityRoute><MunicipalityDashboardPage /></MunicipalityRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><SuperAdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/providers" element={<AdminRoute><AdminProvidersPage /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
          <Route path="/admin/listings" element={<AdminRoute><AdminListingsPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/overview" element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
        </Route>
      </Routes>
    </Suspense>
  )
}
