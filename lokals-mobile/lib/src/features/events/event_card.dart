import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import 'event_date_badge.dart';
import 'save_event_button.dart';

class EventCard extends StatelessWidget {
  const EventCard({super.key, required this.event, this.featured = false});

  final EventModel event;
  final bool featured;

  String get _locationLabel {
    return event.venueName ??
        event.locationLabel ??
        event.location ??
        [event.area, event.town].whereType<String>().where((value) => value.isNotEmpty).join(', ');
  }

  String get _priceLabel {
    if (event.ticketPriceFrom == null || event.ticketPriceFrom == '0') {
      return 'Free or RSVP';
    }
    if (event.ticketPriceTo != null && event.ticketPriceTo != event.ticketPriceFrom) {
      return 'N\$${event.ticketPriceFrom} - N\$${event.ticketPriceTo}';
    }
    return 'From N\$${event.ticketPriceFrom}';
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = resolveMediaUrl(event.imageUrl);

    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: () => context.push('/events/${event.id}'),
      child: LokalsCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (imageUrl != null) ...[
              AppNetworkImage(
                imageUrl: imageUrl,
                fallbackIcon: Icons.event_available_rounded,
                height: featured ? 200 : 160,
                width: double.infinity,
                borderRadius: BorderRadius.circular(20),
              ),
              const SizedBox(height: 14),
            ] else ...[
              Container(
                height: featured ? 200 : 160,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  color: AppColors.purpleSoftAlt,
                ),
                child: const Center(
                  child: Icon(Icons.event_available_rounded, size: 40, color: AppColors.primaryPurple),
                ),
              ),
              const SizedBox(height: 14),
            ],
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                EventDateBadge(startsAt: event.startsAt, endsAt: event.endsAt),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    AppBadge(label: event.category, tone: AppBadgeTone.brand),
                    AppBadge(
                      label: event.isFree ? 'Free' : 'Paid',
                      tone: event.isFree ? AppBadgeTone.success : AppBadgeTone.accent,
                    ),
                    if (event.isSaved)
                      const AppBadge(label: 'Saved', tone: AppBadgeTone.neutral),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  event.title,
                  style: AppTextStyles.h3.copyWith(fontSize: featured ? 22 : 18, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.place_outlined, size: 14, color: AppColors.mutedText),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        _locationLabel.isEmpty ? 'Okahandja' : _locationLabel,
                        style: AppTextStyles.bodyMuted,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              event.description ?? 'Local event details and attendance options.',
              style: AppTextStyles.bodyMuted,
              maxLines: featured ? 4 : 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 14),
            LayoutBuilder(
              builder: (context, constraints) {
                final isCompact = constraints.maxWidth < 340;
                final actionRow = [
                  SaveEventButton(eventId: event.id, isSaved: event.isSaved),
                  const SizedBox(width: 10, height: 10),
                  AppButton(
                    label: event.ticketingEnabled ? 'Tickets' : 'View',
                    expanded: false,
                    compact: isCompact,
                    onPressed: () => context.push('/events/${event.id}'),
                  ),
                ];

                if (isCompact) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _priceLabel,
                        style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.deepCharcoal),
                      ),
                      const SizedBox(height: 4),
                      Text('${event.attendeesCount} attending', style: AppTextStyles.caption),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: actionRow,
                      ),
                    ],
                  );
                }

                return Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _priceLabel,
                            style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.deepCharcoal),
                          ),
                          const SizedBox(height: 4),
                          Text('${event.attendeesCount} attending', style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                    ...actionRow,
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
