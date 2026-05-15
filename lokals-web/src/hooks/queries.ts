import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { api } from '../lib/api'
import { applyPilotLocation } from '../lib/pilot'
import { hasAnyAssignedRole } from '../lib/roles'
import { useAuthStore } from '../store/auth'
import type {
  AlertFeedItem,
  NewsItem,
  Booking,
  CommunityProject,
  CommunityProjectCategory,
  CommunityProjectPledge,
  Accommodation,
  DeliveryItem,
  EventItem,
  EventTicket,
  EventTicketType,
  FollowItem,
  Job,
  Listing,
  MePayload,
  ModerationFlag,
  Organization,
  OverviewMetrics,
  PaginatedResult,
  Product,
  Provider,
  Report,
  RoleDashboardPayload,
  RideItem,
  SavedItemsPayload,
  SosItem,
  BusinessDashboard,
  MunicipalityDashboard,
  NotificationItem,
  ActivityFeedPayload,
  UnifiedSearchResponse,
  Worker,
  UserPreference,
  RoleApplication,
  ModeSummary,
  CommunityImpactAccount,
  CommunityImpactDashboardPayload,
  CommunityImpactLeaderboardEntry,
  CommunityImpactRedemption,
  CommunityImpactReward,
  CommunityImpactTransaction,
  FeedCategory,
  FeedPost,
  UserFeedPreference,
  AiAssistRequest,
  SupportConversation,
  ConversationThread,
  ConversationMessage,
} from '../types'

type UnknownRecord = Record<string, unknown>
type SaleAlert = {
  id: number | string
  title?: string | null
  body?: string | null
  organization_id?: number | null
}
type NotificationApiItem = Partial<NotificationItem> & {
  data?: Partial<NotificationItem> & {
    title?: string
    body?: string
    message?: string
    target?: Partial<NotificationItem['target']>
  }
  target?: Partial<NotificationItem['target']>
}

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null

const toPaginated = <T,>(payload: unknown): PaginatedResult<T> => {
  if (Array.isArray(payload)) {
    return { data: payload as T[] }
  }

  if (isRecord(payload) && Array.isArray(payload.data)) {
    return {
      data: payload.data as T[],
      meta: (payload.meta as PaginatedResult<T>['meta']) ?? {
        current_page: Number(payload.current_page ?? 1),
        last_page: Number(payload.last_page ?? 1),
        per_page: Number(payload.per_page ?? (payload.data as unknown[]).length),
        total: Number(payload.total ?? (payload.data as unknown[]).length),
      },
    }
  }

  if (isRecord(payload) && isRecord(payload.data) && Array.isArray(payload.data.data)) {
    return {
      data: payload.data.data as T[],
      meta: payload.data.meta as PaginatedResult<T>['meta'],
    }
  }

  return { data: [] }
}

const unwrapOne = <T,>(payload: unknown): T => {
  if (isRecord(payload) && isRecord(payload.data) && !Array.isArray(payload.data)) {
    return payload.data as T
  }

  return payload as T
}

export const useFeed = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['feed', params],
    queryFn: async () => toPaginated<FeedPost>((await api.get('/feed', { params })).data),
  })

export const useMe = () =>
  useQuery({
    enabled: Boolean(useAuthStore((state) => state.token)),
    queryKey: ['me'],
    queryFn: async () => (await api.get('/me')).data as MePayload,
  })

export const useFollowingFeed = () =>
  useQuery({
    queryKey: ['following-feed'],
    queryFn: async () => toPaginated<UnknownRecord>((await api.get('/following-feed')).data),
  })

export const useProviders = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['providers', params],
    queryFn: async () => toPaginated<Provider>((await api.get('/service-providers', { params: applyPilotLocation(params) })).data),
  })

export const useProvider = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['provider', id],
    queryFn: async () => unwrapOne<Provider>((await api.get(`/service-providers/${id}`)).data),
  })

export const useListings = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['listings', params],
    queryFn: async () => toPaginated<Listing>((await api.get('/marketplace', { params })).data),
  })

export const useListing = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['listing', id],
    queryFn: async () => unwrapOne<Listing>((await api.get(`/marketplace/${id}`)).data),
  })

export const useJobs = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => toPaginated<Job>((await api.get('/jobs', { params: applyPilotLocation(params) })).data),
  })

export const useJob = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['job', id],
    queryFn: async () => unwrapOne<Job>((await api.get(`/jobs/${id}`)).data),
  })

export const useWorkers = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['workers', params],
    queryFn: async () => toPaginated<Worker>((await api.get('/workers', { params: applyPilotLocation(params) })).data),
  })

export const useWorker = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['worker', id],
    queryFn: async () => unwrapOne<Worker>((await api.get(`/workers/${id}`)).data),
  })

export const useDirectory = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['directory', params],
    queryFn: async () => toPaginated<Organization>((await api.get('/directory', { params: applyPilotLocation(params) })).data),
  })

export const useDirectoryDetails = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['directory-details', id],
    queryFn: async () => unwrapOne<Organization>((await api.get(`/directory/${id}`)).data),
  })

export const useDirectoryAlerts = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['directory-alerts', id],
    queryFn: async () => toPaginated<UnknownRecord>((await api.get(`/directory/${id}/alerts`)).data),
  })

export const useAnnouncements = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['announcements', params],
    queryFn: async () => toPaginated<UnknownRecord>((await api.get('/announcements', { params: applyPilotLocation(params) })).data),
  })

