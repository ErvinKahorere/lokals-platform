class AppConfig {
  static const appMode = String.fromEnvironment(
    'APP_MODE',
    defaultValue: 'demo',
  );

  static const isDemoMode = appMode == 'demo';

  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000/api/v1',
  );

  static const apiBaseUrlHelp =
      'Android emulator should use http://10.0.2.2:8000/api/v1. '
      'A real Android device should use your computer LAN IP, for example '
      'http://192.168.1.10:8000/api/v1.';
}
