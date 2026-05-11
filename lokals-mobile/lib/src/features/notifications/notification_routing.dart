import '../../core/models.dart';

String normalizeInAppRoute(String route) {
  if (route.isEmpty) return '/activity';

  if (route == '/dashboard/bookings') return '/my-bookings';
  if (route == '/dashboard/tickets') return '/my-tickets';
  if (route == '/dashboard/reports') return '/my-reports';
  if (route == '/dashboard/jobs') return '/jobs';
  if (route == '/dashboard/profile') return '/profile';

  final reportMatch = RegExp(r'^/dashboard/reports/([^/?#]+)$').firstMatch(route);
  if (reportMatch != null) {
    return '/reports/${reportMatch.group(1)}';
  }

  return route;
}

String routeForNotification(NotificationItemModel item) {
  if ((item.target?.externalUrl ?? '').isNotEmpty) {
    final url = Uri.encodeComponent(item.target!.externalUrl!);
    final source = Uri.encodeComponent(item.target?.sourceName ?? item.title);
    final title = Uri.encodeComponent(item.target?.title ?? item.title);
    return '/article?url=$url&source=$source&title=$title';
  }

  final href = item.target?.href;
  if (href != null && href.isNotEmpty) {
    return normalizeInAppRoute(href);
  }

  final targetId = item.target?.id;

  switch (item.type) {
    case 'municipal_alert':
      return '/alerts';
    case 'report_update':
    case 'report_created':
      return targetId != null ? '/reports/$targetId' : '/my-reports';
    case 'booking_update':
    case 'booking_status':
      return '/my-bookings';
    case 'job_update':
    case 'job_application':
      return targetId != null ? '/jobs/$targetId' : '/jobs';
    case 'event_reminder':
      return targetId != null ? '/events/$targetId' : '/events';
    case 'ticket_update':
    case 'event_ticket':
      return targetId != null ? '/tickets/$targetId' : '/my-tickets';
    case 'delivery_update':
      return targetId != null ? '/delivery/$targetId' : '/delivery';
    case 'ride_update':
      return targetId != null ? '/ride/$targetId' : '/ride';
    case 'news_update':
      return targetId != null ? '/news/$targetId' : '/news';
    default:
      return '/activity';
  }
}