export const useAlertsFeed = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['alerts-feed', params],
    queryFn: async () => toPaginated<AlertFeedItem>((await api.get('/alerts/feed', { params: applyPilotLocation(params) })).data),
  })

export const useNews = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['news', params],
    queryFn: async () => toPaginated<NewsItem>((await api.get('/news', { params: applyPilotLocation(params) })).data),
  })

export const useNewsTrending = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['news-trending', params],
    queryFn: async () => toPaginated<NewsItem>((await api.get('/news/trending', { params: applyPilotLocation(params) })).data),
  })

export const useNewsLocal = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['news-local', params],
    queryFn: async () => toPaginated<NewsItem>((await api.get('/news/local', { params: applyPilotLocation(params) })).data),
  })

export const useNewsFeed = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['news-feed'],
    queryFn: async () => toPaginated<NewsItem>((await api.get('/news/feed', { params: applyPilotLocation() })).data),
  })

export const useNewsItem = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['news-item', id],
    queryFn: async () => (await api.get(`/news/${id}`)).data as { data: NewsItem; related: NewsItem[] },
  })

export const useEvents = (params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    queryKey: ['events', params],
    queryFn: async () => toPaginated<EventItem>((await api.get('/events', { params: applyPilotLocation(params) })).data),
  })

export const useEvent = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['event', id],
    queryFn: async () => (await api.get(`/events/${id}`)).data as { data: EventItem; related: EventItem[]; calendar: EventItem['calendar'] },
  })

export const useUpcomingEvents = (params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    queryKey: ['events-upcoming', params],
    queryFn: async () => toPaginated<EventItem>((await api.get('/events/upcoming', { params: applyPilotLocation(params) })).data),
  })

export const useNearbyEvents = (params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    queryKey: ['events-nearby', params],
    queryFn: async () => toPaginated<EventItem>((await api.get('/events/nearby', { params: applyPilotLocation(params) })).data),
  })

export const useEventCalendar = () =>
  useQuery({
    queryKey: ['events-calendar'],
    queryFn: async () => (await api.get('/events/calendar', { params: applyPilotLocation() })).data as { data: Array<{ date: string; events: EventItem[] }> },
  })

export const useMyEvents = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['my-events'],
    queryFn: async () => toPaginated<EventItem>((await api.get('/my/events')).data),
  })

export const useMyTickets = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['my-tickets'],
    queryFn: async () => toPaginated<EventTicket>((await api.get('/my/tickets')).data),
  })

export const useEventTickets = (eventId?: string, enabled = true) =>
  useQuery({
    enabled: enabled && Boolean(eventId),
    queryKey: ['event-tickets', eventId],
    queryFn: async () => (await api.get(`/events/${eventId}/tickets`)).data as { data: EventTicket[] },
  })

export const useSearchResults = (q?: string) =>
  useQuery({
    enabled: Boolean(q && q.trim()),
    queryKey: ['search', q],
    queryFn: async () => (await api.get('/search', { params: applyPilotLocation({ q }) })).data as UnifiedSearchResponse,
  })

export const useActivityFeed = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['activity-feed'],
    queryFn: async () => (await api.get('/activity')).data as ActivityFeedPayload,
  })

export const useSavedItems = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['saved-items'],
    queryFn: async () => (await api.get('/saved-items')).data as SavedItemsPayload,
  })

export const useCommunityProjectCategories = () =>
  useQuery({
    queryKey: ['community-project-categories'],
    queryFn: async () => toPaginated<CommunityProjectCategory>((await api.get('/community-project-categories')).data),
  })

export const useCommunityProjects = (params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    queryKey: ['community-projects', params],
    queryFn: async () => toPaginated<CommunityProject>((await api.get('/community-projects', { params: applyPilotLocation(params) })).data),
  })

export const useFeaturedCommunityProjects = () =>
  useQuery({
    queryKey: ['community-projects-featured'],
    queryFn: async () => toPaginated<CommunityProject>((await api.get('/community-projects/featured', { params: applyPilotLocation() })).data),
  })

export const useCommunityProject = (slug?: string) =>
  useQuery({
    enabled: Boolean(slug),
    queryKey: ['community-project', slug],
    queryFn: async () => unwrapOne<CommunityProject>((await api.get(`/community-projects/${slug}`)).data),
  })

export const useMyCommunityProjects = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['my-community-projects'],
    queryFn: async () => toPaginated<CommunityProject>((await api.get('/my/community-projects')).data),
  })

export const useMyCommunityPledges = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['my-community-pledges'],
    queryFn: async () => toPaginated<CommunityProjectPledge>((await api.get('/my/community-project-pledges')).data),
  })

export const useAdminCommunityProjects = (params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    queryKey: ['admin-community-projects', params],
    queryFn: async () => toPaginated<CommunityProject>((await api.get('/admin/community-projects', { params })).data),
  })

export const usePendingCommunityProjects = () =>
  useQuery({
    queryKey: ['admin-community-projects-pending'],
    queryFn: async () => toPaginated<CommunityProject>((await api.get('/admin/community-projects/pending')).data),
  })

export const useAdminCommunityProject = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['admin-community-project', id],
    queryFn: async () => unwrapOne<CommunityProject>((await api.get(`/admin/community-projects/${id}`)).data),
  })

