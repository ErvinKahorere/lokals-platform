import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';

class NewsCard extends StatelessWidget {
  const NewsCard({super.key, required this.item});

  final NewsItemModel item;

  @override
  Widget build(BuildContext context) {
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
              child: item.imageUrl == null
                  ? const Center(child: Icon(Icons.newspaper_rounded, size: 40, color: AppColors.primaryPurple))
                  : ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Image.network(item.imageUrl!, fit: BoxFit.cover, width: double.infinity),
                    ),
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                AppBadge(label: item.category.replaceAll('_', ' '), tone: AppBadgeTone.brand),
                Text(item.sourceName, style: AppTextStyles.caption),
              ],
            ),
            const SizedBox(height: 12),
            Text(item.title, style: AppTextStyles.h3.copyWith(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(item.summary, style: AppTextStyles.bodyMuted, maxLines: 3, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 12),
            if (item.feedReason != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Text('Why this story: ${item.feedReason}', style: AppTextStyles.caption.copyWith(color: AppColors.success)),
              ),
            Row(
              children: [
                Expanded(
                  child: Text(
                    [item.area, item.town].whereType<String>().join(', '),
                    style: AppTextStyles.bodyMuted,
                  ),
                ),
                AppButton(
                  label: 'Read full story',
                  expanded: false,
                  variant: AppButtonVariant.secondary,
                  onPressed: () => context.push(
                    '/article?url=${Uri.encodeComponent(item.externalUrl)}&source=${Uri.encodeComponent(item.sourceName)}&title=${Uri.encodeComponent(item.title)}',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
