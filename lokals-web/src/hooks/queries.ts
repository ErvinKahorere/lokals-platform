import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { applyPilotLocation } from '../lib/pilot'
import { useAuthStore } from '../store/auth'
import type {
  AlertFeedItem,
  NewsItem,
  Booking,
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
} from '../types'

const toPaginated = <T,>(payload: any): PaginatedResult<T> => {
  if (Array.isArray(payload)) {
    return { data: payload }
  }

  if (payload?.data && Array.isArray(payload.data)) {
    return {
      data: payload.data,
      meta: payload.meta ?? {
        current_page: payload.current_page,
        last_page: payload.last_page,
        per_page: payload.per_page,
        total: payload.total,
      },
    }
  }

  if (payload?.data && payload.data.data && Array.isArray(payload.data.data)) {
    return {
      data: payload.data.data,
      meta: payload.data.meta,
    }
  }

  return { data: [] }
}

const unwrapOne = <T,>(payload: any): T => {
  if (payload?.data && !Array.isArray(payload.data)) {
    return payload.data as T
  }

  return payload as T
}

export const useFeed = () =>
  useQuery({
    queryKey: ['feed'],
    queryFn: async () => (await api.get('/feed')).data,
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
    queryFn: async () => toPaginated<any>((await api.get('/following-feed')).data),
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
    queryFn: async () => toPaginated<Worker>((await api.get('/workers', { params })).data),
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
    queryFn: async () => toPaginated<any>((await api.get(`/directory/${id}/alerts`)).data),
  })

export const useAnnouncements = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['announcements', params],
    queryFn: async () => toPaginated<any>((await api.get('/announcements', { params: applyPilotLocation(params) })).data),
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
  })

export const useRides = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['rides'],
    queryFn: async () => toPaginated<RideItem>((await api.get('/rides')).data),
  })

export const useRide = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['ride', id],
    queryFn: async () => unwrapOne<RideItem>((await api.get(`/rides/${id}`)).data),
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
    queryFn: async () => toPaginated<any>((await api.get('/store/sale-alerts', { params: applyPilotLocation() })).data),
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
      const list = payload?.data ?? []
      return list.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title ?? item.data?.title ?? item.type ?? 'Notification',
        body: item.body ?? item.data?.body ?? item.data?.message ?? 'You have an update.',
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

export const useMyBusinesses = () =>
  useQuery({
    queryKey: ['my-businesses'],
    queryFn: async () => toPaginated<Organization>((await api.get('/my-businesses')).data),
  })

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

export const useMyReports = () =>
  useQuery({
    queryKey: ['my-reports'],
    queryFn: async () => toPaginated<Report>((await api.get('/my-reports')).data),
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

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reportId, status, resolution_notes }: { reportId: number; status: string; resolution_notes?: string }) =>
      (await api.patch(`/reports/${reportId}/status`, { status, resolution_notes })).data,
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