export const usePreferences = () =>
  useQuery({
    enabled: Boolean(useAuthStore((state) => state.token)),
    queryKey: ['preferences'],
    queryFn: async () => {
      const payload = (await api.get('/preferences')).data
      return (payload.preferences?.data ?? payload.preferences) as UserPreference
    },
  })

export const useDeliveries = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['deliveries'],
    queryFn: async () => toPaginated<DeliveryItem>((await api.get('/deliveries')).data),
  })

export const useDelivery = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['delivery', id],
    queryFn: async () => unwrapOne<DeliveryItem>((await api.get(`/deliveries/${id}`)).data),
    retry: (failureCount, error) => {
      const status = (error as AxiosError)?.response?.status
      if (status === 401 || status === 403) {
        return false
      }

      return failureCount < 2
    },
  })

export const useRides = (enabled = true) =>
  useQuery({
    enabled: Boolean(enabled && useAuthStore((state) => state.token)),
    queryKey: ['rides'],
    queryFn: async () => toPaginated<RideItem>((await api.get('/rides')).data),
  })

export const useRide = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['ride', id],
    queryFn: async () => unwrapOne<RideItem>((await api.get(`/rides/${id}`)).data),
    retry: (failureCount, error) => {
      const status = (error as AxiosError)?.response?.status
      if (status === 401 || status === 403) {
        return false
      }

      return failureCount < 2
    },
  })

export const useSosFeed = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['sos-feed'],
    queryFn: async () => toPaginated<SosItem>((await api.get('/sos')).data),
  })

export const useProducts = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: async () => toPaginated<Product>((await api.get('/store/products', { params: applyPilotLocation(params) })).data),
  })

export const useProduct = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['product', id],
    queryFn: async () => unwrapOne<Product>((await api.get(`/store/products/${id}`)).data),
  })

export const useSaleAlerts = () =>
  useQuery({
    queryKey: ['sale-alerts'],
    queryFn: async () => toPaginated<SaleAlert>((await api.get('/store/sale-alerts', { params: applyPilotLocation() })).data),
  })

export const useAccommodations = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['accommodations', params],
    queryFn: async () => toPaginated<Accommodation>((await api.get('/accommodations', { params: applyPilotLocation(params) })).data),
  })

export const useAccommodation = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['accommodation', id],
    queryFn: async () => unwrapOne<Accommodation>((await api.get(`/accommodations/${id}`)).data),
  })

export const useNotifications = () =>
  useQuery({
    enabled: Boolean(useAuthStore((state) => state.token)),
    queryKey: ['notifications'],
    queryFn: async () => {
      const payload = (await api.get('/notifications')).data
      const list = (payload?.data ?? []) as NotificationApiItem[]
      return list.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title ?? item.data?.title ?? item.type ?? 'Notification',
        body: item.body ?? item.data?.body ?? item.data?.message ?? 'You have an update.',
        target_type: item.target_type ?? item.target?.type ?? item.data?.target_type,
        target_id: item.target_id ?? item.target?.id ?? item.data?.target_id,
        target: {
          id: item.target?.id ?? item.data?.target?.id,
          type: item.target?.type ?? item.data?.target?.type,
          href: item.target?.href ?? item.data?.target?.href,
          external_url: item.target?.external_url ?? item.data?.target?.external_url,
          source_name: item.target?.source_name ?? item.data?.target?.source_name,
          title: item.target?.title ?? item.data?.target?.title,
        },
        read_at: item.read_at,
        created_at: item.created_at,
        data: item.data,
      })) as NotificationItem[]
    },
  })

export const useMyBusinesses = () => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const enabled = Boolean(token && hasAnyAssignedRole(user, ['seller', 'business_owner', 'service_provider', 'organization_admin', 'municipality_admin', 'town_manager', 'super_admin']))

  return useQuery({
    enabled,
    queryKey: ['my-businesses'],
    queryFn: async () => toPaginated<Organization>((await api.get('/my-businesses')).data),
  })
}

export const useMyBookings = () =>
  useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => toPaginated<Booking>((await api.get('/bookings')).data),
  })

export const useProviderBookings = () =>
  useQuery({
    queryKey: ['provider-bookings'],
    queryFn: async () => toPaginated<Booking>((await api.get('/provider/bookings')).data),
  })

export const useMyListings = () =>
  useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => toPaginated<Listing>((await api.get('/my-listings')).data),
  })

export const useMyJobs = () =>
  useQuery({
    queryKey: ['my-jobs'],
    queryFn: async () => toPaginated<Job>((await api.get('/my-jobs')).data),
  })

export const useMyReports = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['my-reports', params],
    queryFn: async () => toPaginated<Report>((await api.get('/my-reports', { params })).data),
  })

export const useReport = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['report', id],
    queryFn: async () => unwrapOne<Report>((await api.get(`/reports/${id}`)).data),
  })

export const useFollows = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['follows'],
    queryFn: async () => toPaginated<FollowItem>((await api.get('/follow')).data),
  })

export const useAdminOverview = () =>
  useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => (await api.get('/admin/overview')).data as OverviewMetrics,
  })

export const useAdminReports = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['admin-reports', params],
    queryFn: async () => toPaginated<Report>((await api.get('/admin/reports', { params })).data),
  })

export const useBusinessDashboard = () =>
  useQuery({
    queryKey: ['business-dashboard'],
    queryFn: async () => (await api.get('/dashboard/business')).data as BusinessDashboard,
  })

