import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../features/discovery/discovery_repository.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class CourierDashboardScreen extends ConsumerStatefulWidget {
  const CourierDashboardScreen({super.key});

  @override
  ConsumerState<CourierDashboardScreen> createState() =>
      _CourierDashboardScreenState();
}

class _CourierDashboardScreenState
    extends ConsumerState<CourierDashboardScreen> {
  bool _isUpdatingAvailability = false;
  int? _busyDeliveryId;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _refreshTimer = Timer.periodic(const Duration(seconds: 20), (_) {
      if (mounted) {
        ref.invalidate(courierDashboardProvider);
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _toggleAvailability(bool isOnline) async {
    setState(() => _isUpdatingAvailability = true);
    try {
      await ref
          .read(discoveryRepositoryProvider)
          .updateCourierAvailability(!isOnline);
      ref.invalidate(courierDashboardProvider);
    } finally {
      if (mounted) {
        setState(() => _isUpdatingAvailability = false);
      }
    }
  }

  Future<void> _handleDeliveryAction(int deliveryId, String action) async {
    setState(() => _busyDeliveryId = deliveryId);
    try {
      await ref
          .read(discoveryRepositoryProvider)
          .courierDeliveryAction(deliveryId: deliveryId, action: action);
      ref.invalidate(courierDashboardProvider);
      ref.invalidate(deliveriesProvider);

      // Show success feedback
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Delivery $action request sent'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (error) {
      if (!mounted) return;

      final errorMessage = switch (error.toString()) {
        String msg
            when msg.contains('422') || msg.contains('no longer available') =>
          'This delivery is no longer available. It may have been accepted by another courier.',
        String msg when msg.contains('403') || msg.contains('not approved') =>
          'Your courier profile is not yet approved. Complete verification to accept deliveries.',
        String msg when msg.contains('Failed to') =>
          error.toString().replaceAll('Exception: ', ''),
        _ =>
          'Unable to update delivery. Please check your connection and try again.',
      };

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Colors.red.shade700,
          duration: const Duration(seconds: 3),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _busyDeliveryId = null);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(courierDashboardProvider);

    return LokalsShell(
      title: 'Courier Dashboard',
      child: dashboard.when(
        data: (data) {
          final stats = Map<String, dynamic>.from(
            data['stats'] as Map? ?? const {},
          );
          final isOnline = stats['online'] == 1 || stats['online'] == true;
          final availableDeliveries =
              ((data['available_deliveries'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList();
          final deliveryHistory =
              ((data['delivery_history'] as List?) ?? const [])
                  .map((item) => Map<String, dynamic>.from(item as Map))
                  .toList();
          final activeDelivery = data['active_delivery'] is Map
              ? Map<String, dynamic>.from(data['active_delivery'] as Map)
              : null;

          return DashboardScaffold(
            title: 'Courier dashboard',
            subtitle:
                'Parcel requests, active drop-offs, and courier earnings in one focused workspace.',
            stats: stats,
            quickActions: [
              ...buildQuickActions(
                context,
                (data['quick_actions'] as List?) ?? const [],
              ),
              DashboardQuickActionTile(
                label: isOnline ? 'Go offline' : 'Go online',
                body: isOnline
                    ? 'Pause new parcel matching for now.'
                    : 'Become available for nearby delivery requests.',
                icon: isOnline
                    ? Icons.toggle_on_rounded
                    : Icons.toggle_off_rounded,
                onTap: _isUpdatingAvailability
                    ? () {}
                    : () => _toggleAvailability(isOnline),
              ),
            ],
            pendingTasks: ((data['pending_tasks'] as List?) ?? const [])
                .map((item) => Map<String, dynamic>.from(item as Map))
                .toList(),
            recentActivity: ((data['recent_activity'] as List?) ?? const [])
                .map((item) => Map<String, dynamic>.from(item as Map))
                .toList(),
            extraSections: [
              _StatusHintCard(
                title: 'Availability',
                body: isOnline
                    ? 'You are visible for new parcel requests.'
                    : 'You are offline and hidden from new parcel matching.',
                badge: isOnline ? 'Online' : 'Offline',
                tone: isOnline ? AppBadgeTone.success : AppBadgeTone.neutral,
              ),
              if (!isOnline) ...[
                const SizedBox(height: 12),
                const _StatusHintCard(
                  title: 'Go online to receive deliveries',
                  body: 'Customers can only match with you when courier mode is online and ready.',
                  badge: 'Offline',
                  tone: AppBadgeTone.warning,
                ),
              ],
              const SizedBox(height: 16),
              if (activeDelivery != null)
                _ActionSection(
                  title: 'Active delivery',
                  subtitle:
                      'Move the current parcel through its next handoff step.',
                  child: _TransportCard(
                    title:
                        '${activeDelivery['pickup_location'] ?? activeDelivery['pickup_address'] ?? 'Pickup'} -> ${activeDelivery['dropoff_location'] ?? activeDelivery['dropoff_address'] ?? 'Drop-off'}',
                    body:
                        '${activeDelivery['user']?['name'] ?? 'Resident'} | ${activeDelivery['status_label'] ?? activeDelivery['status'] ?? 'accepted'}',
                    actions: [
                      if (activeDelivery['status'] == 'accepted')
                        _CardAction(
                          label: _busyDeliveryId == activeDelivery['id']
                              ? 'Updating...'
                              : 'Pickup confirmed',
                          onPressed: _busyDeliveryId == activeDelivery['id']
                              ? null
                              : () => _handleDeliveryAction(
                                  activeDelivery['id'] as int,
                                  'pickup-confirmed',
                                ),
                        ),
                      if (activeDelivery['status'] == 'pickup_confirmed')
                        _CardAction(
                          label: _busyDeliveryId == activeDelivery['id']
                              ? 'Updating...'
                              : 'In transit',
                          onPressed: _busyDeliveryId == activeDelivery['id']
                              ? null
                              : () => _handleDeliveryAction(
                                  activeDelivery['id'] as int,
                                  'in-transit',
                                ),
                        ),
                      if (activeDelivery['status'] == 'in_transit')
                        _CardAction(
                          label: _busyDeliveryId == activeDelivery['id']
                              ? 'Updating...'
                              : 'Delivered',
                          onPressed: _busyDeliveryId == activeDelivery['id']
                              ? null
                              : () => _handleDeliveryAction(
                                  activeDelivery['id'] as int,
                                  'delivered',
                                ),
                        ),
                      if ((activeDelivery['user']?['phone'] ?? '').toString().isNotEmpty)
                        _CardAction(
                          label: 'Call sender',
                          variant: AppButtonVariant.secondary,
                          onPressed: () => const ContactActionService().call(
                            context,
                            activeDelivery['user']['phone'].toString(),
                          ),
                        ),
                    ],
                  ),
                ),
              if (activeDelivery != null) const SizedBox(height: 16),
              _ActionSection(
                title: 'Available deliveries',
                subtitle: 'Parcel requests still waiting for a courier.',
                child: availableDeliveries.isEmpty
                    ? const Text(
                        'New delivery requests will appear here when residents or businesses need a courier.',
                        style: TextStyle(color: AppColors.mutedText),
                      )
                    : Column(
                        children: availableDeliveries.take(5).map((item) {
                          final deliveryId = item['id'] as int;
                          final isBusy = _busyDeliveryId == deliveryId;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _TransportCard(
                              title:
                                  '${item['pickup_location'] ?? item['pickup_address'] ?? 'Pickup'} -> ${item['dropoff_location'] ?? item['dropoff_address'] ?? 'Drop-off'}',
                              body:
                                  '${item['user']?['name'] ?? 'Resident'} | ${item['parcel_size'] ?? 'Parcel'} | N\$ ${item['estimated_price'] ?? '0'}',
                              actions: [
                                _CardAction(
                                  label: isBusy ? 'Updating...' : 'Accept',
                                  onPressed: isBusy
                                      ? null
                                      : () => _handleDeliveryAction(
                                          deliveryId,
                                          'accept',
                                        ),
                                ),
                                _CardAction(
                                  label: 'Decline',
                                  variant: AppButtonVariant.secondary,
                                  onPressed: isBusy
                                      ? null
                                      : () => _handleDeliveryAction(
                                          deliveryId,
                                          'decline',
                                        ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
              ),
              const SizedBox(height: 16),
              buildDashboardCollectionSection(
                title: 'Delivery history',
                subtitle: 'Recent courier work and status changes.',
                items: deliveryHistory,
                emptyMessage:
                    'Accepted and completed deliveries will show up here once you start working.',
                icon: Icons.history_toggle_off_outlined,
                bodyBuilder: (item) =>
                    '${item['status_label'] ?? item['status'] ?? 'requested'} | ${item['user']?['name'] ?? 'Resident'}',
              ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading courier dashboard',
          message:
              'Checking delivery demand, active drop-offs, and earnings...',
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyStateView(
              title: 'Courier dashboard unavailable',
              body: 'We could not refresh delivery activity right now. Try again in a moment.',
              action: AppButton(
                label: 'Retry',
                expanded: false,
                onPressed: () => ref.invalidate(courierDashboardProvider),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ActionSection extends StatelessWidget {
  const _ActionSection({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return LokalsCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionTitle(title: title, subtitle: subtitle),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _TransportCard extends StatelessWidget {
  const _TransportCard({
    required this.title,
    required this.body,
    required this.actions,
  });

  final String title;
  final String body;
  final List<_CardAction> actions;

  @override
  Widget build(BuildContext context) {
    return LokalsSurfaceTile(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(body, style: const TextStyle(color: AppColors.mutedText)),
          if (actions.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: actions
                  .map(
                    (action) => AppButton(
                      label: action.label,
                      expanded: false,
                      variant: action.variant,
                      onPressed: action.onPressed,
                    ),
                  )
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class _CardAction {
  const _CardAction({
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
  });

  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
}

class _StatusHintCard extends StatelessWidget {
  const _StatusHintCard({
    required this.title,
    required this.body,
    required this.badge,
    required this.tone,
  });

  final String title;
  final String body;
  final String badge;
  final AppBadgeTone tone;

  @override
  Widget build(BuildContext context) {
    return LokalsCard(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 6),
                Text(body, style: const TextStyle(color: AppColors.mutedText)),
              ],
            ),
          ),
          AppBadge(label: badge, tone: tone),
        ],
      ),
    );
  }
}
