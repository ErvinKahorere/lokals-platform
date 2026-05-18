import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/experience/contact_actions.dart';
import '../../../shared/widgets/experience/trust_row.dart';
import '../../core/experience_helpers.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../auth/auth_navigation.dart';
import '../discovery/discovery_repository.dart';

class DirectoryDetailsScreen extends ConsumerStatefulWidget {
  const DirectoryDetailsScreen({super.key, required this.directoryId});

  final String directoryId;

  @override
  ConsumerState<DirectoryDetailsScreen> createState() => _DirectoryDetailsScreenState();
}

class _DirectoryDetailsScreenState extends ConsumerState<DirectoryDetailsScreen> {
  bool _followBusy = false;

  @override
  Widget build(BuildContext context) {
    final details = ref.watch(directoryDetailsProvider(widget.directoryId));
    final followedIds = ref.watch(followedOrganizationIdsProvider);
    final auth = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Directory details',
      showBack: true,
      child: details.when(
        data: (item) {
          final isFollowing = followedIds.asData?.value.contains(item.id) ?? false;
          final openingHours = item.openingHours.isEmpty
              ? [
                  {'day': 'Daily', 'open': '08:00', 'close': '17:00'}
                ]
              : item.openingHours;

          Future<void> toggleFollow() async {
            if (auth.token == null) {
              promptSignIn(context, next: GoRouterState.of(context).uri.toString());
              return;
            }

            setState(() => _followBusy = true);
            try {
              if (isFollowing) {
                await ref.read(discoveryRepositoryProvider).unfollowOrganization(item.id);
              } else {
                await ref.read(discoveryRepositoryProvider).followOrganization(item.id);
              }
              ref.invalidate(followedOrganizationIdsProvider);
            } finally {
              if (mounted) {
                setState(() => _followBusy = false);
              }
            }
          }

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: AppColors.purpleSoft,
                          child: Text(
                            item.name.characters.first.toUpperCase(),
                            style: AppTextStyles.h3.copyWith(color: AppColors.primaryPurple),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  if (item.isPublicService)
                                    const AppBadge(label: 'Public service', tone: AppBadgeTone.info),
                                  if (item.isVerified)
                                    const AppBadge(label: 'Verified', tone: AppBadgeTone.success),
                                  AppBadge(
                                    label: item.openNow ? 'Open now' : item.availabilityStatus ?? 'Check hours',
                                    tone: item.openNow ? AppBadgeTone.success : AppBadgeTone.warning,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(item.name, style: AppTextStyles.h2.copyWith(fontSize: 24)),
                              const SizedBox(height: 6),
                              Text(
                                [item.category, item.subcategory]
                                    .whereType<String>()
                                    .where((value) => value.isNotEmpty)
                                    .join(' | '),
                                style: AppTextStyles.bodyMuted,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                [item.area, item.town, item.location]
                                    .whereType<String>()
                                    .where((value) => value.isNotEmpty)
                                    .join(', '),
                                style: AppTextStyles.bodyMuted,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (item.emergencyContact) ...[
                      const SizedBox(height: 12),
                      const Text(
                        'Emergency contact available',
                        style: TextStyle(
                          color: AppColors.danger,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                    const SizedBox(height: 14),
                    Text(
                      item.description ??
                          'Trusted local directory profile with contact details and service information.',
                      style: AppTextStyles.body,
                    ),
                    const SizedBox(height: 14),
                    TrustRow(
                      verified: item.isVerified,
                      ratingLabel:
                          '${getDisplayRating(verified: item.isVerified, rating: item.rating)}${item.reviewCount != null ? ' | ${item.reviewCount} reviews' : ''}',
                      distanceLabel: getDisplayDistance(item.distanceKm, item.location),
                      completedLabel: '${item.followersCount ?? 0} followers',
                      responseLabel: 'Posts local updates',
                    ),
                    const SizedBox(height: 14),
                    AppButton(
                      label: isFollowing ? 'Following' : 'Follow updates',
                      expanded: false,
                      variant: isFollowing ? AppButtonVariant.primary : AppButtonVariant.secondary,
                      onPressed: _followBusy ? null : toggleFollow,
                    ),
                    const SizedBox(height: 14),
                    ContactActions(
                      name: item.name,
                      phone: item.phone,
                      whatsapp: item.whatsapp,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Contact details', style: AppTextStyles.h3),
                    const SizedBox(height: 12),
                    Text('Phone: ${item.phone ?? 'Not listed'}', style: AppTextStyles.body),
                    const SizedBox(height: 8),
                    Text('WhatsApp: ${item.whatsapp ?? item.phone ?? 'Not listed'}', style: AppTextStyles.body),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Services offered', style: AppTextStyles.h3),
                    const SizedBox(height: 12),
                    if (item.servicesOffered.isEmpty)
                      const Text(
                        'Services and rates are being updated. Call for the latest details.',
                        style: AppTextStyles.bodyMuted,
                      )
                    else
                      ...item.servicesOffered.map(
                        (service) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Text('- $service', style: AppTextStyles.body),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Opening hours', style: AppTextStyles.h3),
                    const SizedBox(height: 12),
                    ...openingHours.map(
                      (slot) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text(
                          '${slot['day'] ?? 'Open'}: ${slot['open'] ?? '08:00'} - ${slot['close'] ?? '17:00'}',
                          style: AppTextStyles.body,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text('Announcements and alerts', style: AppTextStyles.h2),
              const SizedBox(height: 12),
              if (item.alerts.isEmpty)
                const AppCard(
                  child: Text(
                    'Follow this profile to receive announcements and service updates here.',
                    style: AppTextStyles.bodyMuted,
                  ),
                )
              else
                ...item.alerts.map(
                  (alert) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: AppCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('UPDATE', style: AppTextStyles.eyebrow),
                          const SizedBox(height: 8),
                          Text(alert.title, style: AppTextStyles.h4),
                          const SizedBox(height: 6),
                          Text(alert.body, style: AppTextStyles.bodyMuted),
                        ],
                      ),
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Location', style: AppTextStyles.h3),
                    const SizedBox(height: 8),
                    Text(
                      [item.location, item.area, item.town]
                          .whereType<String>()
                          .where((value) => value.isNotEmpty)
                          .join(', '),
                      style: AppTextStyles.body,
                    ),
                    const SizedBox(height: 12),
                    AppButton(
                      label: 'Open in maps',
                      expanded: false,
                      variant: AppButtonVariant.secondary,
                      onPressed: () => const ContactActionService().openMaps(
                        context,
                        query: [item.location, item.area, item.town]
                            .whereType<String>()
                            .where((value) => value.isNotEmpty)
                            .join(', '),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading directory details',
          message: 'Bringing organization details into view...',
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Directory details unavailable',
              body: 'We could not load this directory profile right now.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(directoryDetailsProvider(widget.directoryId)),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
