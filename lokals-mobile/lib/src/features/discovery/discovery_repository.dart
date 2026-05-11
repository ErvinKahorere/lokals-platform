import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/api_client.dart';
import '../../core/models.dart';
import '../../config/app_config.dart';

final discoveryRepositoryProvider = Provider<DiscoveryRepository>((ref) {
  return DiscoveryRepository(ref);
});

final marketplaceProvider = FutureProvider<List<ListingModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchListings();
});

final jobsProvider = FutureProvider<List<JobModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchJobs();
});

final workersProvider = FutureProvider<List<WorkerModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchWorkers();
});

final directoryProvider = FutureProvider<List<OrganizationModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchOrganizations();
});

final directoryDetailsProvider = FutureProvider.family<OrganizationModel, String>((ref, id) async {
  return ref.read(discoveryRepositoryProvider).fetchOrganization(id);
});

final deliveriesProvider = FutureProvider<List<DeliveryModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchDeliveries();
});

final deliveryDetailsProvider = FutureProvider.family<DeliveryModel, String>((ref, id) async {
  return ref.read(discoveryRepositoryProvider).fetchDelivery(id);
});

final ridesProvider = FutureProvider<List<RideModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchRides();
});

final rideDetailsProvider = FutureProvider.family<RideModel, String>((ref, id) async {
  return ref.read(discoveryRepositoryProvider).fetchRide(id);
});

final sosFeedProvider = FutureProvider<List<SosModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchSos();
});

final profileSummaryProvider = FutureProvider<ProfileSummaryModel>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchProfile();
});

final alertsFeedProvider = FutureProvider<List<AlertFeedModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchAlertsFeed();
});

final followingFeedProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchFollowingFeed();
});

final followedOrganizationIdsProvider = FutureProvider<Set<int>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchFollowedOrganizationIds();
});

final newsProvider = FutureProvider.family<List<NewsItemModel>, Map<String, String>>((ref, params) async {
  return ref.read(discoveryRepositoryProvider).fetchNews(params: params);
});

final newsTrendingProvider = FutureProvider<List<NewsItemModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchTrendingNews();
});

final newsFeedProvider = FutureProvider<List<NewsItemModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchPersonalizedNewsFeed();
});

final newsDetailsProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  return ref.read(discoveryRepositoryProvider).fetchNewsItem(id);
});

final eventsProvider = FutureProvider<List<EventModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchEvents();
});

final eventDetailsProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  return ref.read(discoveryRepositoryProvider).fetchEvent(id);
});

final eventCalendarProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchEventCalendar();
});

final myTicketsProvider = FutureProvider<List<EventTicketModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchMyTickets();
});

final preferencesProvider = FutureProvider<UserPreferenceModel>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchPreferences();
});

final storeProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchProducts();
});

final saleAlertsProvider = FutureProvider<List<SaleAlertModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchSaleAlerts();
});

final productDetailsProvider = FutureProvider.family<ProductModel, String>((ref, id) async {
  return ref.read(discoveryRepositoryProvider).fetchProduct(id);
});

final accommodationsProvider = FutureProvider<List<AccommodationItemModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchAccommodations();
});

final accommodationDetailsProvider = FutureProvider.family<AccommodationItemModel, String>((ref, id) async {
  return ref.read(discoveryRepositoryProvider).fetchAccommodation(id);
});

final notificationsProvider = FutureProvider<List<NotificationItemModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchNotifications();
});

final activityFeedProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchActivityFeed();
});

final savedItemsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchSavedItems();
});

final searchResultsProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, query) async {
  return ref.read(discoveryRepositoryProvider).fetchSearchResults(query);
});

class DiscoveryRepository {
  DiscoveryRepository(this.ref);

  final Ref ref;

  static final List<ListingModel> _demoListings = [
    ListingModel(
      id: 8101,
      title: 'Fresh garden spinach bundle',
      type: 'product',
      description: 'Same-day local pickup from a verified Okahandja seller.',
      status: 'published',
      price: '35',
      location: 'Nau-Aib, Okahandja',
      userName: 'Maria Kandjii',
      businessName: 'Nau-Aib Fresh Produce',
    ),
  ];

