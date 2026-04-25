export type Role =
  | 'citizen'
  | 'worker'
  | 'seller'
  | 'business_owner'
  | 'driver'
  | 'service_provider'
  | 'organization_admin'
  | 'organization_representative'
  | 'municipality_admin'
  | 'operator'
  | 'super_admin'

export interface UserPreference {
  default_town?: string | null
  default_area?: string | null
  interests?: string[]
  preferred_roles?: string[]
  notification_preferences?: Record<string, boolean>
}

export interface Profile {
  bio?: string | null
  location?: string | null
  preferred_language?: string | null
  profession?: string | null
  business_name?: string | null
  default_town?: string | null
  default_area?: string | null
  whatsapp?: string | null
  secondary_phone?: string | null
  profile_visibility?: 'public' | 'private' | null
  avatar_url?: string | null
  onboarding_stage?: string | null
  completed_fields?: string[]
}

export interface User {
  id: number
  name: string
  phone: string
  email?: string | null
  location?: string | null
  default_town?: string | null
  default_area?: string | null
  service_radius?: number | null
  avatar?: string | null
  bio?: string | null
  whatsapp?: string | null
  secondary_phone?: string | null
  profession?: string | null
  business_name?: string | null
  profile_visibility?: 'public' | 'private' | null
  roles?: Role[]
  current_role?: Role | null
  profile?: Profile | null
  preferences?: UserPreference | null
}

export interface MePayload {
  user: User | { data: User }
  saved_addresses?: Array<{ id: number; label?: string | null }>
  enrichment?: { percentage?: number }
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta?: PaginationMeta
}

export interface ServiceItem {
  id: number
  service_provider_id: number
  organization_id?: number | null
  name: string
  description?: string | null
  duration_minutes: number
  price: string | number
  price_type?: string
  is_bookable?: boolean
  is_active: boolean
}

export interface AvailabilitySlot {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export interface Provider {
  id: number
  user_id?: number | null
  name: string
  category: string
  description?: string | null
  phone?: string | null
  avatar_url?: string | null
  whatsapp?: string | null
  location: string
  lat?: number | null
  lng?: number | null
  distance_km?: number | null
  is_verified: boolean
  status: string
  opening_hours?: Array<{ day?: string; open?: string; close?: string }> | null
  services?: ServiceItem[]
  availability_slots?: AvailabilitySlot[]
}

export interface Booking {
  id: number
  booking_date: string
  start_time: string
  end_time: string
  status: string
  notes?: string | null
  user?: User
  service?: ServiceItem
  service_provider?: Provider
}

export interface Listing {
  id: number
  type: string
  title: string
  description: string
  price?: string | number | null
  currency?: string | null
  location?: string | null
  lat?: number | null
  lng?: number | null
  distance_km?: number | null
  status: string
  metadata?: Record<string, unknown> | null
  image_url?: string | null
  organization?: Organization | null
  user?: User | null
}

export interface Job {
  id: number
  title: string
  description: string
  employment_type: string
  compensation?: string | number | null
  location?: string | null
  status: string
  skills?: string[]
  applications_count?: number
  organization?: Organization | null
  user?: User | null
  distance_km?: number | null
}

export interface Worker {
  id: number
  headline: string
  bio?: string | null
  location?: string | null
  rate?: string | number | null
  skills?: string[]
  is_available: boolean
  distance_km?: number | null
  user?: User
}

export interface Organization {
  id: number
  name: string
  category: string
  subcategory?: string | null
  description?: string | null
  phone?: string | null
  email?: string | null
  logo_url?: string | null
  whatsapp?: string | null
  location?: string | null
  town?: string | null
  area?: string | null
  distance_km?: number | null
  is_verified?: boolean
  status?: string
  emergency_contact?: boolean
  is_public_service?: boolean
  opening_hours?: Array<{ day?: string; open?: string; close?: string }> | null
  rates?: Array<{ name?: string; price?: string }> | null
  services_offered?: string[] | null
  followers_count?: number
  service_providers?: Provider[]
  services?: ServiceItem[]
}

export interface Report {
  id: number
  category: string
  title: string
  description: string
  location?: string | null
  priority?: string
  status: string
  user?: User
}

export interface AlertItem {
  id: number | string
  title: string
  body: string
  type?: string
  priority: string
  location?: string | null
  published_at?: string | null
  organization_id?: number | null
}

export interface AlertFeedItem {
  id: string
  source_type: string
  title: string
  body: string
  location?: string | null
  severity?: string | null
  timestamp?: string | null
  organization_id?: number | null
}

export interface EventItem {
  id: number
  title: string
  description?: string | null
  category: string
  location?: string | null
  starts_at?: string | null
  ends_at?: string | null
  is_featured?: boolean
}

export interface DeliveryItem {
  id: number
  pickup_address?: string | null
  pickup_location?: string | null
  dropoff_address?: string | null
  dropoff_location?: string | null
  item_description?: string | null
  parcel_description?: string | null
  parcel_size?: string | null
  estimated_price?: string | number | null
  photo_url?: string | null
  status?: string
}

export interface Product {
  id: number
  title: string
  description?: string | null
  price: string | number
  sale_price?: string | number | null
  image_url?: string | null
  category?: string | null
  town?: string | null
  area?: string | null
  stock_status?: string | null
  status?: string | null
  business?: Pick<Organization, 'id' | 'name' | 'category' | 'phone' | 'whatsapp' | 'logo_url'> | null
  user?: Pick<User, 'id' | 'name' | 'phone' | 'avatar' | 'business_name'> | null
}

export interface Accommodation {
  id: number
  type: string
  title: string
  description?: string | null
  price: string | number
  price_period?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  location?: string | null
  town?: string | null
  area?: string | null
  lat?: number | null
  lng?: number | null
  image_url?: string | null
  status?: string | null
  metadata?: Record<string, unknown> | null
  business?: Pick<Organization, 'id' | 'name' | 'category' | 'phone' | 'whatsapp'> | null
  user?: Pick<User, 'id' | 'name' | 'phone' | 'avatar'> | null
}

export interface FollowItem {
  id: number
  followable_type: string
  followable_id: number
  followable?: {
    id: number
    name?: string
    title?: string
    category?: string
  }
}

export interface NotificationItem {
  id: string
  type?: string
  title: string
  body: string
  read_at?: string | null
  created_at?: string | null
  target?: {
    id?: string | number | null
    type?: string | null
    href?: string | null
  }
  data?: Record<string, unknown>
}

export interface ModerationFlag {
  id: number
  reason: string
  status: string
  notes?: string | null
  flaggable_type?: string
  flaggable_id?: number
  user?: User
}

export interface OverviewMetrics {
  users: number
  listings: number
  jobs: number
  reports: number
  bookings: number
  providers: number
  active_alerts: number
  active_users?: number
  services_registered?: number
  products?: number
}

export interface MunicipalityDashboard {
  stats: Record<string, number | string>
  reports_by_status?: Array<{ status: string; count: number }> | Record<string, number>
  most_active_areas?: Array<{ area: string; total?: number; users?: number; reports?: number }>
  most_requested_services?: Array<{ category: string; total: number }>
  trending_issues?: Array<{ category: string; total: number }>
  recent_reports?: Report[]
  recent_alerts?: AlertItem[]
}

export interface BusinessDashboard {
  stats: Record<string, number | string>
  businesses?: Organization[]
  products?: Product[]
  services?: ServiceItem[]
  bookings?: Booking[]
  alerts?: AlertItem[]
}
