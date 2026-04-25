import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../features/auth/auth_controller.dart';

final dioProvider = Provider<Dio>((ref) {
  final auth = ref.watch(authControllerProvider);

  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      headers: {'Accept': 'application/json'},
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 15),
      sendTimeout: const Duration(seconds: 15),
    ),
  );

  if (auth.token != null) {
    dio.options.headers['Authorization'] = 'Bearer ${auth.token}';
  }

  return dio;
});
