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
}
