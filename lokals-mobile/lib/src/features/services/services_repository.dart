import 'package:flutter_riverpod/flutter_riverpod.dart';

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

  Future<List<ProviderModel>> fetchProviders() async {
    final dio = ref.read(dioProvider);
    final response = await dio.get('/service-providers');
    final data = response.data;
    final list =
        (data is Map<String, dynamic> ? data['data'] : data) as List<dynamic>;

    return list
        .map((item) => ProviderModel.fromJson(item as Map<String, dynamic>))
        .toList();
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