export const useDashboardIndex = () =>
  useQuery({
    queryKey: ['dashboard-index'],
    queryFn: async () => (await api.get('/dashboard')).data as { role: string; dashboard_endpoint: string },
  })

export const useCitizenDashboard = () =>
  useQuery({
    queryKey: ['dashboard-citizen'],
    queryFn: async () => (await api.get('/dashboard/citizen')).data as RoleDashboardPayload,
  })

export const useWorkerDashboard = () =>
  useQuery({
    queryKey: ['dashboard-worker'],
    queryFn: async () => (await api.get('/dashboard/worker')).data as RoleDashboardPayload,
  })

export const useDriverDashboard = () =>
  useQuery({
    queryKey: ['dashboard-driver'],
    queryFn: async () => (await api.get('/dashboard/driver')).data as RoleDashboardPayload,
  })

export const useCourierDashboard = () =>
  useQuery({
    queryKey: ['dashboard-courier'],
    queryFn: async () => (await api.get('/dashboard/courier')).data as RoleDashboardPayload,
  })

export const useServiceProviderDashboard = () =>
  useQuery({
    queryKey: ['dashboard-service-provider'],
    queryFn: async () => (await api.get('/dashboard/service-provider')).data as RoleDashboardPayload,
  })

export const useOrganizationDashboard = () =>
  useQuery({
    queryKey: ['dashboard-organization'],
    queryFn: async () => (await api.get('/dashboard/organization')).data as RoleDashboardPayload,
  })

export const useTownManagerDashboard = () =>
  useQuery({
    queryKey: ['dashboard-municipality'],
    queryFn: async () => (await api.get('/dashboard/town-manager')).data as RoleDashboardPayload & MunicipalityDashboard,
  })

export const useSuperAdminDashboard = () =>
  useQuery({
    queryKey: ['dashboard-admin'],
    queryFn: async () => (await api.get('/dashboard/admin')).data as RoleDashboardPayload,
  })

export const useModerationFlags = () =>
  useQuery({
    queryKey: ['moderation-flags'],
    queryFn: async () => toPaginated<ModerationFlag>((await api.get('/admin/moderation-flags')).data),
  })

export const useCreateListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/listings', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['listings'] }),
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
      ])
    },
  })
}

export const useCreateCommunityProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FormData) => (await api.post('/community-projects', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['community-projects-featured'] }),
        queryClient.invalidateQueries({ queryKey: ['my-community-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-community-projects-pending'] }),
      ])
    },
  })
}

export const useCommunityImpactDashboard = () =>
  useQuery({
    queryKey: ['community-impact-dashboard'],
    queryFn: async () => (await api.get('/community-impact/me')).data as CommunityImpactDashboardPayload,
  })

export const useCommunityImpactTransactions = () =>
  useQuery({
    queryKey: ['community-impact-transactions'],
    queryFn: async () => toPaginated<CommunityImpactTransaction>((await api.get('/community-impact/my-transactions')).data),
  })

export const useCommunityImpactRewards = () =>
  useQuery({
    queryKey: ['community-impact-rewards'],
    queryFn: async () => toPaginated<CommunityImpactReward>((await api.get('/community-impact/rewards')).data),
  })

export const useCommunityImpactRedemptions = () =>
  useQuery({
    queryKey: ['community-impact-redemptions'],
    queryFn: async () => toPaginated<CommunityImpactRedemption>((await api.get('/community-impact/my-redemptions')).data),
  })

export const useCommunityImpactLeaderboard = (period = 'all_time') =>
  useQuery({
    queryKey: ['community-impact-leaderboard', period],
    queryFn: async () => ((await api.get('/community-impact/leaderboard', { params: { period } })).data?.data ?? []) as CommunityImpactLeaderboardEntry[],
  })

export const usePendingCommunityImpactTransactions = () =>
  useQuery({
    queryKey: ['admin-community-impact-pending'],
    queryFn: async () => toPaginated<CommunityImpactTransaction>((await api.get('/admin/community-impact/pending')).data),
  })

export const useCommunityImpactRedemptionsAdmin = () =>
  useQuery({
    queryKey: ['admin-community-impact-redemptions'],
    queryFn: async () => toPaginated<CommunityImpactRedemption>((await api.get('/admin/community-impact/redemptions')).data),
  })

export const useCommunityImpactUserProfile = (userId?: string) =>
  useQuery({
    enabled: Boolean(userId),
    queryKey: ['admin-community-impact-user', userId],
    queryFn: async () => (await api.get(`/admin/community-impact/users/${userId}`)).data as {
      user: { id: number; name: string; email?: string | null; phone?: string | null }
      account: { data: CommunityImpactAccount } | CommunityImpactAccount
      transactions: { data: CommunityImpactTransaction[] } | CommunityImpactTransaction[]
      redemptions: { data: CommunityImpactRedemption[] } | CommunityImpactRedemption[]
    },
  })

export const useCreateCommunityProjectPledge = (projectId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (!projectId) throw new Error('Project id is required')
      return (await api.post(`/community-projects/${projectId}/pledges`, payload)).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-project'] }),
        queryClient.invalidateQueries({ queryKey: ['my-community-pledges'] }),
      ])
    },
  })
}

export const useFollowCommunityProject = (projectId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error('Project id is required')
      return (await api.post(`/community-projects/${projectId}/follow`)).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-project'] }),
        queryClient.invalidateQueries({ queryKey: ['community-projects'] }),
      ])
    },
  })
}