  static final List<JobModel> _demoJobs = [
    JobModel(
      id: 8201,
      title: 'Pothole patch support crew',
      description: 'Short-term municipal support for road patching near Five Rand.',
      employmentType: 'contract',
      status: 'open',
      compensation: 'N\$ 650/day',
      location: 'Five Rand, Okahandja',
      skills: const ['Driving', 'General labour'],
      organizationName: 'Okahandja Town Council',
      applicationsCount: 4,
      distanceKm: 1.9,
    ),
    JobModel(
      id: 8202,
      title: 'Clinic reception relief',
      description: 'Front desk support for a busy local clinic shift.',
      employmentType: 'part_time',
      status: 'open',
      compensation: 'N\$ 120/hour',
      location: 'Central Okahandja',
      skills: const ['Admin', 'Customer service'],
      organizationName: 'Okahandja State Clinic',
      applicationsCount: 2,
      distanceKm: 2.7,
    ),
  ];

  static final List<WorkerModel> _demoWorkers = [
    WorkerModel(
      id: 8301,
      headline: 'Cleaner and laundry helper',
      isAvailable: true,
      name: 'Memory Hango',
      location: 'Nau-Aib, Okahandja',
      rate: 'N\$ 140/day',
      skills: const ['Cleaning', 'Laundry'],
      experienceYears: 4,
      phone: '+264810002411',
      whatsapp: '+264810002411',
      distanceKm: 1.1,
    ),
    WorkerModel(
      id: 8302,
      headline: 'Painter and home maintenance helper',
      isAvailable: true,
      name: 'Elago Tjipura',
      location: 'Veddersdal, Okahandja',
      rate: 'N\$ 180/day',
      skills: const ['Painting', 'Repairs'],
      experienceYears: 5,
      phone: '+264810002412',
      whatsapp: '+264810002412',
      distanceKm: 2.0,
    ),
  ];

  static final List<OrganizationModel> _demoOrganizations = [
    OrganizationModel(
      id: 8401,
      name: 'Okahandja Town Council',
      category: 'Council',
      subcategory: 'Public service',
      description: 'Main council office for local services, billing, and resident support.',
      location: 'Town Centre',
      town: AppConfig.pilotTown,
      area: 'Central Okahandja',
      phone: '+26462200001',
      isVerified: true,
      openNow: true,
      availabilityStatus: 'Open today',
      emergencyContact: true,
      isPublicService: true,
      servicesOffered: const ['Accounts', 'Resident services', 'Council support'],
    ),
    OrganizationModel(
      id: 8402,
      name: 'Okahandja Police Station',
      category: 'Police',
      subcategory: 'Emergency',
      description: 'Emergency and public safety support for Okahandja residents.',
      location: 'Main Road',
      town: AppConfig.pilotTown,
      area: 'Central Okahandja',
      phone: '+26462200011',
      isVerified: true,
      openNow: true,
      availabilityStatus: '24/7',
      emergencyContact: true,
      isPublicService: true,
    ),
    OrganizationModel(
      id: 8403,
      name: 'Okahandja State Clinic',
      category: 'Clinic',
      subcategory: 'Health',
      description: 'Walk-in local clinic for general care and referrals.',
      location: 'Clinic Road',
      town: AppConfig.pilotTown,
      area: 'Central Okahandja',
      phone: '+26462200021',
      isVerified: true,
      openNow: true,
      availabilityStatus: 'Open today',
      emergencyContact: true,
      isPublicService: true,
    ),
  ];

  static final List<DeliveryModel> _demoDeliveries = [
    DeliveryModel(
      id: 8501,
      pickupAddress: 'Okahandja Town Council',
      dropoffAddress: 'Nau-Aib community hall',
      itemDescription: 'Council notice packs',
      price: '75',
      parcelSize: 'medium',
      status: 'en route',
      userName: 'Demo Citizen',
      driverName: 'Local Courier',
    ),
  ];

  static final List<RideModel> _demoRides = [
    RideModel(
      id: 8601,
      pickupLocation: 'Okahandja taxi rank',
      dropoffLocation: 'Okahandja State Clinic',
      fareEstimate: '58',
      rideType: 'Standard',
      tripPurpose: 'Clinic visit',
      status: 'requested',
      userName: 'Demo Citizen',
      driverName: 'Pilot Driver',
    ),
  ];

