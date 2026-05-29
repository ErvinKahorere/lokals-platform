import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../core/experience_helpers.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import 'hire_shared.dart';

class HireBookingsScreen extends ConsumerWidget {
  const HireBookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final query = ref.watch(myHireBookingsProvider);

    return LokalsShell(
      title: 'Hire bookings',
      showBack: true,
      bodyBottomInset: 10,
      child: query.when(
        data: (bookings) {
          final active = bookings
              .where(
                (item) => ![
                  'completed',
                  'cancelled',
                  'rejected',
                ].contains(item.status),
              )
              .toList();
          final completed = bookings
              .where((item) => item.status == 'completed')
              .toList();
          final depositTotal = active.fold<double>(
            0,
            (sum, item) =>
                sum + (double.tryParse(item.totals?.depositAmount ?? '') ?? 0),
          );

          return ListView(
            padding: EdgeInsets.fromLTRB(
              20,
              20,
              20,
              24,
            ),
            children: [
              SectionTitle(
                eyebrow: 'Hire',
                title: 'My hire bookings',
                subtitle:
                    'Track rental requests, owner approval, handover, and returns in one place.',
                action: AppButton(
                  label: 'Browse',
                  expanded: false,
                  onPressed: () => context.push('/hire'),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      label: 'Active',
                      value: '${active.length}',
                      color: AppColors.primaryPurple,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      label: 'Completed',
                      value: '${completed.length}',
                      color: AppColors.primaryGreen,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      label: 'Deposits',
                      value: getDisplayPrice(depositTotal.toStringAsFixed(0)),
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              if (bookings.isEmpty)
                EmptyStateView(
                  title: 'No hire bookings yet',
                  body:
                      'Request a rental and it will appear here with approval, handover, and return status.',
                  action: AppButton(
                    label: 'Browse hire items',
                    expanded: false,
                    onPressed: () => context.push('/hire'),
                  ),
                )
              else
                ...bookings.map(
                  (booking) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: HireBookingCard(
                      booking: booking,
                      onTap: () => context.push('/hire/bookings/${booking.id}'),
                    ),
                  ),
                ),
            ],
          );
        },
        loading: () => ListView(
          padding: const EdgeInsets.all(20),
          children: const [
            LoadingSkeleton(height: 100),
            SizedBox(height: 12),
            LoadingSkeleton(height: 160),
            SizedBox(height: 12),
            LoadingSkeleton(height: 160),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Hire bookings unavailable',
              body:
                  'Please sign in again or retry once your connection is stable.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(myHireBookingsProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
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
            style: AppTextStyles.h3.copyWith(fontSize: 18, color: color),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