export const useUnfollowCommunityProject = (projectId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error('Project id is required')
      return (await api.delete(`/community-projects/${projectId}/follow`)).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-project'] }),
        queryClient.invalidateQueries({ queryKey: ['community-projects'] }),
      ])
    },
  })
}

export const useCreateCommunityProjectUpdate = (projectId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FormData) => {
      if (!projectId) throw new Error('Project id is required')
      return (await api.post(`/community-projects/${projectId}/updates`, payload)).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-project'] }),
        queryClient.invalidateQueries({ queryKey: ['my-community-projects'] }),
      ])
    },
  })
}

export const useReviewCommunityProject = (projectId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      action,
      payload,
    }: {
      action: 'approve' | 'reject' | 'request-changes' | 'feature' | 'status'
      payload?: Record<string, unknown>
    }) => {
      if (!projectId) throw new Error('Project id is required')
      return (await api.patch(`/admin/community-projects/${projectId}/${action}`, payload ?? {})).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-community-project', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-community-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-community-projects-pending'] }),
        queryClient.invalidateQueries({ queryKey: ['community-projects'] }),
      ])
    },
  })
}

export const useCreateDelivery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FormData | Record<string, unknown>) =>
      unwrapOne<DeliveryItem>((await api.post('/deliveries', payload, payload instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined)).data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    },
  })
}

export const useCreateRide = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      unwrapOne<RideItem>((await api.post('/rides', payload)).data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rides'] })
    },
  })
}

export const useCreateSos = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      unwrapOne<SosItem>((await api.post('/sos', payload)).data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sos-feed'] })
    },
  })
}

export const usePreviewPostDraft = () =>
  useMutation({
    mutationFn: async (payload: FormData) =>
      (await api.post('/post-drafts/preview', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })).data,
  })

export const useFeedCategories = () =>
  useQuery({
    queryKey: ['feed-categories'],
    queryFn: async () => ((await api.get('/feed-categories')).data?.data ?? []) as FeedCategory[],
  })

export const useFeedPreferences = () =>
  useQuery({
    queryKey: ['feed-preferences'],
    queryFn: async () => (((await api.get('/my/feed-preferences')).data?.data ?? {}) as UserFeedPreference),
  })

export const useUpdateFeedPreferences = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.patch('/my/feed-preferences', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['feed-preferences'] })
    },
  })
}

export const useSaveFeedPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => (await api.post(`/feed/${id}/save`)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export const useHideFeedPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => (await api.post(`/feed/${id}/hide`)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export const useReportFeedPost = () => {
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => (await api.post(`/feed/${id}/report`, { reason })).data,
  })
}

export const usePendingFeedPosts = () =>
  useQuery({
    queryKey: ['admin-feed-pending'],
    queryFn: async () => ((await api.get('/admin/feed/pending')).data?.data ?? []) as FeedPost[],
  })

export const useCreateFeedPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/admin/feed', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-feed-pending'] })
    },
  })
}

export const useApproveFeedPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => (await api.patch(`/admin/feed/${id}/approve`, { notes })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-feed-pending'] }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
      ])
    },
  })
}

export const useRejectFeedPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => (await api.patch(`/admin/feed/${id}/reject`, { reason })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-feed-pending'] })
    },
  })
}

export const useFeatureFeedPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_featured }: { id: number; is_featured: boolean }) => (await api.patch(`/admin/feed/${id}/feature`, { is_featured })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-feed-pending'] }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
      ])
    },
  })
}

