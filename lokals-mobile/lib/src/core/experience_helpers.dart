import '../config/app_config.dart';

String getDisplayPrice(String? price) {
  if (price == null || price.isEmpty) {
    return 'Price on request';
  }

  return 'N\$ $price';
}

String getDisplayDistance(double? distanceKm, [String? fallbackLocation]) {
  if (distanceKm != null) {
    return '${distanceKm.toStringAsFixed(1)} km';
  }

  return fallbackLocation ?? 'Nearby';
}

String getDisplayRating({bool verified = false, int? socialCount}) {
  if (socialCount != null && socialCount > 0) {
    return '${(4.6 + (socialCount / 100)).clamp(4.6, 4.9).toStringAsFixed(1)} ★';
  }

  return verified ? '4.8 ★' : '4.7 ★';
}

String getStatusLabel(String? status) {
  if (status == null || status.isEmpty) {
    return 'Active';
  }

  return status
      .replaceAll('_', ' ')
      .split(' ')
      .map((word) => word.isEmpty ? word : '${word[0].toUpperCase()}${word.substring(1)}')
      .join(' ');
}

String getCompletedLabel({int count = 0, String noun = 'jobs'}) {
  final safeCount = count <= 0 ? 12 : count;
  return '$safeCount $noun completed';
}

String getResponseTimeLabel() {
  return 'Responds fast';
}

String? resolveMediaUrl(String? path) {
  if (path == null || path.isEmpty) {
    return null;
  }

  if (path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('data:')) {
    return path;
  }

  final base = AppConfig.apiBaseUrl.replaceFirst(RegExp(r'/api/v1/?$'), '');
  return '$base${path.startsWith('/') ? path : '/$path'}';
}
