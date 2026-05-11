export type Role =
  | 'citizen'
  | 'worker'
  | 'seller'
  | 'business_owner'
  | 'driver'
  | 'service_provider'
  | 'organization_admin'
  | 'organization_representative'
  | 'town_manager'
  | 'municipality_admin'
  | 'operator'
  | 'super_admin'

export interface UserPreference {
  default_town?: string | null
  default_area?: string | null
  service_radius?: number | null
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
  stats?: {
    bookings?: number
    reports?: number
    jobs_applications?: number
    listings?: number
    products?: number
    accommodations?: number
    saved_items?: number
    tickets?: number
    follows?: number
    businesses?: number
  }
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
  organization_id?: number | null
  name: string
  category: string
  subcategory?: string | null
  description?: string | null
  about?: string | null
  phone?: string | null
  avatar_url?: string | null
  whatsapp?: string | null
  email?: string | null
  location: string
  town?: string | null
  area?: string | null
  lat?: number | null
  lng?: number | null
  distance_km?: number | null
  is_verified: boolean
  status: string
  open_now?: boolean
  availability_status?: string | null
  response_time_label?: string | null
  followers_count?: number
  review_count?: number
  rating?: number
  opening_hours?: Array<{ day?: string; open?: string; close?: string }> | null
  services?: ServiceItem[]
  availability_slots?: AvailabilitySlot[]
  alerts?: AlertItem[]
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
  experience_years?: number | null
  hourly_rate?: string | number | null
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
  open_now?: boolean
  availability_status?: string | null
  emergency_contact?: boolean
  is_public_service?: boolean
  opening_hours?: Array<{ day?: string; open?: string; close?: string }> | null
  rates?: Array<{ name?: string; price?: string }> | null
  services_offered?: string[] | null
  followers_count?: number
  review_count?: number
  rating?: number
  alerts?: AlertItem[]
  service_providers?: Provider[]
  services?: ServiceItem[]
}