export const useAiAssist = (module: 'marketplace' | 'issue-report' | 'community-project' | 'business') =>
  useMutation({
    mutationFn: async (payload: FormData) =>
      (await api.post(`/ai/assist/${module}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })).data as { data: AiAssistRequest },
  })

export const useSupportConversations = () =>
  useQuery({
    queryKey: ['support-conversations'],
    queryFn: async () => ((await api.get('/support/conversations')).data?.data ?? []) as SupportConversation[],
  })

export const useSupportChat = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ message, conversationId }: { message: string; conversationId?: number }) =>
      (conversationId
        ? (await api.post(`/support/conversations/${conversationId}/messages`, { message })).data
        : (await api.post('/support/chat', { message })).data) as { data: SupportConversation },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['support-conversations'] })
    },
  })
}

export const useEscalateSupportConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ conversationId, reason, notes }: { conversationId: number; reason: string; notes?: string }) =>
      (await api.post(`/support/conversations/${conversationId}/escalate`, { reason, notes })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['support-conversations'] })
    },
  })
}

export const useConversations = () =>
  useQuery({
    queryKey: ['conversations'],
    queryFn: async () => toPaginated<ConversationThread>((await api.get('/conversations')).data),
  })

export const useConversation = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['conversation', id],
    queryFn: async () => (await api.get(`/conversations/${id}`)).data as { data: ConversationThread },
  })

export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { participant_ids: number[]; context?: string; subject?: string; message?: string }) =>
      (await api.post('/conversations', payload)).data as { data: ConversationThread },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useSendConversationMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ conversationId, body, messageType }: { conversationId: number; body: string; messageType?: string }) =>
      (await api.post(`/conversations/${conversationId}/messages`, { body, message_type: messageType ?? 'text' })).data as { data: ConversationMessage },
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['conversation', String(variables.conversationId)] })
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useMarkConversationMessageRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: number) => (await api.post(`/messages/${messageId}/read`)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.put('/me', payload)).data,
    onSuccess: async (payload) => {
      const nextUser = payload.user?.data ?? payload.user
      if (nextUser) {
        setUser(nextUser)
      }
      await queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export const useUploadProfileAvatar = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return (await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })).data
    },
    onSuccess: async (payload) => {
      const nextUser = payload.user?.data ?? payload.user
      if (nextUser) {
        setUser(nextUser)
      }
      await queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.put('/preferences', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['preferences'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
      ])
    },
  })
}

export const useSwitchRole = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (role: string) => (await api.post('/auth/switch-role', { role })).data,
    onSuccess: async (payload) => {
      const nextUser = payload.user?.data ?? payload.user
      if (nextUser) {
        setUser(nextUser)
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        queryClient.invalidateQueries({ queryKey: ['preferences'] }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-index'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-citizen'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-worker'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-service-provider'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-organization'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-municipality'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-admin'] }),
      ])
    },
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FormData | Record<string, unknown>) =>
      (await api.post('/store/products', payload, payload instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ])
    },
  })
}

export const useCreateAccommodation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FormData | Record<string, unknown>) =>
      (await api.post('/accommodations', payload, payload instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accommodations'] })
    },
  })
}

export const useCreateBusiness = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/my-businesses', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-businesses'] })
    },
  })
}

export const useCreateFollow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { type: 'organization' | 'service_provider'; id: number }) => (await api.post('/follow', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['follows'] }),
        queryClient.invalidateQueries({ queryKey: ['following-feed'] }),
      ])
    },
  })
}

export const useDeleteFollow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (followId: number) => (await api.delete(`/follow/${followId}`)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['follows'] }),
        queryClient.invalidateQueries({ queryKey: ['following-feed'] }),
      ])
    },
  })
}

export const useSaveItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { type: string; id: number | string }) => (await api.post('/saved-items', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['saved-items'] })
    },
  })
}

export const useRemoveSavedItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { type: string; id: number | string }) => (await api.delete('/saved-items', { data: payload })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['saved-items'] })
    },
  })
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/events', payload)).data as { data: EventItem },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['events-upcoming'] }),
        queryClient.invalidateQueries({ queryKey: ['events-calendar'] }),
        queryClient.invalidateQueries({ queryKey: ['my-events'] }),
        queryClient.invalidateQueries({ queryKey: ['business-dashboard'] }),
      ])
    },
  })
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: number; payload: Record<string, unknown> }) =>
      (await api.put(`/events/${eventId}`, payload)).data as { data: EventItem },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['event', String(variables.eventId)] }),
        queryClient.invalidateQueries({ queryKey: ['events-upcoming'] }),
        queryClient.invalidateQueries({ queryKey: ['events-calendar'] }),
        queryClient.invalidateQueries({ queryKey: ['my-events'] }),
        queryClient.invalidateQueries({ queryKey: ['business-dashboard'] }),
      ])
    },
  })
}

export const useSaveEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: number) => (await api.post(`/events/${eventId}/save`)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['event'] }),
      ])
    },
  })
}

export const useUnsaveEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: number) => (await api.delete(`/events/${eventId}/save`)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['event'] }),
      ])
    },
  })
}

export const useCreateEventReminder = () => {
  return useMutation({
    mutationFn: async ({ eventId, remind_at, channel }: { eventId: number; remind_at: string; channel?: 'in_app' | 'push' | 'sms' | 'email' }) =>
      (await api.post(`/events/${eventId}/reminders`, { remind_at, channel })).data,
  })
}

export const useReserveEventTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: number; payload: { ticket_type_id?: number; holder_name?: string; holder_phone?: string } }) =>
      (await api.post(`/events/${eventId}/tickets/reserve`, payload)).data as { data: EventTicket },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event', String(variables.eventId)] }),
        queryClient.invalidateQueries({ queryKey: ['my-tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['event-tickets', String(variables.eventId)] }),
        queryClient.invalidateQueries({ queryKey: ['business-dashboard'] }),
      ])
    },
  })
}

export const useCancelEventTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticketId: number) => (await api.post(`/tickets/${ticketId}/cancel`)).data as { data: EventTicket },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['event-tickets'] }),
      ])
    },
  })
}

export const useAddEventTicketType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: number; payload: Partial<EventTicketType> }) =>
      (await api.post(`/events/${eventId}/ticket-types`, payload)).data as { data: EventTicketType },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event', String(variables.eventId)] }),
        queryClient.invalidateQueries({ queryKey: ['my-events'] }),
      ])
    },
  })
}

export const useCheckInEventTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticketId: number) => (await api.post(`/tickets/${ticketId}/check-in`)).data as { data: EventTicket },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['event-tickets'] }),
      ])
    },
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => (await api.post('/notifications/mark-read')).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/notifications/${id}/read`)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useMyModes = () =>
  useQuery({
    queryKey: ['my-modes'],
    queryFn: async () => ((await api.get('/my/modes')).data?.data ?? {}) as ModeSummary,
  })

export const useMyRoleApplications = () =>
  useQuery({
    queryKey: ['my-role-applications'],
    queryFn: async () => toPaginated<RoleApplication>((await api.get('/my/role-applications')).data),
  })

export const useRoleApplication = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['my-role-application', id],
    queryFn: async () => unwrapOne<RoleApplication>((await api.get(`/my/role-applications/${id}`)).data),
  })

export const useCreateRoleApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FormData | Record<string, unknown>) =>
      (await api.post('/role-applications', payload, payload instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-role-applications'] }),
        queryClient.invalidateQueries({ queryKey: ['my-modes'] }),
      ])
    },
  })
}

