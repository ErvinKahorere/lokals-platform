import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'src/app.dart';
import 'src/features/notifications/notification_sync_scope.dart';

void main() {
  runApp(const ProviderScope(child: NotificationSyncScope(child: LokalsApp())));
}
