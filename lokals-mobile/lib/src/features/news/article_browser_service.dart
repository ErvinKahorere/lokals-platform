import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

final articleBrowserServiceProvider = Provider<ArticleBrowserService>((ref) {
  return const ArticleBrowserService();
});

class ArticleBrowserService {
  const ArticleBrowserService();

  Future<bool> openInApp(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) {
      return false;
    }

    if (await canLaunchUrl(uri)) {
      return launchUrl(uri, mode: LaunchMode.inAppBrowserView);
    }

    return false;
  }

  Future<bool> openExternal(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) {
      return false;
    }

    if (await canLaunchUrl(uri)) {
      return launchUrl(uri, mode: LaunchMode.externalApplication);
    }

    return false;
  }
}
