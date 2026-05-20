export type Role =
  | 'citizen'
  | 'worker'
  | 'seller'
  | 'business_owner'
  | 'driver'
  | 'courier'
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

export interface RoleApplication {
  id: number
  user_id: number
  requested_role: Role | string
  status: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected' | 'changes_requested' | 'suspended'
  full_name: string
  phone: string
  email?: string | null
  town_name?: string | null
  city_name?: string | null
  address?: string | null
  national_id_number?: string | null
  license_number?: string | null
  vehicle_registration?: string | null
  vehicle_type?: string | null
  service_category?: string | null
  organisation_name?: string | null
  business_name?: string | null
  documents?: Array<{
    name?: string | null
    file_name?: string | null
    mime_type?: string | null
    size?: number | null
    url?: string | null
    uploaded_at?: string | null
  }>
  notes?: string | null
  rejection_reason?: string | null
  approved_at?: string | null
  submitted_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  user?: Pick<User, 'id' | 'name' | 'phone' | 'email'> | null
  approver?: Pick<User, 'id' | 'name'> | null
  approval_logs?: Array<{
    id: number
    action: string
    reason?: string | null
    created_at?: string | null
    actor?: Pick<User, 'id' | 'name'> | null
  }>
}

export interface ModeSummary {
  current_mode: Role | string
  available_modes: Array<Role | string>
  pending_modes: RoleApplication[]
  can_apply_for: Array<Role | string>
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
  availability_code?: string | null
  availability?: {
    code?: string | null
    label?: string | null
    is_open?: boolean
    closing_soon?: boolean
    busy?: boolean
    paused?: boolean
    pickup_only?: boolean
    supports_delivery?: boolean
  } | null
  response_time_label?: string | null
  delivery_fee?: string | number | null
  delivery_eta_minutes?: number | null
  fast_delivery?: boolean
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
  availability_code?: string | null
  availability?: {
    code?: string | null
    label?: string | null
    is_open?: boolean
    closing_soon?: boolean
    busy?: boolean
    paused?: boolean
    pickup_only?: boolean
    supports_delivery?: boolean
  } | null
  commerce_category?: string | null
  delivery_fee?: string | number | null
  delivery_eta_minutes?: number | null
  fast_delivery?: boolean
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
  reference_code?: string | null
  category: string
  title: string
  description: string
  photo_url?: string | null
  location?: string | null
  town?: string | null
  area?: string | null
  lat?: number | null
  lng?: number | null
  priority?: string
  status: string
  department_name?: string | null
  resolution_notes?: string | null
  internal_notes?: string | null
  created_at?: string | null
  updated_at?: string | null
  user?: User
  assigned_officer?: Pick<User, 'id' | 'name' | 'phone' | 'email'> | null
  attachments?: ReportAttachment[]
  updates?: ReportUpdate[]
}

export interface ReportAttachment {
  id: number
  file_url?: string | null
  mime_type?: string | null
  file_type: 'image' | 'video' | 'audio' | 'document'
  original_name?: string | null
  size?: number | null
  created_at?: string | null
}

export interface ReportUpdate {
  id: number
  type: string
  visibility: 'resident' | 'internal'
  from_status?: string | null
  to_status?: string | null
  message: string
  meta?: Record<string, unknown> | null
  created_at?: string | null
  user?: Pick<User, 'id' | 'name'> | null
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
  pickup_latitude?: number | null
  pickup_longitude?: number | null
  dropoff_address?: string | null
  dropoff_location?: string | null
  dropoff_latitude?: number | null
  dropoff_longitude?: number | null
  item_description?: string | null
  parcel_description?: string | null
  parcel_size?: string | null
  weight_kg?: string | number | null
  urgency?: string | null
  notes?: string | null
  estimated_price?: string | number | null
  price?: string | number | null
  photo_url?: string | null
  status?: string
  cancel_reason?: string | null
  rating?: number | null
  rating_comment?: string | null
  assigned_at?: string | null
  picked_up_at?: string | null
  in_transit_at?: string | null
  delivered_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  user?: Pick<User, 'id' | 'name' | 'phone'> | null
  driver?: Pick<User, 'id' | 'name' | 'phone'> | null
  courier_profile?: {
    vehicle_type?: string | null
    vehicle_registration?: string | null
    rating?: number | null
    is_online?: boolean
    is_verified?: boolean
  } | null
  reference_code?: string | null
  status_label?: string | null
  tracking_status?: string | null
  estimated_distance_km?: number | null
  estimated_duration_minutes?: number | null
  map_url?: string | null
  proof_of_delivery?: {
    status?: string | null
    label?: string | null
  } | null
  timeline?: Array<{
    key: string
    label: string
    timestamp?: string | null
  }>
}

