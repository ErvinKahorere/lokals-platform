import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class ArticleBrowserAppBar extends StatelessWidget implements PreferredSizeWidget {
  const ArticleBrowserAppBar({
    super.key,
    required this.sourceName,
    required this.domain,
    required this.onOpenBrowser,
  });

  final String sourceName;
  final String domain;
  final VoidCallback onOpenBrowser;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      titleSpacing: 0,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(sourceName, style: AppTextStyles.h4),
          Text(domain, style: AppTextStyles.caption),
        ],
      ),
      actions: [
        IconButton(
          tooltip: 'Open in browser',
          onPressed: onOpenBrowser,
          icon: const Icon(Icons.open_in_new_rounded, color: AppColors.primaryPurple),
        ),
        IconButton(
          tooltip: 'Share',
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Sharing is coming soon. Please use Open in browser for now.')),
            );
          },
          icon: const Icon(Icons.ios_share_rounded, color: AppColors.primaryPurple),
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