export const useUpdateRoleApplication = (id?: number | string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FormData | Record<string, unknown>) => {
      if (!id) throw new Error('Role application id is required')
      return (await api.post(`/my/role-applications/${id}?_method=PATCH`, payload, payload instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined)).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-role-applications'] }),
        queryClient.invalidateQueries({ queryKey: ['my-role-application', String(id)] }),
      ])
    },
  })
}

export const useSubmitRoleApplication = (id?: number | string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (overrideId?: number | string) => {
      const targetId = overrideId ?? id
      if (!targetId) throw new Error('Role application id is required')
      return (await api.post(`/my/role-applications/${targetId}/submit`)).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-role-applications'] }),
        queryClient.invalidateQueries({ queryKey: ['my-role-application', String(id)] }),
        queryClient.invalidateQueries({ queryKey: ['my-modes'] }),
      ])
    },
  })
}

export const useUpdateCurrentMode = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (mode: string) => (await api.patch('/my/current-mode', { mode })).data,
    onSuccess: async (payload) => {
      const nextUser = payload.user?.data ?? payload.user
      if (nextUser) {
        setUser(nextUser)
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        queryClient.invalidateQueries({ queryKey: ['my-modes'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-index'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-driver'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-courier'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-worker'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-citizen'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-service-provider'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-organization'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-municipality'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-admin'] }),
      ])
    },
  })
}

export const useAdminRoleApplications = (params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    queryKey: ['admin-role-applications', params],
    queryFn: async () => toPaginated<RoleApplication>((await api.get('/admin/role-applications', { params })).data),
  })

export const useAdminRoleApplication = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['admin-role-application', id],
    queryFn: async () => unwrapOne<RoleApplication>((await api.get(`/admin/role-applications/${id}`)).data),
  })

export const useAdminRoleApplicationAction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, action, payload }: { id: number | string; action: 'approve' | 'reject' | 'request-changes'; payload?: Record<string, unknown> }) => {
      return (await api.patch(`/admin/role-applications/${id}/${action}`, payload ?? {})).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-role-applications'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-role-application'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-municipality'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-admin'] }),
      ])
    },
  })
}

export const useRedeemCommunityImpactReward = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rewardId: number) => (await api.post(`/community-impact/rewards/${rewardId}/redeem`)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-impact-redemptions'] }),
        queryClient.invalidateQueries({ queryKey: ['community-impact-dashboard'] }),
      ])
    },
  })
}

export const useUpdateCommunityImpactPrivacy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { public_leaderboard_opt_in: boolean; privacy_mode: string; public_display_name?: string | null }) =>
      (await api.patch('/community-impact/privacy-settings', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-impact-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['community-impact-leaderboard'] }),
      ])
    },
  })
}

export const useAwardCommunityImpact = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/admin/community-impact/award', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-community-impact-pending'] })
    },
  })
}

export const useApproveCommunityImpactTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, internal_notes }: { id: number; internal_notes?: string }) =>
      (await api.patch(`/admin/community-impact/transactions/${id}/approve`, { internal_notes })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-community-impact-pending'] }),
        queryClient.invalidateQueries({ queryKey: ['community-impact-dashboard'] }),
      ])
    },
  })
}

export const useRejectCommunityImpactTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, internal_notes }: { id: number; internal_notes?: string }) =>
      (await api.patch(`/admin/community-impact/transactions/${id}/reject`, { internal_notes })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-community-impact-pending'] })
    },
  })
}

export const useReverseCommunityImpactTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, internal_notes }: { id: number; internal_notes?: string }) =>
      (await api.patch(`/admin/community-impact/transactions/${id}/reverse`, { internal_notes })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-community-impact-pending'] })
    },
  })
}

export const useCreateCommunityImpactReward = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/admin/community-impact/rewards', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-impact-rewards'] }),
      ])
    },
  })
}

export const useUpdateCommunityImpactReward = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      (await api.patch(`/admin/community-impact/rewards/${id}`, payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-impact-rewards'] }),
      ])
    },
  })
}

export const useApproveCommunityImpactRedemption = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, fulfillment_notes }: { id: number; fulfillment_notes?: string }) =>
      (await api.patch(`/admin/community-impact/redemptions/${id}/approve`, { fulfillment_notes })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-community-impact-redemptions'] })
    },
  })
}

export const useFulfillCommunityImpactRedemption = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, fulfillment_notes }: { id: number; fulfillment_notes?: string }) =>
      (await api.patch(`/admin/community-impact/redemptions/${id}/fulfill`, { fulfillment_notes })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-community-impact-redemptions'] })
    },
  })
}

export const useRejectCommunityImpactRedemption = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, fulfillment_notes }: { id: number; fulfillment_notes?: string }) =>
      (await api.patch(`/admin/community-impact/redemptions/${id}/reject`, { fulfillment_notes })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-community-impact-redemptions'] })
    },
  })
}

export const useCreateJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/jobs', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['my-jobs'] }),
      ])
    },
  })
}

export const useApplyToJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, message }: { jobId: number; message?: string }) =>
      (await api.post(`/jobs/${jobId}/apply`, { message })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export const useCreateWorkerProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/worker-profile', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workers'] }),
        queryClient.invalidateQueries({ queryKey: ['worker'] }),
      ])
    },
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/bookings', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['provider-bookings'] }),
      ])
    },
  })
}

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) =>
      (await api.put(`/bookings/${bookingId}/status`, { status })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['provider-bookings'] }),
      ])
    },
  })
}

