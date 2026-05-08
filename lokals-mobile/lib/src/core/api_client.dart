import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';

final dioProvider = Provider<Dio>((ref) {
  final apiBaseUrls = AppConfig.apiBaseUrlCandidates;

  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      headers: {'Accept': 'application/json'},
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 15),
      sendTimeout: const Duration(seconds: 15),
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');

        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        } else {
          options.headers.remove('Authorization');
        }

        handler.next(options);
      },
      onError: (error, handler) async {
        final shouldRetry =
            error.type == DioExceptionType.connectionError ||
            error.type == DioExceptionType.connectionTimeout ||
            error.type == DioExceptionType.receiveTimeout;

        if (!shouldRetry) {
          return handler.next(error);
        }

        final currentBaseUrl = error.requestOptions.baseUrl;
        final currentIndex = apiBaseUrls.indexOf(currentBaseUrl);

        if (currentIndex == -1 || currentIndex >= apiBaseUrls.length - 1) {
          return handler.next(error);
        }

        for (var index = currentIndex + 1; index < apiBaseUrls.length; index++) {
          final retryBaseUrl = apiBaseUrls[index];
          final retryOptions = error.requestOptions.copyWith(
            baseUrl: retryBaseUrl,
          );

          try {
            final response = await dio.fetch<dynamic>(retryOptions);
            dio.options.baseUrl = retryBaseUrl;
            return handler.resolve(response);
          } on DioException catch (_) {
            // Try the next configured fallback before surfacing the original failure.
          }
        }

        return handler.next(error);
      },
    ),
  );

  return dio;
});
