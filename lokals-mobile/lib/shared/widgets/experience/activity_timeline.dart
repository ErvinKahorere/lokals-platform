import 'package:flutter/material.dart';

import 'recent_activity_card.dart';

class ActivityTimeline extends StatelessWidget {
  const ActivityTimeline({super.key, required this.items});

  final List<ActivityTimelineItem> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items
          .map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: RecentActivityCard(
                icon: item.icon,
                title: item.title,
                body: item.body,
                time: item.time,
                status: item.status,
                onTap: item.onTap,
              ),
            ),
          )
          .toList(),
    );
  }
}

class ActivityTimelineItem {
  const ActivityTimelineItem({
    required this.icon,
    required this.title,
    required this.body,
    required this.time,
    required this.status,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String body;
  final String time;
  final String status;
  final VoidCallback? onTap;
}