export interface OrderLineItem {
  id: number
  product_id?: number | null
  name: string
  quantity: number
  unit_price: string | number
  total_price: string | number
  notes?: string | null
  product?: {
    id: number
    title: string
    image_url?: string | null
  } | null
}

export interface OrderRecord {
  id: number
  reference_code?: string | null
  status: string
  status_label?: string | null
  tracking_status?: string | null
  next_action_label?: string | null
  estimated_arrival_minutes?: number | null
  customer?: Pick<User, 'id' | 'name' | 'phone' | 'avatar' | 'default_town' | 'default_area'> | null
  seller?: Pick<Organization, 'id' | 'name' | 'category' | 'phone' | 'whatsapp' | 'logo_url' | 'town' | 'area' | 'location' | 'is_verified' | 'delivery_fee' | 'delivery_eta_minutes' | 'availability_status' | 'open_now'> | null
  business?: Pick<Organization, 'id' | 'name' | 'category' | 'phone' | 'whatsapp' | 'logo_url' | 'town' | 'area' | 'location' | 'is_verified' | 'delivery_fee' | 'delivery_eta_minutes' | 'availability_status' | 'open_now'> | null
  courier?: Pick<User, 'id' | 'name' | 'phone' | 'avatar'> | null
  items: OrderLineItem[]
  totals?: {
    subtotal?: string | number | null
    delivery_fee?: string | number | null
    service_fee?: string | number | null
    total?: string | number | null
  }
  payment_method?: string | null
  payment_status?: string | null
  notes?: string | null
  delivery_location?: {
    address?: string | null
    latitude?: number | null
    longitude?: number | null
    town?: string | null
    area?: string | null
  } | null
  pickup_location?: {
    address?: string | null
    latitude?: number | null
    longitude?: number | null
  } | null
  customer_rating?: number | null
  customer_rating_comment?: string | null
  support_shortcuts?: {
    key: string
    label: string
  }[]
  timeline?: Array<{
    key: string
    label: string
    timestamp?: string | null
  }>
  tracking_steps?: Array<{
    key: string
    label: string
    state?: string | null
    timestamp?: string | null
    is_complete?: boolean
    is_current?: boolean
  }>
  reorder_payload?: {
    business_id?: number | null
    items?: Array<{
      product_id?: number | null
      quantity?: number | null
      name?: string | null
    }>
  } | null
  created_at?: string | null
  updated_at?: string | null
}

export interface HireItemRecord {
  id: number
  title: string
  description?: string | null
  category: string
  owner?: Pick<User, 'id' | 'name' | 'phone' | 'avatar' | 'default_town' | 'default_area'> | null
  business?: Pick<Organization, 'id' | 'name' | 'category' | 'phone' | 'whatsapp' | 'logo_url' | 'town' | 'area' | 'location' | 'is_verified'> | null
  town?: string | null
  area?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  prices?: {
    price_per_hour?: string | number | null
    price_per_day?: string | number | null
  }
  deposit?: string | number | null
  replacement_value?: string | number | null
  delivery_available?: boolean
  pickup_available?: boolean
  condition?: string | null
  status?: string | null
  verification_status?: string | null
  images?: string[]
  rules?: string[]
  included_items?: string[]
  rating?: number | null
  bookings_count?: number | null
  availability_summary?: {
    available?: boolean
    requested_window_available?: boolean
    next_available_at?: string | null
    status?: string | null
    verification_status?: string | null
  } | null
  created_at?: string | null
}

