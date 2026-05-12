import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';

class NewsCard extends StatelessWidget {
  const NewsCard({super.key, required this.item});

  final NewsItemModel item;

  String _formatPublishedAt() {
    if (item.publishedAt == null || item.publishedAt!.isEmpty) return 'Latest update';
    final parsed = DateTime.tryParse(item.publishedAt!);
    if (parsed == null) return 'Latest update';
    return DateFormat('EEE, d MMM • HH:mm').format(parsed.toLocal());
  }

  String _locationLabel() {
    final location = [item.area, item.town].whereType<String>().where((value) => value.isNotEmpty).join(', ');
    return location.isEmpty ? 'Okahandja' : location;
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = resolveMediaUrl(item.imageUrl);

    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: () => context.push('/news/${item.id}'),
      child: LokalsCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 150,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: AppColors.neutralSoft,
              ),
              child: AppNetworkImage(
                imageUrl: imageUrl,
                fallbackIcon: Icons.newspaper_rounded,
                width: double.infinity,
                height: 150,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                AppBadge(label: item.category.replaceAll('_', ' '), tone: AppBadgeTone.brand),
                AppBadge(label: _locationLabel(), tone: AppBadgeTone.neutral),
              ],
            ),
            const SizedBox(height: 12),
            Text(item.title, style: AppTextStyles.h3.copyWith(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(item.summary, style: AppTextStyles.bodyMuted, maxLines: 3, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 12),
            LayoutBuilder(
              builder: (context, constraints) {
                final button = AppButton(
                  label: 'Read Full Story',
                  expanded: false,
                  compact: constraints.maxWidth < 340,
                  variant: AppButtonVariant.secondary,
                  onPressed: () => context.push(
                    '/article?url=${Uri.encodeComponent(item.externalUrl)}&source=${Uri.encodeComponent(item.sourceName)}&title=${Uri.encodeComponent(item.title)}',
                  ),
                );

                if (constraints.maxWidth < 340) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.sourceName, style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(_formatPublishedAt(), style: AppTextStyles.caption),
                      const SizedBox(height: 10),
                      button,
                    ],
                  );
                }

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.sourceName, style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          Text(_formatPublishedAt(), style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    button,
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