export const useCreateReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FormData | Record<string, unknown>) =>
      (await api.post('/reports', payload, payload instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-reports'] }),
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-citizen'] }),
      ])
    },
  })
}

export const useCancelRide = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ rideId, reason }: { rideId: number; reason?: string }) =>
      (await api.patch(`/rides/${rideId}/cancel`, reason ? { reason } : {})).data,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rides'] }),
        queryClient.invalidateQueries({ queryKey: ['ride', String(variables.rideId)] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-citizen'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-driver'] }),
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] }),
      ])
    },
  })
}

export const useRateRide = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ rideId, rating, comment }: { rideId: number; rating: number; comment?: string }) =>
      (await api.post(`/rides/${rideId}/rate`, { rating, comment })).data,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rides'] }),
        queryClient.invalidateQueries({ queryKey: ['ride', String(variables.rideId)] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-driver'] }),
      ])
    },
  })
}

export const useUpdateDriverAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (isOnline: boolean) => (await api.patch('/driver/availability', { is_online: isOnline })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard-driver'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-adapter', 'driver-dashboard'] }),
      ])
    },
  })
}

export const useDriverRideAction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      rideId,
      action,
    }: {
      rideId: number
      action: 'accept' | 'decline' | 'arrived' | 'start' | 'complete'
    }) => {
      const config = action === 'accept' || action === 'decline'
        ? { method: 'post' as const, url: `/driver/rides/${rideId}/${action}` }
        : { method: 'patch' as const, url: `/driver/rides/${rideId}/${action}` }
      return (await api.request({ method: config.method, url: config.url })).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rides'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-driver'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-adapter', 'driver-dashboard'] }),
      ])
    },
    onError: (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
      const status = error.response?.status
      if (status === 403) {
        throw new Error('You do not have permission to accept this ride, or your driver profile is not approved.')
      }
      if (status === 422) {
        throw new Error('This ride is no longer available. It may have been accepted by another driver.')
      }
      throw error
    },
  })
}

export const useCancelDelivery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ deliveryId, reason }: { deliveryId: number; reason?: string }) =>
      (await api.patch(`/deliveries/${deliveryId}/cancel`, reason ? { reason } : {})).data,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
        queryClient.invalidateQueries({ queryKey: ['delivery', String(variables.deliveryId)] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-citizen'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-courier'] }),
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] }),
      ])
    },
  })
}

export const useRateDelivery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ deliveryId, rating, comment }: { deliveryId: number; rating: number; comment?: string }) =>
      (await api.post(`/deliveries/${deliveryId}/rate`, { rating, comment })).data,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
        queryClient.invalidateQueries({ queryKey: ['delivery', String(variables.deliveryId)] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-courier'] }),
      ])
    },
  })
}

export const useUpdateCourierAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (isOnline: boolean) => (await api.patch('/courier/availability', { is_online: isOnline })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard-courier'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-adapter', 'courier-dashboard'] }),
      ])
    },
  })
}

export const useCourierDeliveryAction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      deliveryId,
      action,
    }: {
      deliveryId: number
      action: 'accept' | 'decline' | 'pickup-confirmed' | 'in-transit' | 'delivered'
    }) => {
      const config = action === 'accept' || action === 'decline'
        ? { method: 'post' as const, url: `/courier/deliveries/${deliveryId}/${action}` }
        : { method: 'patch' as const, url: `/courier/deliveries/${deliveryId}/${action}` }
      return (await api.request({ method: config.method, url: config.url })).data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-courier'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-adapter', 'courier-dashboard'] }),
      ])
    },
  })
}

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      resolution_notes,
      resident_note,
      internal_note,
      department_name,
      assigned_to,
    }: {
      reportId: number
      status: string
      resolution_notes?: string
      resident_note?: string
      internal_note?: string
      department_name?: string
      assigned_to?: number
    }) =>
      (await api.patch(`/reports/${reportId}/status`, {
        status,
        resolution_notes,
        resident_note,
        internal_note,
        department_name,
        assigned_to,
      })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
        queryClient.invalidateQueries({ queryKey: ['my-reports'] }),
        queryClient.invalidateQueries({ queryKey: ['report'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-municipality'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-citizen'] }),
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })
}

export const useAddReportUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reportId,
      note,
      status,
      visibility,
      department_name,
      assigned_to,
    }: {
      reportId: number
      note: string
      status?: string
      visibility?: 'resident' | 'internal'
      department_name?: string
      assigned_to?: number
    }) =>
      (await api.post(`/reports/${reportId}/updates`, {
        note,
        status,
        visibility,
        department_name,
        assigned_to,
      })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
        queryClient.invalidateQueries({ queryKey: ['my-reports'] }),
        queryClient.invalidateQueries({ queryKey: ['report'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-municipality'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-citizen'] }),
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })
}

export const useCreateMunicipalAlert = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/alerts', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['alerts-feed'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-municipality'] }),
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })
}

export const useSuspendContent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { target_type: 'listing' | 'provider'; target_id: number; status: string }) =>
      (await api.put('/admin/suspend', payload)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['listings'] }),
        queryClient.invalidateQueries({ queryKey: ['providers'] }),
      ])
    },
  })
}
