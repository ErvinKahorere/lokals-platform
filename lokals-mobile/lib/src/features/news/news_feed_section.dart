import 'package:flutter/material.dart';

import '../../core/models.dart';
import '../../widgets/cards.dart';
import 'news_card.dart';

class NewsFeedSection extends StatelessWidget {
  const NewsFeedSection({
    super.key,
    required this.title,
    required this.subtitle,
    required this.items,
  });

  final String title;
  final String subtitle;
  final List<NewsItemModel> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionTitle(title: title, subtitle: subtitle),
        const SizedBox(height: 12),
        if (items.isEmpty)
          const EmptyStateView(
            title: 'No local news yet',
            body: 'Stories will appear here once local sources update.',
          )
        else
          ...items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: NewsCard(item: item),
              )),
      ],
    );
  }
}
