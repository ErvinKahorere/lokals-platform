import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';

class AppConfig {
  static const pilotTown = 'Okahandja';
  static const locationLock = true;
  static const pilotLocationMessage =
      'LOKALS is currently piloting in Okahandja.';
  static const okahandjaAreas = <String>[
    'Central Okahandja',
    'Nau-Aib',
    'Veddersdal',
    'Five Rand',
    'Smarties',
    'Ekunde',
    'Oshetu',
    'Osona',
    'Extension 5',
    'Extension 6',
    'Gross Barmen Road Area',
    'Okahandja Industrial Area',
    'Okahandja Park',
    'Vyf Rand',
    'Nooitgedacht Area',
  ];

  static const appMode = String.fromEnvironment(
    'APP_MODE',
    defaultValue: 'production',
  );

  static const isDemoMode = appMode == 'demo';

  static const _configuredApiBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get apiBaseUrl {
    return apiBaseUrlCandidates.first;
  }

  static List<String> get apiBaseUrlCandidates {
    if (_configuredApiBaseUrl.isNotEmpty) {
      return [_configuredApiBaseUrl];
    }

    if (!kIsWeb && Platform.isAndroid) {
      return const [
        'http://10.0.2.2:8000/api/v1',
        'http://127.0.0.1:8000/api/v1',
      ];
    }

    return const ['http://127.0.0.1:8000/api/v1'];
  }

  static const apiBaseUrlHelp =
      'Android emulator should use http://10.0.2.2:8000/api/v1. '
      'Android over USB can use http://127.0.0.1:8000/api/v1 when adb reverse is enabled. '
      'Android phones on Wi-Fi should pass a reachable LAN host with API_BASE_URL, for example '
      'http://192.168.x.x:8000/api/v1.';
}