export interface HireBookingRecord {
  id: number
  reference_code?: string | null
  item?: HireItemRecord | null
  customer?: Pick<User, 'id' | 'name' | 'phone' | 'avatar' | 'default_town' | 'default_area'> | null
  owner?: Pick<User, 'id' | 'name' | 'phone' | 'avatar' | 'default_town' | 'default_area'> | null
  courier?: Pick<User, 'id' | 'name' | 'phone' | 'avatar'> | null
  status: string
  status_label?: string | null
  start_at?: string | null
  end_at?: string | null
  quantity?: number
  totals?: {
    rental_fee?: string | number | null
    deposit_amount?: string | number | null
    delivery_fee?: string | number | null
    total?: string | number | null
  }
  payment_status?: string | null
  pickup_method?: string | null
  delivery_info?: {
    address?: string | null
    latitude?: number | null
    longitude?: number | null
  } | null
  timeline?: Array<{
    key: string
    label: string
    timestamp?: string | null
  }>
  next_action?: string | null
  notes?: string | null
  owner_notes?: string | null
  customer_rating?: number | null
  customer_rating_comment?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface RideItem {
  id: number
  pickup_location: string
  pickup_address?: string | null
  pickup_latitude?: number | null
  pickup_longitude?: number | null
  dropoff_location: string
  dropoff_address?: string | null
  dropoff_latitude?: number | null
  dropoff_longitude?: number | null
  ride_type?: string | null
  trip_purpose?: string | null
  notes?: string | null
  fare_estimate?: string | number | null
  status?: string | null
  cancel_reason?: string | null
  rating?: number | null
  rating_comment?: string | null
  vehicle_label?: string | null
  assigned_at?: string | null
  arrived_at?: string | null
  started_at?: string | null
  completed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  user?: Pick<User, 'id' | 'name' | 'phone'> | null
  driver?: Pick<User, 'id' | 'name' | 'phone'> | null
  driver_profile?: {
    vehicle_type?: string | null
    vehicle_make?: string | null
    vehicle_model?: string | null
    vehicle_registration?: string | null
    rating?: number | null
    is_online?: boolean
    is_verified?: boolean
  } | null
  reference_code?: string | null
  status_label?: string | null
  tracking_status?: string | null
  estimated_distance_km?: number | null
  estimated_eta_minutes?: number | null
  estimated_duration_minutes?: number | null
  map_url?: string | null
  timeline?: Array<{
    key: string
    label: string
    timestamp?: string | null
  }>
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
  hero_image_url?: string | null
  open_now?: boolean
  availability_status?: string | null
  availability_code?: string | null
  availability?: {
    code?: string | null
    label?: string | null
    is_open?: boolean
    closing_soon?: boolean
    busy?: boolean
    paused?: boolean
    pickup_only?: boolean
    supports_delivery?: boolean
  } | null
  delivery_fee?: string | number | null
  delivery_eta_minutes?: number | null
  fast_delivery?: boolean
  rating?: number | null
  review_count?: number | null
  commerce_category?: string | null
  is_featured?: boolean
  is_popular?: boolean
  business?: Pick<Organization, 'id' | 'name' | 'category' | 'phone' | 'whatsapp' | 'logo_url' | 'is_verified' | 'town' | 'area' | 'location' | 'open_now' | 'availability_status' | 'availability_code' | 'delivery_fee' | 'delivery_eta_minutes' | 'fast_delivery' | 'rating' | 'review_count' | 'commerce_category' | 'opening_hours'> | null
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
  price_per_hour?: string | number | null
  price_per_day?: string | number | null
  deposit_amount?: string | number | null
  verification_status?: string | null
  starts_at?: string | null
  published_at?: string | null
  source_name?: string | null
}

export interface UnifiedSearchResponse {
  services: UnifiedSearchResult[]
  providers: UnifiedSearchResult[]
  directory: UnifiedSearchResult[]
  products: UnifiedSearchResult[]
  hire_items: UnifiedSearchResult[]
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

export interface CommunityProjectCategory {
  id: number
  name: string
  slug: string
  icon?: string | null
  sort_order?: number
}

export interface CommunityProjectAttachment {
  id: number
  file_url?: string | null
  file_path?: string | null
  mime_type?: string | null
  file_type: 'image' | 'video' | 'audio' | 'document'
  original_name?: string | null
  size?: number
  caption?: string | null
  created_at?: string | null
}

export interface CommunityProjectUpdate {
  id: number
  title: string
  body: string
  status_after_update?: string | null
  progress_percent?: number | null
  approved_by_town_manager?: boolean
  attachments?: Array<Record<string, unknown>>
  created_at?: string | null
  user?: Pick<User, 'id' | 'name' | 'avatar'> | null
}

export interface CommunityProjectVerification {
  id: number
  action: string
  notes?: string | null
  status_after?: string | null
  verification_status_after?: string | null
  created_at?: string | null
  reviewer?: Pick<User, 'id' | 'name'> | null
}

export interface CommunityProjectPledge {
  id: number
  pledge_type: 'money' | 'item' | 'volunteer' | 'service' | 'other'
  pledge_description: string
  amount?: string | number | null
  quantity?: number | null
  contact_phone?: string | null
  contact_email?: string | null
  status?: string | null
  created_at?: string | null
  user?: Pick<User, 'id' | 'name'> | null
  project?: CommunityProject | null
}

export interface CommunityProject {
  id: number
  slug: string
  reference_code: string
  title: string
  summary: string
  description: string
  support_needed?: string[]
  target_amount?: string | number | null
  target_items?: Array<Record<string, unknown>>
  target_volunteers?: number | null
  current_amount?: string | number | null
  current_items?: Array<Record<string, unknown>>
  current_volunteers?: number | null
  location_text?: string | null
  town?: string | null
  area?: string | null
  latitude?: number | null
  longitude?: number | null
  contact_name?: string | null
  contact_phone?: string | null
  contact_whatsapp?: string | null
  contact_email?: string | null
  status: string
  verification_status: string
  verification_notes?: string | null
  rejection_reason?: string | null
  is_verified?: boolean
  is_featured?: boolean
  starts_at?: string | null
  ends_at?: string | null
  approved_at?: string | null
  completed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  category?: CommunityProjectCategory | null
  user?: Pick<User, 'id' | 'name' | 'phone' | 'avatar'> | null
  organization?: Pick<Organization, 'id' | 'name' | 'logo_url' | 'category' | 'is_verified'> | null
  attachments?: CommunityProjectAttachment[]
  updates?: CommunityProjectUpdate[]
  latest_update?: CommunityProjectUpdate | null
  pledges?: CommunityProjectPledge[]
  pledges_count?: number
  followers_count?: number
  progress_percent?: number
  is_following?: boolean
  verification_history?: CommunityProjectVerification[]
}

export interface CommunityImpactBadge {
  id?: number
  title: string
  description?: string | null
  icon?: string | null
  category?: string | null
  points_threshold?: number | null
  rule_key?: string | null
  is_active?: boolean
}

export interface CommunityImpactAccount {
  user_id?: number
  total_points: number
  available_points: number
  lifetime_points: number
  redeemed_points: number
  current_level: string
  public_leaderboard_opt_in: boolean
  public_display_name?: string | null
  privacy_mode: 'private' | 'initials' | 'display_name'
  last_awarded_at?: string | null
  current_badge?: CommunityImpactBadge | { data: CommunityImpactBadge } | null
  next_badge?: CommunityImpactBadge | { data: CommunityImpactBadge } | null
}

export interface CommunityImpactTransaction {
  id: number
  user_id?: number
  source_type?: string | null
  source_id?: number | null
  points: number
  type: 'earned' | 'redeemed' | 'adjusted' | 'reversed'
  reason: string
  category: string
  verification_status: 'pending' | 'approved' | 'rejected' | 'reversed'
  verified_by?: number | null
  verified_at?: string | null
  internal_notes?: string | null
  public_summary?: string | null
  is_public?: boolean
  created_at?: string | null
  verifier?: { id?: number | null; name?: string | null } | null
}

export interface CommunityImpactReward {
  id: number
  title: string
  description?: string | null
  reward_type: 'airtime' | 'voucher' | 'money' | 'goods' | 'service' | 'recognition' | 'other'
  points_required: number
  quantity_available?: number | null
  sponsor_name?: string | null
  sponsor_logo?: string | null
  terms?: string | null
  is_active: boolean
}

export interface CommunityImpactRedemption {
  id: number
  user_id?: number
  reward_id: number
  points_spent: number
  status: 'requested' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled'
  fulfillment_notes?: string | null
  fulfilled_by?: number | null
  fulfilled_at?: string | null
  created_at?: string | null
  reward?: CommunityImpactReward | { data: CommunityImpactReward } | null
  user?: Pick<User, 'id' | 'name'> | null
  fulfiller?: Pick<User, 'id' | 'name'> | null
}

export interface CommunityImpactLeaderboardEntry {
  rank: number
  points: number
  level: string
  display_name: string
  privacy_mode: string
  avatar_placeholder?: string | null
  category_totals?: Array<{ category: string; points: number }>
}

export interface CommunityImpactDashboardPayload {
  account: { data: CommunityImpactAccount } | CommunityImpactAccount
  recent_approved: PaginatedResult<CommunityImpactTransaction> | { data: CommunityImpactTransaction[] }
  pending_transactions: PaginatedResult<CommunityImpactTransaction> | { data: CommunityImpactTransaction[] }
}

export interface FeedCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  priority?: number
}

export interface FeedPost {
  id: number
  title: string
  summary?: string | null
  body?: string | null
  media_url?: string | null
  external_url?: string | null
  town?: string | null
  area?: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived'
  is_featured?: boolean
  priority?: number
  published_at?: string | null
  rejection_reason?: string | null
  category?: FeedCategory | null
  source?: { id?: number; name?: string | null; source_type?: string | null } | null
  metadata?: Record<string, unknown>
}

export interface UserFeedPreference {
  id?: number
  interests?: string[]
  hidden_category_ids?: number[]
  muted_source_ids?: number[]
  preferred_town?: string | null
  preferred_area?: string | null
  prioritize_followed_organizations?: boolean
}

export interface AiAssistSuggestion {
  id: number
  suggestion_type: string
  content: Record<string, unknown>
  is_primary: boolean
}

export interface AiAssistRequest {
  id: number
  module: string
  provider_key: string
  status: string
  original_media_url?: string | null
  original_filename?: string | null
  payload?: Record<string, unknown>
  safety_status: 'clear' | 'flagged' | 'blocked'
  confidence_score?: number | string | null
  needs_user_review: boolean
  suggestions?: AiAssistSuggestion[]
}

export interface SupportMessage {
  id: number
  sender_type: 'user' | 'bot' | 'agent' | 'channel_system'
  body: string
  intent_key?: string | null
  attachments?: unknown[]
  metadata?: Record<string, unknown>
  created_at?: string | null
}

export interface SupportEscalation {
  id: number
  reason: string
  status: 'pending' | 'assigned' | 'resolved' | 'cancelled'
  notes?: string | null
  resolved_at?: string | null
}

export interface SupportConversation {
  id: number
  channel: 'in_app' | 'whatsapp' | 'sms'
  status: 'open' | 'pending_human' | 'resolved' | 'closed'
  topic?: string | null
  last_message_at?: string | null
  messages?: SupportMessage[]
  escalations?: SupportEscalation[]
}

export interface ConversationParticipant {
  id: number
  user_id: number
  role: string
  status: string
  joined_at?: string | null
  last_read_at?: string | null
  user?: Pick<User, 'id' | 'name' | 'phone' | 'avatar'> | null
}

export interface ConversationMessage {
  id: number
  conversation_id: number
  user_id?: number | null
  message_type: string
  body?: string | null
  status: string
  is_system: boolean
  metadata?: Record<string, unknown>
  created_at?: string | null
  user?: Pick<User, 'id' | 'name' | 'avatar'> | null
  attachments?: Array<{
    id: number
    file_url?: string | null
    thumbnail_url?: string | null
    file_type?: string | null
    mime_type?: string | null
    file_size?: number | null
  }>
  read_receipts?: Array<{
    user_id: number
    read_at?: string | null
  }>
}

export interface ConversationThread {
  id: number
  context: string
  subject?: string | null
  status: string
  conversationable_type?: string | null
  conversationable_id?: number | null
  last_message_at?: string | null
  metadata?: Record<string, unknown>
  participants?: ConversationParticipant[]
  last_message?: ConversationMessage | null
  messages?: ConversationMessage[]
}
