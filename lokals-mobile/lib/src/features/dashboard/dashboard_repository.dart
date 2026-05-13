import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_client.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref);
});

final dashboardIndexProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchDashboardIndex();
});

final citizenDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchCitizenDashboard();
});

final workerDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchWorkerDashboard();
});

final driverDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchDriverDashboard();
});

final courierDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchCourierDashboard();
});

final businessDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchBusinessDashboard();
});

final serviceProviderDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchServiceProviderDashboard();
});

final organizationDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchOrganizationDashboard();
});

final municipalityDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchMunicipalityDashboard();
});

final superAdminDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(dashboardRepositoryProvider).fetchAdminDashboard();
});

class DashboardRepository {
  DashboardRepository(this.ref);

  final Ref ref;

  Future<Map<String, dynamic>> _get(String path) async {
    final response = await ref.read(dioProvider).get(path);
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<Map<String, dynamic>> fetchDashboardIndex() => _get('/dashboard');
  Future<Map<String, dynamic>> fetchCitizenDashboard() => _get('/dashboard/citizen');
  Future<Map<String, dynamic>> fetchWorkerDashboard() => _get('/dashboard/worker');
  Future<Map<String, dynamic>> fetchDriverDashboard() => _get('/dashboard/driver');
  Future<Map<String, dynamic>> fetchCourierDashboard() => _get('/dashboard/courier');
  Future<Map<String, dynamic>> fetchBusinessDashboard() => _get('/dashboard/business');
  Future<Map<String, dynamic>> fetchServiceProviderDashboard() => _get('/dashboard/service-provider');
  Future<Map<String, dynamic>> fetchOrganizationDashboard() => _get('/dashboard/organization');
  Future<Map<String, dynamic>> fetchMunicipalityDashboard() => _get('/dashboard/municipality');
  Future<Map<String, dynamic>> fetchAdminDashboard() => _get('/dashboard/admin');
}
