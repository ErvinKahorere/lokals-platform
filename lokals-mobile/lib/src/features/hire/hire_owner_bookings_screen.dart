import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'hire_shared.dart';

class HireOwnerBookingsScreen extends ConsumerStatefulWidget {
  const HireOwnerBookingsScreen({super.key});

  @override
  ConsumerState<HireOwnerBookingsScreen> createState() =>
      _HireOwnerBookingsScreenState();
}

class _HireOwnerBookingsScreenState
    extends ConsumerState<HireOwnerBookingsScreen> {
  int? _busyBookingId;

  @override
  Widget build(BuildContext context) {
    final query = ref.watch(ownerHireBookingsProvider);

    return LokalsShell(
      title: 'Owner queue',
      showBack: true,
      bodyBottomInset: 10,
      child: query.when(
        data: (bookings) {
          final pending = bookings
              .where((item) => item.status == 'pending')
              .length;
          final active = bookings
              .where(
                (item) => [
                  'accepted',
                  'confirmed',
                  'handed_over',
                  'in_use',
                  'return_due',
                  'returned',
                ].contains(item.status),
              )
              .length;

          return ListView(
            padding: EdgeInsets.fromLTRB(
              20,
              20,
              20,
              24,
            ),
            children: [
              SectionTitle(
                eyebrow: 'Hire owner',
                title: 'Rental booking queue',
                subtitle:
                    'Accept requests, track handover, and close out returns from your listed hire items.',
                action: AppButton(
                  label: 'Browse hire',
                  expanded: false,
                  variant: AppButtonVariant.secondary,
                  onPressed: () => context.push('/hire'),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _QueueStat(
                      label: 'Pending',
                      value: '$pending',
                      color: AppColors.warning,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _QueueStat(
                      label: 'Active',
                      value: '$active',
                      color: AppColors.primaryGreen,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              if (bookings.isEmpty)
                const EmptyStateView(
                  title: 'No owner bookings yet',
                  body:
                      'Customer requests for your hire items will appear here with next-step actions.',
                )
              else
                ...bookings.map(
                  (booking) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: HireBookingCard(
                      booking: booking,
                      onTap: () => context.push('/hire/bookings/${booking.id}'),
                      trailing: const Icon(Icons.chevron_right_rounded),
                    ),
                  ),
                ),
              if (bookings.isNotEmpty) ...[
                const SizedBox(height: 8),
                const SectionTitle(
                  title: 'Quick actions',
                  subtitle:
                      'Use the buttons below each booking state when action is needed.',
                ),
                const SizedBox(height: 12),
                ...bookings
                    .where((booking) => hireOwnerActions(booking).isNotEmpty)
                    .map(
                      (booking) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: AppCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                booking.referenceCode ?? 'Hire #${booking.id}',
                                style: AppTextStyles.h4,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                booking.item?.title ?? 'Hire item',
                                style: AppTextStyles.bodyMuted,
                              ),
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 10,
                                runSpacing: 10,
                                children: hireOwnerActions(booking)
                                    .map(
                                      (action) => AppButton(
                                        label: action.label,
                                        expanded: false,
                                        compact: true,
                                        variant: action.variant,
                                        isLoading: _busyBookingId == booking.id,
                                        onPressed: () => _runOwnerAction(
                                          booking.id,
                                          action.action,
                                        ),
                                      ),
                                    )
                                    .toList(),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
              ],
            ],
          );
        },
        loading: () => ListView(
          padding: const EdgeInsets.all(20),
          children: const [
            LoadingSkeleton(height: 110),
            SizedBox(height: 12),
            LoadingSkeleton(height: 170),
            SizedBox(height: 12),
            LoadingSkeleton(height: 170),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Owner queue unavailable',
              body:
                  'This area is available to owners and businesses with hire access.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(ownerHireBookingsProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _runOwnerAction(int bookingId, String action) async {
    setState(() => _busyBookingId = bookingId);
    try {
      await ref
          .read(discoveryRepositoryProvider)
          .runHireOwnerAction(bookingId: bookingId, action: action);
      ref.invalidate(ownerHireBookingsProvider);
      ref.invalidate(myHireBookingsProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Hire booking updated.')));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to update booking: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _busyBookingId = null);
      }
    }
  }
}

class _QueueStat extends StatelessWidget {
  const _QueueStat({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.caption),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.h2.copyWith(fontSize: 24, color: color),
          ),
        ],
      ),
    );
  }
}
