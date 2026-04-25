import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/api_client.dart';
import '../../core/models.dart';

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

final ridesProvider = FutureProvider<List<RideModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchRides();
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

final eventsProvider = FutureProvider<List<EventModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchEvents();
});

final preferencesProvider = FutureProvider<UserPreferenceModel>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchPreferences();
});

final storeProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  return ref.read(discoveryRepositoryProvider).fetchProducts();
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

class DiscoveryRepository {
  DiscoveryRepository(this.ref);

  final Ref ref;

  List<dynamic> _unwrapList(dynamic data) {
    if (data is Map<String, dynamic> && data['data'] is List<dynamic>) {
      return data['data'] as List<dynamic>;
    }

    return data as List<dynamic>;
  }

  Future<List<ListingModel>> fetchListings() async {
    final response = await ref.read(dioProvider).get('/marketplace');
    return _unwrapList(response.data)
        .map((item) => ListingModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<JobModel>> fetchJobs() async {
    final response = await ref.read(dioProvider).get('/jobs');
    return _unwrapList(response.data)
        .map((item) => JobModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<WorkerModel>> fetchWorkers() async {
    final response = await ref.read(dioProvider).get('/workers');
    return _unwrapList(response.data)
        .map((item) => WorkerModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<OrganizationModel>> fetchOrganizations() async {
    final response = await ref.read(dioProvider).get('/directory');
    return _unwrapList(response.data)
        .map((item) => OrganizationModel.fromJson(item as Map<String, dynamic>))
        .toList();
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
    return (response.data as List<dynamic>)
        .map((item) => DeliveryModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<RideModel>> fetchRides() async {
    final response = await ref.read(dioProvider).get('/rides');
    return (response.data as List<dynamic>)
        .map((item) => RideModel.fromJson(item as Map<String, dynamic>))
        .toList();
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
    final response = await ref.read(dioProvider).get('/alerts/feed');
    return _unwrapList(response.data)
        .map((item) => AlertFeedModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<EventModel>> fetchEvents() async {
    final response = await ref.read(dioProvider).get('/events');
    return _unwrapList(response.data)
        .map((item) => EventModel.fromJson(item as Map<String, dynamic>))
        .toList();
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
    final response = await ref.read(dioProvider).get('/store/products');
    return _unwrapList(response.data)
        .map((item) => ProductModel.fromJson(item as Map<String, dynamic>))
        .toList();
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
    final response = await ref.read(dioProvider).get('/accommodations');
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

  Future<List<NotificationItemModel>> fetchNotifications() async {
    final response = await ref.read(dioProvider).get('/notifications');
    return _unwrapList(response.data)
        .map((item) => NotificationItemModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> markAllNotificationsRead() async {
    await ref.read(dioProvider).post('/notifications/mark-read');
  }

  Future<void> updateProfile({
    required String name,
    required String phone,
    required String location,
    required String defaultTown,
    required String defaultArea,
    required String bio,
    required String profession,
    required String businessName,
    required String whatsapp,
    required String secondaryPhone,
    required String profileVisibility,
  }) async {
    await ref.read(dioProvider).put('/me', data: {
      'name': name,
      'phone': phone,
      'location': location,
      'default_town': defaultTown,
      'default_area': defaultArea,
      'bio': bio,
      'profession': profession,
      'business_name': businessName,
      'whatsapp': whatsapp,
      'secondary_phone': secondaryPhone,
      'profile_visibility': profileVisibility,
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

  Future<void> createProduct({
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

    await ref.read(dioProvider).post('/store/products', data: FormData.fromMap(data));
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
    XFile? image,
  }) async {
    final data = <String, dynamic>{
      'type': type,
      'title': title,
      'description': description,
      'town': town,
      'area': area,
      'price': price,
      'bedrooms': bedrooms,
      'bathrooms': bathrooms,
      'price_period': type == 'bnb' || type == 'short_stay' ? 'night' : type == 'property_sale' ? 'once' : 'month',
      'status': 'published',
    };

    if (image != null) {
      data['image'] = await MultipartFile.fromFile(image.path, filename: image.name);
    }

    await ref.read(dioProvider).post('/accommodations', data: FormData.fromMap(data));
  }

  Future<void> applyToJob(int jobId) async {
    await ref.read(dioProvider).post('/jobs/$jobId/apply', data: {
      'message': 'Interested in this role from the mobile app.',
    });
  }

  Future<void> createReport({
    required String title,
    required String category,
    required String description,
    required String location,
    XFile? photo,
  }) async {
    final data = <String, dynamic>{
      'title': title,
      'category': category,
      'description': description,
      'location': location,
      'priority': 'medium',
    };

    if (photo != null) {
      data['photo'] = await MultipartFile.fromFile(photo.path, filename: photo.name);
    }

    await ref.read(dioProvider).post('/reports', data: FormData.fromMap(data));
  }

  Future<void> createDelivery({
    required String pickupAddress,
    required String dropoffAddress,
    required String itemDescription,
    required String parcelSize,
    XFile? photo,
    String? price,
  }) async {
    final data = <String, dynamic>{
      'pickup_location': pickupAddress,
      'dropoff_location': dropoffAddress,
      'parcel_description': itemDescription,
      'parcel_size': parcelSize,
      'estimated_price': price,
    };

    if (photo != null) {
      data['photo'] = await MultipartFile.fromFile(photo.path, filename: photo.name);
    }

    await ref.read(dioProvider).post('/deliveries', data: FormData.fromMap(data));
  }

  Future<void> createRide({
    required String pickupLocation,
    required String dropoffLocation,
    String? fareEstimate,
  }) async {
    await ref.read(dioProvider).post('/rides', data: {
      'pickup_location': pickupLocation,
      'dropoff_location': dropoffLocation,
      'fare_estimate': fareEstimate,
    });
  }

  Future<void> createSos({
    required String message,
    required String location,
  }) async {
    await ref.read(dioProvider).post('/sos', data: {
      'message': message,
      'location': location,
    });
  }
}
