import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/experience/contact_actions.dart';
import '../../../shared/widgets/experience/quick_call_button.dart';
import '../../../shared/widgets/experience/trust_row.dart';
import '../../core/experience_helpers.dart';
import '../../core/models.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../auth/auth_navigation.dart';
import 'services_repository.dart';

class ProviderDetailsScreen extends ConsumerStatefulWidget {
  const ProviderDetailsScreen({super.key, required this.providerId});

  final String providerId;

  @override
  ConsumerState<ProviderDetailsScreen> createState() => _ProviderDetailsScreenState();
}

class _ProviderDetailsScreenState extends ConsumerState<ProviderDetailsScreen> {
  bool _followBusy = false;

  @override
  Widget build(BuildContext context) {
    final provider = ref.watch(providerDetailsProvider(widget.providerId));
    final followedProviderIds = ref.watch(followedProviderIdsProvider);
    final auth = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Provider',
      showBack: true,
      child: provider.when(
        data: (item) {
          final services = item.services.where((service) => service.isActive).toList();
          final bookableServices = services.where((service) => service.isBookable).toList();
          final availability = item.availabilitySlots.isEmpty
              ? [AvailabilitySlotModel(id: 0, dayOfWeek: 1, startTime: '08:00', endTime: '17:00')]
              : item.availabilitySlots;
          final alerts = item.alerts.isEmpty
              ? [AlertFeedModel(id: 'placeholder', sourceType: 'provider', title: 'No provider alerts yet', body: 'New updates from this provider will appear here once posted.')]
              : item.alerts;
          final isFollowing = followedProviderIds.asData?.value.contains(item.id) ?? false;
          final skills = services.map((service) => service.name).take(6).toList();
          final openingSummary = '${_weekdayLabel(availability.first.dayOfWeek)} ${availability.first.startTime} - ${availability.first.endTime}';
          final messenger = ScaffoldMessenger.of(context);

          Future<void> toggleFollow() async {
            if (auth.token == null) {
              promptSignIn(
                context,
                next: GoRouterState.of(context).uri.toString(),
              );
              return;
            }
            setState(() => _followBusy = true);
            try {
              if (isFollowing) {
                await ref.read(servicesRepositoryProvider).unfollowProvider(item.id);
                ref.invalidate(followedProviderIdsProvider);
                if (!mounted) return;
                messenger.showSnackBar(const SnackBar(content: Text('Unfollowed')));
              } else {
                await ref.read(servicesRepositoryProvider).followProvider(item.id);
                ref.invalidate(followedProviderIdsProvider);
                if (!mounted) return;
                messenger.showSnackBar(const SnackBar(content: Text('Following')));
              }
            } finally {
              if (mounted) {
                setState(() => _followBusy = false);
              }
            }
          }

          final summaryLine = [
            getDisplayRating(verified: item.isVerified, rating: item.rating),
            if (item.reviewCount != null) '${item.reviewCount} reviews',
            item.area ?? item.town ?? item.location,
            getDisplayDistance(item.distanceKm, item.location),
          ].where((value) => value.isNotEmpty).join(' | ');

          return Stack(
            children: [
              ListView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 124),
                children: [
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            CircleAvatar(
                              radius: 36,
                              backgroundColor: AppColors.purpleSoftAlt,
                              child: Text(
                                item.name.characters.first.toUpperCase(),
                                style: AppTextStyles.h2.copyWith(color: AppColors.primaryPurple),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    crossAxisAlignment: WrapCrossAlignment.center,
                                    children: [
                                      if (item.isVerified) const AppBadge(label: 'Verified', tone: AppBadgeTone.success),
                                      AppBadge(
                                        label: item.openNow ? 'Open now' : (item.availabilityStatus ?? 'Available'),
                                        tone: item.openNow ? AppBadgeTone.success : AppBadgeTone.info,
                                      ),
                                      AppBadge(
                                        label: getResponseTimeLabel(item.responseTimeLabel),
                                        tone: AppBadgeTone.warning,
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(item.name, style: AppTextStyles.h2.copyWith(fontSize: 26)),
                                  const SizedBox(height: 6),
                                  Text(
                                    item.subcategory ?? item.category,
                                    style: AppTextStyles.body.copyWith(
                                      color: AppColors.primaryPurple,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(summaryLine, style: AppTextStyles.bodyMuted),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        TrustRow(
                          verified: item.isVerified,
                          ratingLabel: '${getDisplayRating(verified: item.isVerified, rating: item.rating)}${item.reviewCount != null ? ' | ${item.reviewCount} reviews' : ''}',
                          distanceLabel: getDisplayDistance(item.distanceKm, item.location),
                          completedLabel: item.followersCount != null ? '${item.followersCount} followers' : getCompletedLabel(count: item.services.length * 6),
                          responseLabel: getResponseTimeLabel(item.responseTimeLabel),
                        ),
                        const SizedBox(height: 16),
                        if ((item.about ?? item.description)?.isNotEmpty == true)
                          Text(
                            item.about ?? item.description!,
                            style: AppTextStyles.bodyMuted.copyWith(height: 1.5),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text('Provider info', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.22,
                    children: [
                      _InfoCard(
                        icon: Icons.place_outlined,
                        title: 'Location',
                        body: [item.area, item.town, item.location].whereType<String>().where((value) => value.isNotEmpty).join(', '),
                      ),
                      _InfoCard(
                        icon: Icons.schedule_outlined,
                        title: 'Opening hours',
                        body: openingSummary,
                      ),
                      _InfoCard(
                        icon: Icons.bolt_outlined,
                        title: 'Response time',
                        body: getResponseTimeLabel(item.responseTimeLabel),
                      ),
                      _InfoCard(
                        icon: Icons.workspace_premium_outlined,
                        title: 'Experience',
                        body: item.isVerified ? 'Verified local provider' : 'Growing local profile',
                      ),
                    ],
                  ),
                  if (skills.isNotEmpty) ...[
                    const SizedBox(height: 18),
                    const Text('Skills & services', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: skills
                          .map(
                            (skill) => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: AppColors.softBackground,
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Text(skill, style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal)),
                            ),
                          )
                          .toList(),
                    ),
                  ],
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Services & rates',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                        ),
                      ),
                      TextButton(
                        onPressed: bookableServices.isEmpty ? null : () => context.push('/book/${item.id}'),
                        child: const Text('Book now'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (services.isEmpty)
                    const AppCard(
                      child: Text('Services are being updated. Call or WhatsApp this provider for the latest rates and availability.'),
                    )
                  else
                    ...services.map(
                      (service) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: AppCard(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(service.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                    const SizedBox(height: 6),
                                    Text(
                                      service.description ?? 'Local service with clear pricing and direct contact.',
                                      style: const TextStyle(color: AppColors.mutedText),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      service.durationMinutes > 0 ? '${service.durationMinutes} mins' : 'Timing confirmed on contact',
                                      style: AppTextStyles.caption,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    getServicePriceLabel(price: service.price, priceType: service.priceType),
                                    style: const TextStyle(fontWeight: FontWeight.w800),
                                  ),
                                  const SizedBox(height: 6),
                                  AppBadge(
                                    label: service.isBookable ? 'Bookable' : 'Call first',
                                    tone: service.isBookable ? AppBadgeTone.success : AppBadgeTone.warning,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  const SizedBox(height: 18),
                  const Text('Availability', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  ...availability.map(
                    (slot) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: AppCard(
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(_weekdayLabel(slot.dayOfWeek)),
                          subtitle: Text('${slot.startTime} - ${slot.endTime}'),
                          trailing: Icon(
                            item.openNow ? Icons.check_circle_rounded : Icons.schedule_outlined,
                            color: item.openNow ? AppColors.primaryGreen : AppColors.mutedText,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Actions',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                        ),
                      ),
                      AppButton(
                        label: isFollowing ? 'Following' : 'Follow',
                        expanded: false,
                        variant: isFollowing ? AppButtonVariant.primary : AppButtonVariant.secondary,
                        onPressed: _followBusy ? null : toggleFollow,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ContactActions(name: item.name, phone: item.phone, whatsapp: item.whatsapp),
                  const SizedBox(height: 18),
                  const Text('Provider updates', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  ...alerts.map(
                    (alert) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: AppCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('UPDATE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.warning)),
                            const SizedBox(height: 8),
                            Text(alert.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 6),
                            Text(alert.body, style: const TextStyle(color: AppColors.mutedText)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              Positioned(
                left: 20,
                right: 20,
                bottom: 18,
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.border),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      QuickCallButton(phone: item.phone),
                      const SizedBox(width: 12),
                      Expanded(
                        child: AppButton(
                          label: 'Book',
                          onPressed: bookableServices.isEmpty ? null : () => context.push('/book/${item.id}'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading provider',
          message: 'Gathering contact details, rates, and availability...',
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Failed to load provider details.',
              body: 'Please try again in a moment.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(providerDetailsProvider(widget.providerId)),
              ),
            ),
          ),
        ),
      ),
    );
  }

  static String _weekdayLabel(int dayOfWeek) {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (dayOfWeek >= 0 && dayOfWeek < labels.length) {
      return labels[dayOfWeek];
    }

    return 'Day $dayOfWeek';
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.title,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.purpleSoftAlt,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.primaryPurple),
          ),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(body, style: AppTextStyles.bodyMuted),
        ],
      ),
    );
  }
}
