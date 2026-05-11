import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/experience/contact_actions.dart';
import '../../../shared/widgets/experience/save_button.dart';
import '../../core/experience_helpers.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'accommodation_owner_card.dart';
import 'accommodation_card.dart';

class AccommodationDetailsScreen extends ConsumerWidget {
  const AccommodationDetailsScreen({super.key, required this.accommodationId});

  final String accommodationId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final accommodationQuery = ref.watch(accommodationDetailsProvider(accommodationId));
    final accommodationsQuery = ref.watch(accommodationsProvider);

    return LokalsShell(
      title: 'Accommodation details',
      showBack: true,
      child: accommodationQuery.when(
        data: (item) {
          final imageUrl = resolveMediaUrl(item.imageUrl);
          final locationLabel = [item.area, item.town].whereType<String>().where((value) => value.isNotEmpty).join(', ');
          final amenities = (item.metadata?['amenities'] as List<dynamic>? ?? const ['Secure access', 'Local transport nearby'])
              .map((value) => value.toString())
              .toList();
          final rules = (item.metadata?['rules'] as List<dynamic>? ?? const <dynamic>[])
              .map((value) => value.toString())
              .toList();
          final availability = item.metadata?['availability']?.toString() ?? 'Contact owner to confirm availability.';
          final related = (accommodationsQuery.asData?.value ?? [])
              .where((entry) => entry.id != item.id && (entry.type == item.type || entry.area == item.area))
              .take(4)
              .toList();

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
            children: [
              AppCard(
                padding: EdgeInsets.zero,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      children: [
                        Container(
                          height: 240,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: AppColors.neutralSoft,
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                            image: imageUrl != null ? DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover) : null,
                          ),
                          child: imageUrl == null
                              ? const Center(
                                  child: Icon(Icons.home_work_outlined, size: 52, color: AppColors.mutedText),
                                )
                              : null,
                        ),
                        Positioned(
                          left: 12,
                          top: 12,
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              AppBadge(label: _typeLabel(item.type), tone: AppBadgeTone.info),
                              if (item.pricePeriod != null) AppBadge(label: 'Per ${item.pricePeriod}', tone: AppBadgeTone.info),
                            ],
                          ),
                        ),
                        Positioned(
                          right: 12,
                          top: 12,
                          child: SaveButton(
                            storageId: 'accommodation:${item.id}',
                            itemType: 'accommodation',
                            itemId: item.id,
                            onChanged: (saved) {
                              final label = saved ? 'Saved' : 'Removed from saved';
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(label)));
                            },
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(child: Text(item.title, style: AppTextStyles.h2.copyWith(fontSize: 28))),
                              if (item.ownerVerified || item.businessVerified) const AppBadge(label: 'Verified owner', tone: AppBadgeTone.success),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(getDisplayPrice(item.price), style: AppTextStyles.h2.copyWith(color: AppColors.primaryPurple)),
                          const SizedBox(height: 4),
                          Text('per ${item.pricePeriod ?? 'month'}', style: AppTextStyles.bodyMuted),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              const Icon(Icons.place_outlined, size: 16, color: AppColors.mutedText),
                              const SizedBox(width: 6),
                              Expanded(child: Text(locationLabel.isEmpty ? (item.location ?? 'Okahandja') : locationLabel, style: AppTextStyles.bodyMuted)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: [
                              if (item.bedrooms != null) AppBadge(label: '${item.bedrooms} bed', tone: AppBadgeTone.neutral),
                              if (item.bathrooms != null) AppBadge(label: '${item.bathrooms} bath', tone: AppBadgeTone.neutral),
                              AppBadge(label: item.status ?? 'published', tone: AppBadgeTone.success),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              const Text('Description', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              AppCard(
                child: Text(
                  item.description?.trim().isNotEmpty == true
                      ? item.description!
                      : 'This owner has not added more details yet. Call or WhatsApp to confirm pricing, viewing, and stay availability.',
                  style: AppTextStyles.bodyMuted.copyWith(height: 1.5),
                ),
              ),
              const SizedBox(height: 18),
              const Text('Amenities', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              AppCard(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: amenities.map((item) => AppBadge(label: item, tone: AppBadgeTone.info)).toList(),
                ),
              ),
              if (rules.isNotEmpty) ...[
                const SizedBox(height: 18),
                const Text('Rules', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                AppCard(
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: rules.map((item) => AppBadge(label: item, tone: AppBadgeTone.neutral)).toList(),
                  ),
                ),
              ],
              const SizedBox(height: 18),
              const Text('Availability', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              AppCard(
                child: Row(
                  children: [
                    const Icon(Icons.schedule_outlined, color: AppColors.primaryPurple),
                    const SizedBox(width: 10),
                    Expanded(child: Text(availability, style: AppTextStyles.bodyMuted)),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              const Text('Location / map', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.map_outlined, color: AppColors.primaryPurple),
                        const SizedBox(width: 10),
                        Expanded(child: Text(locationLabel.isEmpty ? (item.location ?? 'Okahandja') : locationLabel, style: AppTextStyles.bodyMuted)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const Text('Map preview will expand here as location coverage improves.', style: AppTextStyles.caption),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              const Text('Owner / agent', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              AccommodationOwnerCard(item: item),
              const SizedBox(height: 12),
              ContactActions(
                name: item.ownerName ?? item.businessName ?? item.userName ?? item.title,
                phone: item.ownerPhone ?? item.businessPhone ?? item.userPhone,
                whatsapp: item.ownerWhatsapp ?? item.businessWhatsapp ?? item.userWhatsapp ?? item.userPhone,
                whatsappMessage: 'Hi, I saw your accommodation listing on LOKALS and would like to enquire.',
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Book / Enquire',
                      onPressed: () => _showBookingPlaceholder(context),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AppButton(
                      label: 'Call',
                      variant: AppButtonVariant.secondary,
                      onPressed: () {
                        final phone = item.ownerPhone ?? item.businessPhone ?? item.userPhone;
                        if (phone == null || phone.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Phone number is not available yet.')));
                          return;
                        }
                        launchPhoneCall(context, phone);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  const Expanded(child: Text('Related listings', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700))),
                  TextButton(onPressed: () => context.push('/accommodation'), child: const Text('Back')),
                ],
              ),
              const SizedBox(height: 12),
              if (related.isEmpty)
                const EmptyStateView(
                  title: 'No related listings yet.',
                  body: 'More similar places will appear here soon.',
                )
              else
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: related.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.68,
                  ),
                  itemBuilder: (context, index) => AccommodationCard(item: related[index]),
                ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading accommodation',
          message: 'Preparing listing details, owner info, and nearby stays...',
        ),
        error: (error, _) => const Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Accommodation unavailable',
              body: 'We could not load this listing right now.',
            ),
          ),
        ),
      ),
    );
  }

  static String _typeLabel(String type) {
    switch (type) {
      case 'property_sale':
        return 'Property sale';
      case 'short_stay':
        return 'Short stay';
      case 'guest_room':
        return 'Room';
      case 'guesthouse':
        return 'Guesthouse';
      case 'bnb':
        return 'B&B';
      default:
        return 'Rental';
    }
  }
}

void _showBookingPlaceholder(BuildContext context) {
  showModalBottomSheet<void>(
    context: context,
    builder: (context) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Booking / enquiry', style: AppTextStyles.h3),
            const SizedBox(height: 8),
            const Text(
              'Direct booking is coming soon. Please call or WhatsApp the owner for now to confirm availability and pricing.',
              style: AppTextStyles.bodyMuted,
            ),
            const SizedBox(height: 16),
            AppButton(
              label: 'Close',
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      ),
    ),
  );
}
