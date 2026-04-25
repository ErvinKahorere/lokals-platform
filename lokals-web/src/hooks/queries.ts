import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import type {
  AlertFeedItem,
  Booking,
  Accommodation,
  DeliveryItem,
  EventItem,
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
  BusinessDashboard,
  MunicipalityDashboard,
  NotificationItem,
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
    enabled: Boolean(useAuthStore.getState().token),
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
    queryFn: async () => toPaginated<Provider>((await api.get('/service-providers', { params })).data),
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
    queryFn: async () => toPaginated<Job>((await api.get('/jobs', { params })).data),
  })

export const useWorkers = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['workers', params],
    queryFn: async () => toPaginated<Worker>((await api.get('/workers', { params })).data),
  })

export const useDirectory = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['directory', params],
    queryFn: async () => toPaginated<Organization>((await api.get('/directory', { params })).data),
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
    queryFn: async () => toPaginated<any>((await api.get('/announcements', { params })).data),
  })

export const useAlertsFeed = () =>
  useQuery({
    queryKey: ['alerts-feed'],
    queryFn: async () => toPaginated<AlertFeedItem>((await api.get('/alerts/feed')).data),
  })

export const useEvents = () =>
  useQuery({
    queryKey: ['events'],
    queryFn: async () => toPaginated<EventItem>((await api.get('/events')).data),
  })

export const useSearchResults = (q?: string) =>
  useQuery({
    enabled: Boolean(q && q.trim()),
    queryKey: ['search', q],
    queryFn: async () => (await api.get('/search', { params: { q } })).data,
  })

export const usePreferences = () =>
  useQuery({
    enabled: Boolean(useAuthStore.getState().token),
    queryKey: ['preferences'],
    queryFn: async () => {
      const payload = (await api.get('/preferences')).data
      return (payload.preferences?.data ?? payload.preferences) as UserPreference
    },
  })

export const useProducts = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: async () => toPaginated<Product>((await api.get('/store/products', { params })).data),
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
    queryFn: async () => toPaginated<any>((await api.get('/store/sale-alerts')).data),
  })

export const useAccommodations = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['accommodations', params],
    queryFn: async () => toPaginated<Accommodation>((await api.get('/accommodations', { params })).data),
  })

export const useAccommodation = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['accommodation', id],
    queryFn: async () => unwrapOne<Accommodation>((await api.get(`/accommodations/${id}`)).data),
  })

export const useNotifications = () =>
  useQuery({
    enabled: Boolean(useAuthStore.getState().token),
    queryKey: ['notifications'],
    queryFn: async () => {
      const payload = (await api.get('/notifications')).data
      const list = payload?.data ?? []
      return list.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title ?? item.data?.title ?? item.type ?? 'Notification',
        body: item.body ?? item.data?.body ?? item.data?.message ?? 'You have an update.',
        target: item.target ?? item.data?.target,
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

export const useMunicipalityDashboard = () =>
  useQuery({
    queryKey: ['municipality-dashboard'],
    queryFn: async () => (await api.get('/admin/municipality-dashboard')).data as MunicipalityDashboard,
  })

export const useBusinessDashboard = () =>
  useQuery({
    queryKey: ['business-dashboard'],
    queryFn: async () => (await api.get('/dashboard/business')).data as BusinessDashboard,
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
      (await api.post('/deliveries', payload, payload instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined)).data as DeliveryItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deliveries'] })
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

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.put('/me', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export const useUploadProfileAvatar = () => {
  const queryClient = useQueryClient()

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
    onSuccess: async () => {
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
      await queryClient.invalidateQueries({ queryKey: ['my-reports'] })
    },
  })
}

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: number; status: string }) =>
      (await api.put(`/admin/reports/${reportId}/status`, { status })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
        queryClient.invalidateQueries({ queryKey: ['my-reports'] }),
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
