import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import 'article_browser_app_bar.dart';
import 'article_browser_service.dart';

class ArticleBrowserScreen extends ConsumerStatefulWidget {
  const ArticleBrowserScreen({
    super.key,
    required this.url,
    required this.sourceName,
    required this.title,
  });

  final String url;
  final String sourceName;
  final String title;

  @override
  ConsumerState<ArticleBrowserScreen> createState() => _ArticleBrowserScreenState();
}

class _ArticleBrowserScreenState extends ConsumerState<ArticleBrowserScreen> {
  bool _loading = true;
  bool _failed = false;

  Future<void> _openInApp() async {
    final opened = await ref.read(articleBrowserServiceProvider).openInApp(widget.url);
    if (!mounted) return;
    setState(() {
      _loading = false;
      _failed = !opened;
    });
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _openInApp();
    });
  }

  @override
  Widget build(BuildContext context) {
    final domain = Uri.tryParse(widget.url)?.host ?? widget.sourceName;

    return Scaffold(
      appBar: ArticleBrowserAppBar(
        sourceName: widget.sourceName,
        domain: domain,
        onOpenBrowser: () async {
          await ref.read(articleBrowserServiceProvider).openExternal(widget.url);
        },
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Center(
            child: LokalsCard(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('External article', style: AppTextStyles.h3),
                  const SizedBox(height: 8),
                  Text(widget.title, style: AppTextStyles.h4),
                  const SizedBox(height: 12),
                  Text(
                    'Content is provided by external sources. LOKALS does not own this content.',
                    style: AppTextStyles.bodyMuted,
                  ),
                  const SizedBox(height: 16),
                  if (_loading) ...[
                    const LinearProgressIndicator(color: AppColors.primaryPurple),
                    const SizedBox(height: 12),
                    Text('Opening ${widget.sourceName} in-app...', style: AppTextStyles.bodyMuted),
                  ] else if (_failed) ...[
                    const Text('Unable to load article in-app.', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    AppButton(
                      label: 'Try again',
                      variant: AppButtonVariant.secondary,
                      onPressed: () async {
                        setState(() {
                          _loading = true;
                          _failed = false;
                        });
                        await _openInApp();
                      },
                    ),
                    const SizedBox(height: 12),
                    AppButton(
                      label: 'Open in browser',
                      onPressed: () async {
                        await ref.read(articleBrowserServiceProvider).openExternal(widget.url);
                      },
                    ),
                  ] else ...[
                    const Text('The article was opened using your device browser view.', style: AppTextStyles.bodyMuted),
                    const SizedBox(height: 12),
                    AppButton(
                      label: 'Open in browser',
                      variant: AppButtonVariant.secondary,
                      onPressed: () async {
                        await ref.read(articleBrowserServiceProvider).openExternal(widget.url);
                      },
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