  static final List<AlertFeedModel> _demoAlerts = [
    AlertFeedModel(
      id: 'demo-alert-water',
      sourceType: 'municipal_alert',
      title: 'Water outage in Nau-Aib',
      body: 'Repair work is underway. Water pressure may be low until late afternoon.',
      location: 'Nau-Aib, Okahandja',
      severity: 'high',
      timestamp: DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
    ),
    AlertFeedModel(
      id: 'demo-alert-road',
      sourceType: 'municipal_alert',
      title: 'Road closure near taxi rank',
      body: 'Expect a temporary detour while pothole repair crews work on the approach road.',
      location: 'Central Okahandja',
      severity: 'medium',
      timestamp: DateTime.now().subtract(const Duration(hours: 5)).toIso8601String(),
    ),
  ];

  static final List<EventModel> _demoEvents = [
    EventModel(
      id: 8701,
      title: 'Town Hall Service Delivery Briefing',
      category: 'community',
      description: 'A public meeting on water, roads, and refuse collection priorities.',
      venueName: 'Okahandja Town Hall',
      location: 'Town Hall',
      town: AppConfig.pilotTown,
      area: 'Central Okahandja',
      startsAt: DateTime.now().add(const Duration(days: 2)).toIso8601String(),
      status: 'published',
      isFeatured: true,
    ),
  ];

  static final List<ProductModel> _demoProducts = [
    ProductModel(
      id: 8801,
      title: '50L water storage drum',
      price: '220',
      salePrice: '180',
      description: 'Popular household water drum from a local hardware seller.',
      category: 'home',
      town: AppConfig.pilotTown,
      area: 'Nau-Aib',
      stockStatus: 'in_stock',
      businessId: 8401,
      businessName: 'Okahandja Build & Home',
      businessPhone: '+264810002501',
      businessVerified: true,
    ),
    ProductModel(
      id: 8802,
      title: 'School backpack special',
      price: '320',
      description: 'Durable backpack deal from a nearby family shop.',
      category: 'clothing',
      town: AppConfig.pilotTown,
      area: 'Five Rand',
      stockStatus: 'in_stock',
      businessName: 'Five Rand Family Store',
      businessPhone: '+264810002502',
      businessVerified: false,
    ),
  ];

  static final List<SaleAlertModel> _demoSaleAlerts = [
    SaleAlertModel(
      id: 8901,
      title: 'Weekend household essentials sale',
      body: 'Save on water drums, cleaning stock, and refill containers this weekend.',
      location: 'Central Okahandja',
      publishedAt: DateTime.now().subtract(const Duration(hours: 6)),
    ),
  ];

  Map<String, dynamic> _pilotParams([Map<String, dynamic>? params]) {
    return <String, dynamic>{
      'town': AppConfig.pilotTown,
      ...?params,
    };
  }

  List<dynamic> _unwrapList(dynamic data) {
    if (data is Map<String, dynamic> && data['data'] is List<dynamic>) {
      return data['data'] as List<dynamic>;
    }

    return data as List<dynamic>;
  }

  List<T> _withDemoFallback<T>(List<T> items, List<T> fallback) {
    if (AppConfig.isDemoMode && items.isEmpty) {
      return fallback;
    }
    return items;
  }

  Future<List<ListingModel>> fetchListings() async {
    final response = await ref.read(dioProvider).get('/marketplace', queryParameters: _pilotParams());
    final items = _unwrapList(response.data)
        .map((item) => ListingModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoListings);
  }

  Future<List<JobModel>> fetchJobs() async {
    final response = await ref.read(dioProvider).get('/jobs', queryParameters: _pilotParams());
    final items = _unwrapList(response.data)
        .map((item) => JobModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoJobs);
  }

  Future<List<WorkerModel>> fetchWorkers() async {
    final response = await ref.read(dioProvider).get('/workers', queryParameters: _pilotParams());
    final items = _unwrapList(response.data)
        .map((item) => WorkerModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoWorkers);
  }

