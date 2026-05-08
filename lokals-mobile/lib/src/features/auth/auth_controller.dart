import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/api_client.dart';
import '../../core/models.dart';

class AuthState {
  const AuthState({this.token, this.user, this.isLoading = false});

  final String? token;
  final UserModel? user;
  final bool isLoading;

  AuthState copyWith({
    String? token,
    UserModel? user,
    bool? isLoading,
    bool clear = false,
  }) {
    return AuthState(
      token: clear ? null : token ?? this.token,
      user: clear ? null : user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(() {
  return AuthController();
});

class AuthController extends Notifier<AuthState> {
  bool _restored = false;

  @override
  AuthState build() {
    if (!_restored) {
      _restored = true;
      Future<void>.microtask(restore);
    }

    return const AuthState();
  }

  Future<void> restore() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final userRaw = prefs.getString('user');

    if (token != null && userRaw != null) {
      state = AuthState(
        token: token,
        user: UserModel.fromJson(jsonDecode(userRaw) as Map<String, dynamic>),
      );
      await hydrateCurrentUser();
    }
  }

  Future<void> hydrateCurrentUser() async {
    if (state.token == null) {
      return;
    }

    try {
      final response = await ref.read(dioProvider).get<Map<String, dynamic>>('/me');
      final payload = response.data!;
      final userJson =
          (payload['user'] as Map<String, dynamic>)['data']
              as Map<String, dynamic>? ??
          payload['user'] as Map<String, dynamic>;
      final user = UserModel.fromJson(userJson);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(userJson));
      state = state.copyWith(user: user, isLoading: false);
    } on DioException {
      // Keep the persisted session if the backend is temporarily unreachable.
    }
  }

  Future<void> refreshCurrentUser() async {
    await hydrateCurrentUser();
  }

  Future<void> _persistSession(String token, Map<String, dynamic> userJson) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('user', jsonEncode(userJson));
  }

  Future<void> login(String phone, String password) async {
    state = state.copyWith(isLoading: true);

    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'phone': phone, 'password': password},
      );

      final payload = response.data!;
      final userJson =
          (payload['user'] as Map<String, dynamic>)['data']
              as Map<String, dynamic>? ??
          payload['user'] as Map<String, dynamic>;
      final user = UserModel.fromJson(userJson);
      final token = payload['token'] as String;
      await _persistSession(token, userJson);

      state = AuthState(token: token, user: user, isLoading: false);
    } on DioException {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  Future<void> register({
    required String name,
    required String phone,
    required String town,
    required String area,
    required List<String> roles,
  }) async {
    state = state.copyWith(isLoading: true);

    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'name': name,
          'phone': phone,
          'password': 'password',
          'password_confirmation': 'password',
          'default_town': town,
          'default_area': area,
          'roles': roles,
          'interests': const ['Find services', 'Follow alerts'],
        },
      );

      final payload = response.data!;
      final userJson =
          (payload['user'] as Map<String, dynamic>)['data']
              as Map<String, dynamic>? ??
          payload['user'] as Map<String, dynamic>;
      final user = UserModel.fromJson(userJson);
      final token = payload['token'] as String;
      await _persistSession(token, userJson);

      state = AuthState(token: token, user: user, isLoading: false);
    } on DioException {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  Future<void> switchRole(String role) async {
    if (state.token == null) {
      return;
    }

    state = state.copyWith(isLoading: true);

    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post<Map<String, dynamic>>(
        '/auth/switch-role',
        data: {'role': role},
      );
      final payload = response.data!;
      final userJson =
          (payload['user'] as Map<String, dynamic>)['data']
              as Map<String, dynamic>? ??
          payload['user'] as Map<String, dynamic>;
      final user = UserModel.fromJson(userJson);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(userJson));
      state = state.copyWith(user: user, isLoading: false);
    } on DioException {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      if (state.token != null) {
        await ref.read(dioProvider).post('/auth/logout');
      }
    } on DioException {
      // Clear local state even if the remote logout request fails.
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    state = state.copyWith(clear: true);
  }
}
