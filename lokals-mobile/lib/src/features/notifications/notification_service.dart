import 'dart:async';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models.dart';

final localNotificationServiceProvider = Provider<LocalNotificationService>((ref) {
  final service = LocalNotificationService();
  ref.onDispose(service.dispose);
  return service;
});

class LocalNotificationService {
  final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();
  final StreamController<String> _tapRoutes = StreamController<String>.broadcast();
  bool _initialized = false;

  Stream<String> get tapRoutes => _tapRoutes.stream;

  Future<void> initialize() async {
    if (_initialized) return;

    const initializationSettings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
    );

    await _plugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (response) {
        final route = response.payload;
        if (route != null && route.isNotEmpty) {
          _tapRoutes.add(route);
        }
      },
    );

    const channel = AndroidNotificationChannel(
      'lokals_alerts',
      'LOKALS Alerts',
      description: 'Important municipal, booking, transport, and system alerts.',
      importance: Importance.high,
    );

    await _plugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    _initialized = true;
  }

  Future<bool> requestPermissions() async {
    await initialize();
    final android = _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    return await android?.requestNotificationsPermission() ?? true;
  }

  Future<void> showNotification({
    required int id,
    required NotificationItemModel notification,
    required String route,
  }) async {
    await initialize();

    const androidDetails = AndroidNotificationDetails(
      'lokals_alerts',
      'LOKALS Alerts',
      channelDescription: 'Important municipal, booking, transport, and system alerts.',
      importance: Importance.high,
      priority: Priority.high,
    );

    await _plugin.show(
      id,
      notification.title,
      notification.body,
      const NotificationDetails(android: androidDetails),
      payload: route,
    );
  }

  Future<String?> getAvailableDeviceToken() async {
    // TODO: Return the Firebase Messaging token here when Firebase is configured.
    return null;
  }

  void dispose() {
    if (!_tapRoutes.isClosed) {
      _tapRoutes.close();
    }
  }
}

bool isImportantNotificationType(String? type) {
  return const {
    'municipal_alert',
    'report_update',
    'booking_update',
    'booking_status',
    'event_reminder',
    'ticket_update',
    'event_ticket',
    'delivery_update',
    'ride_update',
    'news_update',
    'system',
  }.contains(type);
}

int notificationHashId(String value) {
  return value.hashCode & 0x7fffffff;
}