  Future<List<OrganizationModel>> fetchOrganizations() async {
    final response = await ref.read(dioProvider).get('/directory', queryParameters: _pilotParams());
    final items = _unwrapList(response.data)
        .map((item) => OrganizationModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoOrganizations);
  }

  Future<OrganizationModel> fetchOrganization(String id) async {
    final response = await ref.read(dioProvider).get('/directory/$id');
    final data = response.data;
    final item = (data is Map<String, dynamic> && data['data'] != null)
        ? data['data'] as Map<String, dynamic>
        : data as Map<String, dynamic>;
    return OrganizationModel.fromJson(item);
  }

  Future<List<DeliveryModel>> fetchDeliveries() async {
    final response = await ref.read(dioProvider).get('/deliveries');
    final items = (response.data as List<dynamic>)
        .map((item) => DeliveryModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoDeliveries);
  }

  Future<DeliveryModel> fetchDelivery(String id) async {
    final response = await ref.read(dioProvider).get('/deliveries/$id');
    final data = response.data;
    final item = (data is Map<String, dynamic> && data['data'] != null)
        ? data['data'] as Map<String, dynamic>
        : data as Map<String, dynamic>;
    return DeliveryModel.fromJson(item);
  }

  Future<List<RideModel>> fetchRides() async {
    final response = await ref.read(dioProvider).get('/rides');
    final items = (response.data as List<dynamic>)
        .map((item) => RideModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoRides);
  }

  Future<RideModel> fetchRide(String id) async {
    final response = await ref.read(dioProvider).get('/rides/$id');
    final data = response.data;
    final item = (data is Map<String, dynamic> && data['data'] != null)
        ? data['data'] as Map<String, dynamic>
        : data as Map<String, dynamic>;
    return RideModel.fromJson(item);
  }