export interface Report {
  id: number
  category: string
  title: string
  description: string
  location?: string | null
  town?: string | null
  area?: string | null
  priority?: string
  status: string
  resolution_notes?: string | null
  created_at?: string | null
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

export interface NewsItem {
  id: number
  title: string
  summary: string
  source_name: string
  source_url: string
  external_url: string
  image_url?: string | null
  category: string
  town?: string | null
  area?: string | null
  region?: string | null
  tags?: string[] | null
  is_featured?: boolean
  published_at?: string | null
  fetched_at?: string | null
  source_type: string
  source_domain?: string | null
  source_entity?: {
    type: 'organization' | 'service_provider'
    id: number
    name: string
    is_verified?: boolean
  } | null
  compliance_notice?: string | null
  feed_reason?: string | null
  feed_score?: number | null
}

export interface EventItem {
  id: number
  title: string
  description?: string | null
  category: string
  venue_name?: string | null
  location?: string | null
  location_label?: string | null
  town?: string | null
  area?: string | null
  lat?: number | null
  lng?: number | null
  starts_at?: string | null
  ends_at?: string | null
  image_url?: string | null
  status?: 'draft' | 'published' | 'cancelled' | 'completed'
  is_free?: boolean
  ticketing_enabled?: boolean
  capacity?: number | null
  metadata?: Record<string, unknown> | null
  is_featured?: boolean
  distance_km?: number | null
  attendees_count?: number
  saves_count?: number
  is_saved?: boolean
  ticket_price_from?: string | number | null
  ticket_price_to?: string | number | null
  organizer?: {
    type?: 'organization' | 'service_provider' | null
    id: number
    name: string
    phone?: string | null
    whatsapp?: string | null
    is_verified?: boolean
  } | null
  ticket_types?: EventTicketType[]
  calendar?: {
    ics_url: string
    title: string
    starts_at?: string | null
    ends_at?: string | null
    location?: string | null
  }
}

export interface EventTicketType {
  id: number
  name: string
  description?: string | null
  price?: string | number | null
  quantity_available?: number | null
  quantity_sold?: number
  sales_start_at?: string | null
  sales_end_at?: string | null
  is_active?: boolean
}

export interface EventTicket {
  id: number
  event_id: number
  ticket_type_id?: number | null
  user_id: number
  ticket_code: string
  status: 'reserved' | 'confirmed' | 'cancelled' | 'used' | 'expired'
  price_paid?: string | number | null
  holder_name?: string | null
  holder_phone?: string | null
  qr_code_payload?: string | null
  reserved_at?: string | null
  confirmed_at?: string | null
  used_at?: string | null
  event?: EventItem | null
  ticket_type?: Pick<EventTicketType, 'id' | 'name' | 'price'> | null
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
  notes?: string | null
  estimated_price?: string | number | null
  price?: string | number | null
  photo_url?: string | null
  status?: string
  created_at?: string | null
  updated_at?: string | null
  user?: Pick<User, 'id' | 'name' | 'phone'> | null
  driver?: Pick<User, 'id' | 'name' | 'phone'> | null
}

export interface RideItem {
  id: number
  pickup_location: string
  dropoff_location: string
  ride_type?: string | null
  trip_purpose?: string | null
  notes?: string | null
  fare_estimate?: string | number | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  user?: Pick<User, 'id' | 'name' | 'phone'> | null
  driver?: Pick<User, 'id' | 'name' | 'phone'> | null
}

export interface SosItem {
  id: number
  message: string
  emergency_type?: string | null
  location?: string | null
  town?: string | null
  area?: string | null
  status?: string | null
  created_at?: string | null
  user?: Pick<User, 'id' | 'name' | 'phone'> | null
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
  business?: Pick<Organization, 'id' | 'name' | 'category' | 'phone' | 'whatsapp' | 'logo_url' | 'is_verified' | 'town' | 'area' | 'location'> | null
  user?: Pick<User, 'id' | 'name' | 'phone' | 'avatar' | 'business_name' | 'whatsapp' | 'default_town' | 'default_area' | 'location'> | null
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
  created_at?: string | null
  updated_at?: string | null
  is_verified_owner?: boolean
  owner?: {
    type?: string | null
    id?: number | null
    name?: string | null
    phone?: string | null
    whatsapp?: string | null
    avatar?: string | null
    is_verified?: boolean
    location?: string | null
  } | null
  business?: Pick<Organization, 'id' | 'name' | 'category' | 'phone' | 'whatsapp' | 'logo_url' | 'town' | 'area' | 'is_verified'> | null
  user?: Pick<User, 'id' | 'name' | 'phone' | 'whatsapp' | 'avatar' | 'location' | 'default_town' | 'default_area'> | null
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
  target_type?: string | null
  target_id?: string | number | null
  read_at?: string | null
  created_at?: string | null
  target?: {
    id?: string | number | null
    type?: string | null
    href?: string | null
    external_url?: string | null
    source_name?: string | null
    title?: string | null
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
  events?: number
  event_tickets?: number
  active_alerts: number
  active_users?: number
  services_registered?: number
  products?: number
}

export interface MunicipalityDashboard {
  stats: Record<string, number | string>
  reports_by_status?: Array<{ status: string; count: number }> | Record<string, number>
  recent_reports?: Report[]
  active_alerts?: AlertItem[]
  upcoming_events?: EventItem[]
  most_active_areas?: Array<{ area: string; total?: number; users?: number; reports?: number }>
  most_requested_services?: Array<{ category: string; total: number }>
  trending_issues?: Array<{ category: string; total: number }>
  recent_alerts?: AlertItem[]
}

export interface BusinessDashboard {
  stats: Record<string, number | string>
  businesses?: Organization[]
  products?: Product[]
  services?: ServiceItem[]
  bookings?: Booking[]
  alerts?: AlertItem[]
  events?: EventItem[]
}

export interface DashboardQuickAction {
  label: string
  href: string
  icon?: string
}

export interface DashboardPendingTask {
  label: string
  count: number
}

export interface DashboardActivityItem {
  type: string
  title: string
  body: string
  timestamp?: string | null
}

export interface RoleDashboardPayload {
  role: string
  stats: Record<string, number | string>
  quick_actions: DashboardQuickAction[]
  pending_tasks: DashboardPendingTask[]
  recent_activity: DashboardActivityItem[]
  [key: string]: unknown
}

export interface UnifiedSearchResult {
  id: number | string
  title?: string
  name?: string
  category?: string | null
  summary?: string | null
  description?: string | null
  location?: string | null
  town?: string | null
  area?: string | null
  status?: string | null
  price?: string | number | null
  sale_price?: string | number | null
  starts_at?: string | null
  published_at?: string | null
  source_name?: string | null
}

export interface UnifiedSearchResponse {
  services: UnifiedSearchResult[]
  providers: UnifiedSearchResult[]
  directory: UnifiedSearchResult[]
  products: UnifiedSearchResult[]
  jobs: UnifiedSearchResult[]
  events: UnifiedSearchResult[]
  news: UnifiedSearchResult[]
  accommodations: UnifiedSearchResult[]
  listings?: UnifiedSearchResult[]
  alerts?: UnifiedSearchResult[]
}

export interface ActivityItem {
  type: string
  title: string
  body: string
  status?: string | null
  timestamp?: string | null
  route: string
}

export interface ActivityFeedPayload {
  summary: Record<string, number>
  data: ActivityItem[]
}

export interface SavedItemEntry {
  kind: string
  group: string
  id: number | string
  title: string
  subtitle?: string | null
  town?: string | null
  area?: string | null
  image_url?: string | null
  route: string
  saved_at?: string | null
}

export interface SavedItemsPayload {
  counts: Record<string, number>
  items: SavedItemEntry[]
  products: SavedItemEntry[]
  accommodations: SavedItemEntry[]
  events: SavedItemEntry[]
  providers: SavedItemEntry[]
  directory: SavedItemEntry[]
  news: SavedItemEntry[]
  listings: SavedItemEntry[]
}
