import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../features/discovery/discovery_repository.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'dashboard_repository.dart';
import 'widgets/dashboard_common.dart';

class DriverDashboardScreen extends ConsumerStatefulWidget {
  const DriverDashboardScreen({super.key});

  @override
  ConsumerState<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends ConsumerState<DriverDashboardScreen> {
  bool _isUpdatingAvailability = false;
  int? _busyRideId;

  Future<void> _toggleAvailability(bool isOnline) async {
    setState(() => _isUpdatingAvailability = true);
    try {
      await ref.read(discoveryRepositoryProvider).updateDriverAvailability(!isOnline);
      ref.invalidate(driverDashboardProvider);
    } finally {
      if (mounted) {
        setState(() => _isUpdatingAvailability = false);
      }
    }
  }

  Future<void> _handleRideAction(int rideId, String action) async {
    setState(() => _busyRideId = rideId);
    try {
      await ref.read(discoveryRepositoryProvider).driverRideAction(
            rideId: rideId,
            action: action,
          );
      ref.invalidate(driverDashboardProvider);
      ref.invalidate(ridesProvider);
    } finally {
      if (mounted) {
        setState(() => _busyRideId = null);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(driverDashboardProvider);

    return LokalsShell(
      title: 'Driver Dashboard',
      child: dashboard.when(
        data: (data) {
          final stats = Map<String, dynamic>.from(data['stats'] as Map? ?? const {});
          final isOnline = stats['online'] == 1 || stats['online'] == true;
          final availableRequests = ((data['available_requests'] as List?) ?? const [])
              .map((item) => Map<String, dynamic>.from(item as Map))
              .toList();
          final tripHistory = ((data['trip_history'] as List?) ?? const [])
              .map((item) => Map<String, dynamic>.from(item as Map))
              .toList();
          final activeTrip = data['active_trip'] is Map ? Map<String, dynamic>.from(data['active_trip'] as Map) : null;

          return DashboardScaffold(
            title: 'Driver dashboard',
            subtitle: 'Ride requests, active trips, and earnings in one practical driver workspace.',
            stats: stats,
            quickActions: [
              ...buildQuickActions(context, (data['quick_actions'] as List?) ?? const []),
              DashboardQuickActionTile(
                label: isOnline ? 'Go offline' : 'Go online',
                body: isOnline ? 'Pause new ride matching for now.' : 'Become available for nearby ride requests.',
                icon: isOnline ? Icons.toggle_on_rounded : Icons.toggle_off_rounded,
                onTap: _isUpdatingAvailability ? () {} : () => _toggleAvailability(isOnline),
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
                body: isOnline ? 'You are visible for new ride requests.' : 'You are offline and hidden from new ride matching.',
                badge: isOnline ? 'Online' : 'Offline',
                tone: isOnline ? AppBadgeTone.success : AppBadgeTone.neutral,
              ),
              const SizedBox(height: 16),
              if (activeTrip != null)
                _ActionSection(
                  title: 'Active trip',
                  subtitle: 'Move the current resident ride through its next step.',
                  child: _TransportCard(
                    title: '${activeTrip['pickup_location'] ?? 'Pickup'} -> ${activeTrip['dropoff_location'] ?? 'Drop-off'}',
                    body: '${activeTrip['user']?['name'] ?? 'Resident'} | ${activeTrip['status_label'] ?? activeTrip['status'] ?? 'accepted'}',
                    actions: [
                      if (activeTrip['status'] == 'accepted')
                        _CardAction(
                          label: _busyRideId == activeTrip['id'] ? 'Updating...' : 'Mark arrived',
                          onPressed: _busyRideId == activeTrip['id'] ? null : () => _handleRideAction(activeTrip['id'] as int, 'arrived'),
                        ),
                      if (activeTrip['status'] == 'arrived')
                        _CardAction(
                          label: _busyRideId == activeTrip['id'] ? 'Updating...' : 'Start trip',
                          onPressed: _busyRideId == activeTrip['id'] ? null : () => _handleRideAction(activeTrip['id'] as int, 'start'),
                        ),
                      if (activeTrip['status'] == 'in_progress')
                        _CardAction(
                          label: _busyRideId == activeTrip['id'] ? 'Updating...' : 'Complete trip',
                          onPressed: _busyRideId == activeTrip['id'] ? null : () => _handleRideAction(activeTrip['id'] as int, 'complete'),
                        ),
                    ],
                  ),
                ),
              if (activeTrip != null) const SizedBox(height: 16),
              _ActionSection(
                title: 'Available ride requests',
                subtitle: 'Resident requests still waiting for a driver.',
                child: availableRequests.isEmpty
                    ? const Text(
                        'New ride requests will appear here when residents request transport.',
                        style: TextStyle(color: AppColors.mutedText),
                      )
                    : Column(
                        children: availableRequests.take(5).map((item) {
                          final rideId = item['id'] as int;
                          final isBusy = _busyRideId == rideId;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _TransportCard(
                              title: '${item['pickup_location'] ?? 'Pickup'} -> ${item['dropoff_location'] ?? 'Drop-off'}',
                              body: '${item['user']?['name'] ?? 'Resident'} | ${item['ride_type'] ?? 'Standard'} | N\$ ${item['fare_estimate'] ?? '0'}',
                              actions: [
                                _CardAction(
                                  label: isBusy ? 'Updating...' : 'Accept',
                                  onPressed: isBusy ? null : () => _handleRideAction(rideId, 'accept'),
                                ),
                                _CardAction(
                                  label: 'Decline',
                                  variant: AppButtonVariant.secondary,
                                  onPressed: isBusy ? null : () => _handleRideAction(rideId, 'decline'),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
              ),
              const SizedBox(height: 16),
              buildDashboardCollectionSection(
                title: 'Trip history',
                subtitle: 'Recent trips and status changes.',
                items: tripHistory,
                emptyMessage: 'Completed and active trips will show up here once you start accepting rides.',
                icon: Icons.history_toggle_off_outlined,
                bodyBuilder: (item) => '${item['status_label'] ?? item['status'] ?? 'requested'} | ${item['user']?['name'] ?? 'Resident'}',
              ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(
          title: 'Loading driver dashboard',
          message: 'Checking ride demand, active trips, and earnings...',
        ),
        error: (error, _) => const Center(child: Text('Driver dashboard unavailable')),
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
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
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