  Future<List<SosModel>> fetchSos() async {
    final response = await ref.read(dioProvider).get('/sos');
    return (response.data as List<dynamic>)
        .map((item) => SosModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<ProfileSummaryModel> fetchProfile() async {
    final response = await ref.read(dioProvider).get('/me');
    return ProfileSummaryModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<AlertFeedModel>> fetchAlertsFeed() async {
    final response = await ref.read(dioProvider).get('/alerts/feed', queryParameters: _pilotParams());
    final items = _unwrapList(response.data)
        .map((item) => AlertFeedModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoAlerts);
  }

  Future<List<Map<String, dynamic>>> fetchFollowingFeed() async {
    final response = await ref.read(dioProvider).get('/following-feed');
    return _unwrapList(response.data)
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList();
  }

  Future<Set<int>> fetchFollowedOrganizationIds() async {
    try {
      final response = await ref.read(dioProvider).get('/follow');
      final items = _unwrapList(response.data);
      return items
          .map((item) => Map<String, dynamic>.from(item as Map))
          .where((item) => (item['followable_type']?.toString().contains('Organization') ?? false) && item['followable_id'] is int)
          .map((item) => item['followable_id'] as int)
          .toSet();
    } on DioException {
      return <int>{};
    }
  }

  Future<List<EventModel>> fetchEvents({Map<String, dynamic>? params}) async {
    final response = await ref.read(dioProvider).get('/events', queryParameters: _pilotParams(params));
    final items = _unwrapList(response.data)
        .map((item) => EventModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoEvents);
  }

  Future<Map<String, dynamic>> fetchEvent(String id) async {
    final response = await ref.read(dioProvider).get('/events/$id');
    final data = response.data as Map<String, dynamic>;
    return {
      'data': EventModel.fromJson(data['data'] as Map<String, dynamic>),
      'related': (data['related'] as List<dynamic>? ?? const [])
          .map((item) => EventModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      'calendar': data['calendar'] as Map<String, dynamic>?,
    };
  }

  Future<List<Map<String, dynamic>>> fetchEventCalendar() async {
    final response = await ref.read(dioProvider).get('/events/calendar', queryParameters: _pilotParams());
    final items = _unwrapList(response.data);
    return items.map((item) => Map<String, dynamic>.from(item as Map)).toList();
  }

  Future<List<EventTicketModel>> fetchMyTickets() async {
    final response = await ref.read(dioProvider).get('/my/tickets');
    return _unwrapList(response.data)
        .map((item) => EventTicketModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveEvent(int eventId) async {
    await ref.read(dioProvider).post('/events/$eventId/save');
  }

  Future<void> removeSavedEvent(int eventId) async {
    await ref.read(dioProvider).delete('/events/$eventId/save');
  }

  Future<void> createEventReminder({
    required int eventId,
    required String remindAt,
    String channel = 'in_app',
  }) async {
    await ref.read(dioProvider).post('/events/$eventId/reminders', data: {
      'remind_at': remindAt,
      'channel': channel,
    });
  }

  Future<EventTicketModel> reserveEventTicket({
    required int eventId,
    int? ticketTypeId,
    String? holderName,
    String? holderPhone,
  }) async {
    final response = await ref.read(dioProvider).post('/events/$eventId/tickets/reserve', data: {
      'ticket_type_id': ticketTypeId,
      'holder_name': holderName,
      'holder_phone': holderPhone,
    });
    return EventTicketModel.fromJson((response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>);
  }

  Future<EventTicketModel> cancelEventTicket(int ticketId) async {
    final response = await ref.read(dioProvider).post('/tickets/$ticketId/cancel');
    return EventTicketModel.fromJson((response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>);
  }

  Future<List<NewsItemModel>> fetchNews({Map<String, String>? params}) async {
    final response = await ref.read(dioProvider).get('/news/local', queryParameters: _pilotParams(params));
    return _unwrapList(response.data)
        .map((item) => NewsItemModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<NewsItemModel>> fetchTrendingNews() async {
    final response = await ref.read(dioProvider).get('/news/trending', queryParameters: _pilotParams());
    return _unwrapList(response.data)
        .map((item) => NewsItemModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<NewsItemModel>> fetchPersonalizedNewsFeed() async {
    final response = await ref.read(dioProvider).get('/news/feed', queryParameters: _pilotParams());
    return _unwrapList(response.data)
        .map((item) => NewsItemModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Map<String, dynamic>> fetchNewsItem(String id) async {
    final response = await ref.read(dioProvider).get('/news/$id');
    final data = response.data as Map<String, dynamic>;
    return {
      'data': NewsItemModel.fromJson(data['data'] as Map<String, dynamic>),
      'related': (data['related'] as List<dynamic>? ?? const [])
          .map((item) => NewsItemModel.fromJson(item as Map<String, dynamic>))
          .toList(),
    };
  }

  Future<UserPreferenceModel> fetchPreferences() async {
    try {
      final response = await ref.read(dioProvider).get('/preferences');
      final payload = response.data as Map<String, dynamic>;
      final preferences =
          (payload['preferences'] as Map<String, dynamic>?)?['data']
              as Map<String, dynamic>? ??
          payload['preferences'] as Map<String, dynamic>? ??
          const <String, dynamic>{};
      return UserPreferenceModel.fromJson(preferences);
    } on DioException {
      return UserPreferenceModel();
    }
  }

  Future<List<ProductModel>> fetchProducts() async {
    final response = await ref.read(dioProvider).get('/store/products', queryParameters: _pilotParams());
    final items = _unwrapList(response.data)
        .map((item) => ProductModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoProducts);
  }

  Future<List<SaleAlertModel>> fetchSaleAlerts() async {
    final response = await ref.read(dioProvider).get('/store/sale-alerts', queryParameters: _pilotParams());
    final items = _unwrapList(response.data)
        .map((item) => SaleAlertModel.fromJson(item as Map<String, dynamic>))
        .toList();
    return _withDemoFallback(items, _demoSaleAlerts);
  }

  Future<ProductModel> fetchProduct(String id) async {
    final response = await ref.read(dioProvider).get('/store/products/$id');
    final data = response.data;
    final item = (data is Map<String, dynamic> && data['data'] != null)
        ? data['data'] as Map<String, dynamic>
        : data as Map<String, dynamic>;
    return ProductModel.fromJson(item);
  }

  Future<List<AccommodationItemModel>> fetchAccommodations() async {
    final response = await ref.read(dioProvider).get('/accommodations', queryParameters: _pilotParams());
    return _unwrapList(response.data)
        .map(
          (item) => AccommodationItemModel.fromJson(
            item as Map<String, dynamic>,
          ),
        )
        .toList();
  }

  Future<AccommodationItemModel> fetchAccommodation(String id) async {
    final response = await ref.read(dioProvider).get('/accommodations/$id');
    final data = response.data;
    final item = (data is Map<String, dynamic> && data['data'] != null)
        ? data['data'] as Map<String, dynamic>
        : data as Map<String, dynamic>;
    return AccommodationItemModel.fromJson(item);
  }

  Future<List<NotificationItemModel>> fetchNotifications({bool unreadOnly = false}) async {
    final response = await ref.read(dioProvider).get(
      unreadOnly ? '/notifications/unread' : '/notifications',
      queryParameters: unreadOnly ? {'unread': 1} : null,
    );
    return _unwrapList(response.data)
        .map((item) => NotificationItemModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> registerDeviceToken({
    required String platform,
    required String token,
    String? deviceName,
  }) async {
    await ref.read(dioProvider).post('/device-tokens', data: {
      'platform': platform,
      'token': token,
      'device_name': deviceName,
    });
  }

  Future<Map<String, dynamic>> fetchActivityFeed() async {
    final response = await ref.read(dioProvider).get('/activity');
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<Map<String, dynamic>> fetchSavedItems() async {
    final response = await ref.read(dioProvider).get('/saved-items');
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<Map<String, dynamic>> fetchSearchResults(String query) async {
    final response = await ref.read(dioProvider).get('/search', queryParameters: _pilotParams({
      'q': query,
    }));
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<void> markAllNotificationsRead() async {
    await ref.read(dioProvider).post('/notifications/mark-read');
  }

  Future<void> markNotificationRead(String id) async {
    await ref.read(dioProvider).post('/notifications/$id/read');
  }

  Future<void> saveItem({
    required String type,
    required Object id,
  }) async {
    await ref.read(dioProvider).post('/saved-items', data: {
      'type': type,
      'id': id,
    });
  }

  Future<void> removeSavedItem({
    required String type,
    required Object id,
  }) async {
    await ref.read(dioProvider).delete('/saved-items', data: {
      'type': type,
      'id': id,
    });
  }

  Future<void> followOrganization(int organizationId) async {
    await ref.read(dioProvider).post('/follow', data: {
      'type': 'organization',
      'id': organizationId,
    });
  }

  Future<void> unfollowOrganization(int organizationId) async {
    final response = await ref.read(dioProvider).get('/follow');
    final items = _unwrapList(response.data)
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList();
    final follow = items.cast<Map<String, dynamic>?>().firstWhere(
      (item) => item != null && (item['followable_type']?.toString().contains('Organization') ?? false) && item['followable_id'] == organizationId,
      orElse: () => null,
    );

    if (follow?['id'] != null) {
      await ref.read(dioProvider).delete('/follow/${follow!['id']}');
    }
  }

  Future<void> updateProfile({
    required String name,
    required String phone,
    String? email,
    required String location,
    required String defaultTown,
    required String defaultArea,
    required String bio,
    required String profession,
    required String businessName,
    required String whatsapp,
    required String secondaryPhone,
    required String profileVisibility,
    List<String> roles = const [],
    List<String> interests = const [],
  }) async {
    await ref.read(dioProvider).put('/me', data: {
      'name': name,
      'phone': phone,
      'email': email,
      'location': location,
      'default_town': defaultTown,
      'default_area': defaultArea,
      'bio': bio,
      'profession': profession,
      'business_name': businessName,
      'whatsapp': whatsapp,
      'secondary_phone': secondaryPhone,
      'profile_visibility': profileVisibility,
      'roles': roles,
      'interests': interests,
    });
  }

  Future<void> updatePreferences({
    required String defaultTown,
    required String defaultArea,
    required int serviceRadius,
    required Map<String, bool> notificationPreferences,
  }) async {
    await ref.read(dioProvider).put('/preferences', data: {
      'default_town': defaultTown,
      'default_area': defaultArea,
      'service_radius': serviceRadius,
      'notification_preferences': notificationPreferences,
    });
  }

  Future<void> uploadAvatar(XFile file) async {
    await ref.read(dioProvider).post(
      '/profile/avatar',
      data: FormData.fromMap({
        'avatar': await MultipartFile.fromFile(
          file.path,
          filename: file.name,
        ),
      }),
    );
  }

  Future<void> createListing({
    required String type,
    required String title,
    required String description,
    required String location,
    String? price,
    XFile? image,
  }) async {
    final data = <String, dynamic>{
      'type': type,
      'title': title,
      'description': description,
      'location': location,
      'price': price,
      'status': 'published',
      'metadata': {'assisted': true},
    };

    if (image != null) {
      data['image'] = await MultipartFile.fromFile(image.path, filename: image.name);
    }

    await ref.read(dioProvider).post('/listings', data: FormData.fromMap(data));
  }

  Future<ProductModel> createProduct({
    required String title,
    required String description,
    required String category,
    required String town,
    required String area,
    required String price,
    XFile? image,
  }) async {
    final data = <String, dynamic>{
      'title': title,
      'description': description,
      'category': category,
      'town': town,
      'area': area,
      'price': price,
      'status': 'published',
    };

    if (image != null) {
      data['image'] = await MultipartFile.fromFile(image.path, filename: image.name);
    }

    final response = await ref.read(dioProvider).post('/store/products', data: FormData.fromMap(data));
    final item = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>? ?? response.data as Map<String, dynamic>;
    return ProductModel.fromJson(item);
  }

  Future<void> createAccommodation({
    required String type,
    required String title,
    required String description,
    required String town,
    required String area,
    required String price,
    required String bedrooms,
    required String bathrooms,
    required String phone,
    String? whatsapp,
    String? pricePeriod,
    List<String> amenities = const [],
    List<String> rules = const [],
    XFile? image,
  }) async {
    final data = <String, dynamic>{
      'type': type,
      'title': title,
      'description': description,
      'town': town,
      'area': area,
      'price': price,
      'price_period': pricePeriod ?? (type == 'bnb' || type == 'short_stay' ? 'night' : type == 'property_sale' ? 'once' : 'month'),
      'status': 'published',
      'metadata': {
        'contact_phone': phone,
        'contact_whatsapp': (whatsapp != null && whatsapp.isNotEmpty) ? whatsapp : phone,
        if (amenities.isNotEmpty) 'amenities': amenities,
        if (rules.isNotEmpty) 'rules': rules,
      },
    };

    if (bedrooms.isNotEmpty) {
      data['bedrooms'] = bedrooms;
    }

    if (bathrooms.isNotEmpty) {
      data['bathrooms'] = bathrooms;
    }

    if (image != null) {
      data['image'] = await MultipartFile.fromFile(image.path, filename: image.name);
    }

    await ref.read(dioProvider).post('/accommodations', data: FormData.fromMap(data));
  }

  Future<void> applyToJob(int jobId, {String? message}) async {
    await ref.read(dioProvider).post('/jobs/$jobId/apply', data: {
      'message': message ?? 'Interested in this role from the mobile app.',
    });
  }

  Future<JobModel> createJob({
    required String title,
    required String location,
    String? description,
    String? employmentType,
    String? compensation,
    List<String>? skills,
  }) async {
    final response = await ref.read(dioProvider).post('/jobs', data: {
      'title': title,
      'location': location,
      'description': description,
      'employment_type': employmentType,
      'compensation': compensation,
      'skills': skills,
      'status': 'open',
    });
    final item = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>? ?? response.data as Map<String, dynamic>;
    return JobModel.fromJson(item);
  }

  Future<WorkerModel> createWorkerProfile({
    required String headline,
    required List<String> skills,
    required String location,
    int? experienceYears,
    String? hourlyRate,
    bool isAvailable = true,
  }) async {
    final response = await ref.read(dioProvider).post('/worker-profile', data: {
      'headline': headline,
      'skills': skills,
      'location': location,
      'experience_years': experienceYears,
      'hourly_rate': hourlyRate,
      'is_available': isAvailable,
    });
    final item = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>? ?? response.data as Map<String, dynamic>;
    return WorkerModel.fromJson(item);
  }

  Future<void> createReport({
    required String title,
    required String category,
    required String description,
    required String location,
    String? town,
    String? area,
    String priority = 'medium',
    XFile? photo,
  }) async {
    final data = <String, dynamic>{
      'title': title,
      'category': category,
      'description': description,
      'location': location,
      'town': town,
      'area': area,
      'priority': priority,
    };

    if (photo != null) {
      data['photo'] = await MultipartFile.fromFile(photo.path, filename: photo.name);
    }

    await ref.read(dioProvider).post('/reports', data: FormData.fromMap(data));
  }

  Future<List<ReportModel>> fetchMyReports() async {
    final response = await ref.read(dioProvider).get('/my-reports');
    final payload = response.data as Map<String, dynamic>;
    final data = (payload['data'] as List<dynamic>? ?? const []);
    return data.map((item) => ReportModel.fromJson(Map<String, dynamic>.from(item as Map))).toList();
  }

  Future<List<ReportModel>> fetchManagedReports({
    String? status,
    String? category,
    String? priority,
    String? area,
  }) async {
    final response = await ref.read(dioProvider).get('/reports', queryParameters: _pilotParams({
      if (status != null && status.isNotEmpty) 'status': status,
      if (category != null && category.isNotEmpty) 'category': category,
      if (priority != null && priority.isNotEmpty) 'priority': priority,
      if (area != null && area.isNotEmpty) 'area': area,
    }));
    final payload = response.data as Map<String, dynamic>;
    final data = (payload['data'] as List<dynamic>? ?? const []);
    return data.map((item) => ReportModel.fromJson(Map<String, dynamic>.from(item as Map))).toList();
  }

  Future<ReportModel> fetchReport(int reportId) async {
    final response = await ref.read(dioProvider).get('/reports/$reportId');
    final payload = response.data as Map<String, dynamic>;
    final item = (payload['data'] as Map<String, dynamic>?) ?? payload;
    return ReportModel.fromJson(item);
  }

  Future<ReportModel> updateReportStatus({
    required int reportId,
    required String status,
    String? resolutionNotes,
  }) async {
    final response = await ref.read(dioProvider).patch('/reports/$reportId/status', data: {
      'status': status,
      if (resolutionNotes != null && resolutionNotes.isNotEmpty) 'resolution_notes': resolutionNotes,
    });
    final payload = response.data as Map<String, dynamic>;
    final item = (payload['data'] as Map<String, dynamic>?) ?? payload;
    return ReportModel.fromJson(item);
  }

  Future<void> createMunicipalAlert({
    required String title,
    required String body,
    required String type,
  }) async {
    await ref.read(dioProvider).post('/alerts', data: {
      'title': title,
      'body': body,
      'type': type,
      'town': AppConfig.pilotTown,
    });
  }

  Future<DeliveryModel> createDelivery({
    required String pickupAddress,
    required String dropoffAddress,
    required String itemDescription,
    required String parcelSize,
    String? notes,
    XFile? photo,
    String? price,
  }) async {
    final data = <String, dynamic>{
      'pickup_location': pickupAddress,
      'dropoff_location': dropoffAddress,
      'parcel_description': itemDescription,
      'parcel_size': parcelSize,
      'estimated_price': price,
      'notes': notes,
    };

    if (photo != null) {
      data['photo'] = await MultipartFile.fromFile(photo.path, filename: photo.name);
    }

    final response = await ref.read(dioProvider).post('/deliveries', data: FormData.fromMap(data));
    return DeliveryModel.fromJson((response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>);
  }

  Future<RideModel> createRide({
    required String pickupLocation,
    required String dropoffLocation,
    required String rideType,
    String? tripPurpose,
    String? notes,
    String? fareEstimate,
  }) async {
    final response = await ref.read(dioProvider).post('/rides', data: {
      'pickup_location': pickupLocation,
      'dropoff_location': dropoffLocation,
      'ride_type': rideType,
      'trip_purpose': tripPurpose,
      'notes': notes,
      'fare_estimate': fareEstimate,
    });
    return RideModel.fromJson((response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>);
  }

  Future<SosModel> createSos({
    required String message,
    required String location,
    String? emergencyType,
    String? town,
    String? area,
  }) async {
    final response = await ref.read(dioProvider).post('/sos', data: {
      'message': message,
      'location': location,
      'emergency_type': emergencyType,
      'town': town,
      'area': area,
    });
    return SosModel.fromJson((response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>);
  }
}
