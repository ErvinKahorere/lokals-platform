import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/app_config.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';

final servicesRepositoryProvider = Provider<ServicesRepository>((ref) {
  return ServicesRepository(ref);
});

final servicesProvider = FutureProvider<List<ProviderModel>>((ref) async {
  return ref.read(servicesRepositoryProvider).fetchProviders();
});

final providerDetailsProvider = FutureProvider.family<ProviderModel, String>((
  ref,
  id,
) async {
  return ref.read(servicesRepositoryProvider).fetchProvider(id);
});

final followedProviderIdsProvider = FutureProvider<Set<int>>((ref) async {
  return ref.read(servicesRepositoryProvider).fetchFollowedProviderIds();
});

class ServicesRepository {
  ServicesRepository(this.ref);

  final Ref ref;

  static final List<ProviderModel> _demoProviders = [
    ProviderModel(
      id: 9001,
      name: 'Okahandja Fix & Flow Plumbing',
      category: 'Plumbing',
      location: 'Nau-Aib, Okahandja',
      isVerified: true,
      description: 'Water leak repairs, burst pipes, and home plumbing support.',
      phone: '+264810002301',
      whatsapp: '+264810002301',
      status: 'active',
      distanceKm: 1.2,
      town: AppConfig.pilotTown,
      area: 'Nau-Aib',
      openNow: true,
      availabilityStatus: 'Available now',
      responseTimeLabel: 'Usually replies in 10 min',
      followersCount: 38,
      reviewCount: 21,
      rating: 4.8,
      services: [
        ServiceModel(
          id: 1,
          name: 'Emergency leak repair',
          durationMinutes: 90,
          price: '450',
          isBookable: true,
          description: 'Fast response for pipe bursts and urgent leaks.',
        ),
      ],
    ),
    ProviderModel(
      id: 9002,
      name: 'Five Rand Electric Care',
      category: 'Electrical',
      location: 'Five Rand, Okahandja',
      isVerified: true,
      description: 'Fault checks, wiring support, and prepaid meter help.',
      phone: '+264810002302',
      whatsapp: '+264810002302',
      status: 'active',
      distanceKm: 2.4,
      town: AppConfig.pilotTown,
      area: 'Five Rand',
      openNow: true,
      availabilityStatus: 'Open today',
      responseTimeLabel: 'Same-day callback',
      followersCount: 24,
      reviewCount: 17,
      rating: 4.6,
      services: [
        ServiceModel(
          id: 2,
          name: 'Home electrical inspection',
          durationMinutes: 60,
          price: '380',
          isBookable: true,
          description: 'Quick safety checks and minor electrical repairs.',
        ),
      ],
    ),
    ProviderModel(
      id: 9003,
      name: 'Okahandja Garden Crew',
      category: 'Garden',
      location: 'Central Okahandja',
      isVerified: false,
      description: 'Garden cleanup, hedge trimming, and yard maintenance.',
      phone: '+264810002303',
      whatsapp: '+264810002303',
      status: 'active',
      distanceKm: 3.1,
      town: AppConfig.pilotTown,
      area: 'Central Okahandja',
      openNow: false,
      availabilityStatus: 'Bookings open',
      responseTimeLabel: 'Replies within the hour',
      followersCount: 11,
      reviewCount: 8,
      rating: 4.4,
      services: [
        ServiceModel(
          id: 3,
          name: 'Yard clean-up',
          durationMinutes: 120,
          price: '300',
          isBookable: true,
          description: 'Cleanup for homes, rentals, and business yards.',
        ),
      ],
    ),
  ];

  bool _isPilotProvider(ProviderModel provider) {
    final haystack = [
      provider.town,
      provider.area,
      provider.location,
    ].whereType<String>().join(' ').toLowerCase();
    return haystack.contains(AppConfig.pilotTown.toLowerCase());
  }

  Future<List<ProviderModel>> fetchProviders() async {
    final dio = ref.read(dioProvider);
    final response = await dio.get(
      '/service-providers',
      queryParameters: {'town': AppConfig.pilotTown},
    );
    final data = response.data;
    final list =
        (data is Map<String, dynamic> ? data['data'] : data) as List<dynamic>;

    final providers = list
        .map((item) => ProviderModel.fromJson(item as Map<String, dynamic>))
        .where(_isPilotProvider)
        .toList();

    if (AppConfig.isDemoMode && providers.isEmpty) {
      return _demoProviders;
    }

    return providers;
  }

  Future<ProviderModel> fetchProvider(String id) async {
    final dio = ref.read(dioProvider);
    final response = await dio.get('/service-providers/$id');
    final data = response.data;
    final item = (data is Map<String, dynamic> && data['data'] != null)
        ? data['data'] as Map<String, dynamic>
        : data as Map<String, dynamic>;

    return ProviderModel.fromJson(item);
  }

  Future<Set<int>> fetchFollowedProviderIds() async {
    final dio = ref.read(dioProvider);
    final response = await dio.get('/follow');
    final data = response.data;
    final list = (data is Map<String, dynamic> ? data['data'] : data) as List<dynamic>;

    return list
        .whereType<Map<String, dynamic>>()
        .where(
          (item) => (item['followable_type']?.toString().contains('ServiceProvider') ?? false),
        )
        .map((item) => item['followable_id'] as int)
        .toSet();
  }

  Future<void> followProvider(int providerId) async {
    await ref.read(dioProvider).post('/follow', data: {
      'type': 'service_provider',
      'id': providerId,
    });
  }

  Future<void> unfollowProvider(int providerId) async {
    final dio = ref.read(dioProvider);
    final response = await dio.get('/follow');
    final data = response.data;
    final list = (data is Map<String, dynamic> ? data['data'] : data) as List<dynamic>;
    final follow = list.whereType<Map<String, dynamic>>().firstWhere(
      (item) =>
          (item['followable_type']?.toString().contains('ServiceProvider') ?? false) &&
          item['followable_id'] == providerId,
      orElse: () => <String, dynamic>{},
    );

    final followId = follow['id'];
    if (followId != null) {
      await dio.delete('/follow/$followId');
    }
  }
}
