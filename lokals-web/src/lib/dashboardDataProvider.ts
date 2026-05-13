import { useQuery } from '@tanstack/react-query'
import {
  fetchAdminOverview,
  fetchCommunityProjects,
  fetchCourierDashboardData,
  fetchDashboardAdapterPayload,
  fetchDashboardWorkspaceResource,
  fetchDeliveries,
  fetchDriverDashboardData,
  fetchIssues,
  fetchMarketplace,
  fetchMessages,
  fetchNotifications,
  fetchResidentDashboardData,
  fetchResidentActivity,
  fetchRewards,
  fetchRides,
  fetchRoleDashboard,
  fetchServices,
  fetchTownManagerDashboardData,
  fetchTownManagerApprovals,
} from './dashboardApi'

export const useResidentActivityData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'resident-activity'],
    queryFn: fetchResidentActivity,
  })

export const useIssueSummaryData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'issues'],
    queryFn: fetchIssues,
  })

export const useRideSummaryData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'rides'],
    queryFn: fetchRides,
  })

export const useDeliverySummaryData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'deliveries'],
    queryFn: fetchDeliveries,
  })

export const useMarketplaceSummaryData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'marketplace'],
    queryFn: fetchMarketplace,
  })

export const useServiceSummaryData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'services'],
    queryFn: fetchServices,
  })

export const useCommunityProjectSummaryData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'community-projects'],
    queryFn: fetchCommunityProjects,
  })

export const useRewardSummaryData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'rewards'],
    queryFn: fetchRewards,
  })

export const useNotificationSummaryData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'notifications'],
    queryFn: fetchNotifications,
  })

export const useMessageSummaryData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'messages'],
    queryFn: fetchMessages,
  })

export const useTownManagerApprovalData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'town-manager-approvals'],
    queryFn: fetchTownManagerApprovals,
  })

export const useAdminOverviewData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'admin-overview'],
    queryFn: fetchAdminOverview,
  })

export const useRoleDashboardData = (role: string, endpoint: string) =>
  useQuery({
    queryKey: ['dashboard-adapter', role, endpoint],
    queryFn: () => fetchRoleDashboard(endpoint),
  })

export const useDashboardWorkspaceData = (path: string) =>
  useQuery({
    queryKey: ['dashboard-workspace-resource', path],
    queryFn: () => fetchDashboardWorkspaceResource(path),
  })

export const useDashboardAdapterPayload = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'payload'],
    queryFn: fetchDashboardAdapterPayload,
  })

export const useResidentDashboardData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'resident-dashboard'],
    queryFn: fetchResidentDashboardData,
  })

export const useTownManagerDashboardData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'town-manager-dashboard'],
    queryFn: fetchTownManagerDashboardData,
  })

export const useDriverOperationalData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'driver-dashboard'],
    queryFn: fetchDriverDashboardData,
  })

export const useCourierOperationalData = () =>
  useQuery({
    queryKey: ['dashboard-adapter', 'courier-dashboard'],
    queryFn: fetchCourierDashboardData,
  })
