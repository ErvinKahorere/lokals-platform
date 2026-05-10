import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import 'notification_routing.dart';
import 'notification_service.dart';

class NotificationSyncScope extends ConsumerStatefulWidget {
  const NotificationSyncScope({super.key, required this.child});

  final Widget child;

  @override
  ConsumerState<NotificationSyncScope> createState() => _NotificationSyncScopeState();
}

class _NotificationSyncScopeState extends ConsumerState<NotificationSyncScope> {
  final Set<String> _seenNotificationIds = <String>{};
  Timer? _pollTimer;
  StreamSubscription<String>? _tapSubscription;
  bool _bootstrapped = false;

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_bootstrap);
  }

  Future<void> _bootstrap() async {
    if (_bootstrapped) return;
    _bootstrapped = true;

    final service = ref.read(localNotificationServiceProvider);
    await service.initialize();
    await service.requestPermissions();

    _tapSubscription = service.tapRoutes.listen((route) {
      if (!mounted) return;
      ref.read(routerProvider).go(route);
    });

    ref.listenManual<AuthState>(authControllerProvider, (_, next) async {
      await _syncAuthState(next);
    });

    await _syncAuthState(ref.read(authControllerProvider));
  }

  Future<void> _syncAuthState(AuthState auth) async {
    _pollTimer?.cancel();
    _seenNotificationIds.clear();

    if (auth.token == null) {
      return;
    }

    await _registerDeviceTokenIfAvailable();
    await _pollNotifications();
    _pollTimer = Timer.periodic(const Duration(seconds: 45), (_) => _pollNotifications());
  }

  Future<void> _registerDeviceTokenIfAvailable() async {
    final service = ref.read(localNotificationServiceProvider);
    final token = await service.getAvailableDeviceToken();
    if (token == null || token.isEmpty) return;

    await ref.read(discoveryRepositoryProvider).registerDeviceToken(
          platform: 'android',
          token: token,
          deviceName: 'Android app',
        );
  }

  Future<void> _pollNotifications() async {
    final repository = ref.read(discoveryRepositoryProvider);
    final service = ref.read(localNotificationServiceProvider);

    try {
      final notifications = await repository.fetchNotifications(unreadOnly: true);
      for (final notification in notifications) {
        if (_seenNotificationIds.contains(notification.id) || !isImportantNotificationType(notification.type)) {
          continue;
        }

        _seenNotificationIds.add(notification.id);
        await service.showNotification(
          id: notificationHashId(notification.id),
          notification: notification,
          route: routeForNotification(notification),
        );
      }

      ref.invalidate(notificationsProvider);
    } catch (_) {
      // Polling should stay resilient while the rest of the app continues.
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _tapSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
