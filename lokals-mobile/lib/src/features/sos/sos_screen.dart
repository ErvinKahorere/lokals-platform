import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../config/app_config.dart';
import '../../core/models.dart';
import '../../services/contact_action_service.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';
import '../requests/request_success_state.dart';

class SosScreen extends ConsumerStatefulWidget {
  const SosScreen({super.key});

  @override
  ConsumerState<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends ConsumerState<SosScreen> with SingleTickerProviderStateMixin {
  static const List<String> _types = [
    'Personal safety',
    'Medical',
    'Roadside',
    'Fire',
    'Public disturbance',
  ];

  static const List<String> _reasons = [
    'Need urgent help near my location',
    'Medical emergency',
    'Unsafe situation, need help now',
    'Roadside emergency',
  ];

  static const List<String> _locations = [
    'Central Okahandja',
    'Nau-Aib',
    'Five Rand',
    'Okahandja Park',
    'Gross Barmen Road',
  ];

  String _emergencyType = _types.first;
  String _reason = _reasons.first;
  String _location = _locations.first;
  bool _isBusy = false;
  String? _error;
  SosModel? _successItem;
  int? _countdown;
  Timer? _countdownTimer;
  late final AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _submitSos() async {
    setState(() {
      _isBusy = true;
      _error = null;
    });
    try {
      final created = await ref.read(discoveryRepositoryProvider).createSos(
            message: _reason,
            location: _location,
            emergencyType: _emergencyType,
            town: AppConfig.pilotTown,
            area: _location,
          );
      ref.invalidate(sosFeedProvider);
      if (!mounted) return;
      setState(() {
        _isBusy = false;
        _successItem = created;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isBusy = false;
        _error = 'Unable to send SOS right now.';
      });
    }
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
    setState(() => _countdown = 3);
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if ((_countdown ?? 0) <= 1) {
        timer.cancel();
        setState(() => _countdown = null);
        _submitSos();
        return;
      }
      setState(() => _countdown = (_countdown ?? 1) - 1);
    });
  }

  @override
  Widget build(BuildContext context) {
    final sosFeed = ref.watch(sosFeedProvider);

    return LokalsShell(
      title: 'SOS',
      showBack: true,
      child: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFFF4A4A), AppColors.danger],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text(
              'SOS',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 18),
            ScaleTransition(
              scale: Tween<double>(begin: 0.94, end: 1.03).animate(
                CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
              ),
              child: Center(
                child: Container(
                  width: 190,
                  height: 190,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Container(
                      width: 136,
                      height: 136,
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: const Icon(Icons.shield_rounded, color: AppColors.danger, size: 72),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              _successItem == null ? 'Tap to send SOS' : 'SOS sent',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              _successItem == null ? 'Your location will be shared' : 'Keep your phone close while help follows up',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 22),
            if (_successItem != null)
              RequestSuccessState(
                title: 'Emergency alert sent',
                body: 'The alert has been recorded with your selected emergency type and location.',
                meta: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_emergencyType, style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Text(_location, style: const TextStyle(color: AppColors.mutedText)),
                  ],
                ),
                primaryLabel: 'View alerts',
                onPrimary: () => context.go('/alerts'),
                secondaryLabel: 'Back home',
                onSecondary: () => context.go('/'),
              )
            else
              AppCard(
                variant: AppCardVariant.emergency,
                color: Colors.white,
                child: Column(
                  children: [
                    DropdownButtonFormField<String>(
                      initialValue: _emergencyType,
                      decoration: const InputDecoration(labelText: 'Emergency type'),
                      items: _types.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
                      onChanged: (value) => setState(() => _emergencyType = value ?? _emergencyType),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _reason,
                      decoration: const InputDecoration(labelText: 'Emergency reason'),
                      items: _reasons.map((reason) => DropdownMenuItem(value: reason, child: Text(reason))).toList(),
                      onChanged: (value) => setState(() => _reason = value ?? _reason),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _location,
                      decoration: const InputDecoration(labelText: 'Location'),
                      items: _locations.map((location) => DropdownMenuItem(value: location, child: Text(location))).toList(),
                      onChanged: (value) => setState(() => _location = value ?? _location),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        AppBadge(label: _location, tone: AppBadgeTone.danger),
                        const AppBadge(label: AppConfig.pilotTown, tone: AppBadgeTone.danger),
                      ],
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: AppColors.danger)),
                    ],
                    const SizedBox(height: 16),
                    AppButton(
                      label: _countdown != null ? 'Sending in $_countdown' : 'Send SOS',
                      variant: AppButtonVariant.danger,
                      isLoading: _isBusy,
                      onPressed: _countdown != null ? () {} : _startCountdown,
                    ),
                    if (_countdown != null) ...[
                      const SizedBox(height: 10),
                      AppButton(
                        label: 'Cancel',
                        expanded: false,
                        variant: AppButtonVariant.secondary,
                        onPressed: () {
                          _countdownTimer?.cancel();
                          setState(() => _countdown = null);
                        },
                      ),
                    ],
                  ],
                ),
              ),
            const SizedBox(height: 18),
            AppCard(
              variant: AppCardVariant.emergency,
              color: Colors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Row(
                    children: [
                      Text('Emergency Contacts', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                      Spacer(),
                      Text('Edit', style: TextStyle(color: AppColors.primaryPurple, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  SizedBox(height: 12),
                  _ContactRow(name: 'Mom', phone: '+264 81 123 4567'),
                  SizedBox(height: 10),
                  _ContactRow(name: 'Dad', phone: '+264 81 987 6543'),
                  SizedBox(height: 10),
                  _ContactRow(name: 'Sister', phone: '+264 81 456 7890'),
                ],
              ),
            ),
            const SizedBox(height: 18),
            const Text('Recent SOS alerts', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            sosFeed.when(
              data: (items) => items.isEmpty
                  ? const AppCard(
                      variant: AppCardVariant.emergency,
                      color: Colors.white,
                      child: Text('No alerts right now. You are all caught up.'),
                    )
                  : Column(
                      children: items.take(5).map((item) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: AppCard(
                            variant: AppCardVariant.emergency,
                            color: Colors.white,
                            child: ListTile(
                              contentPadding: EdgeInsets.zero,
                              title: Text(item.message),
                              subtitle: Text(item.location ?? 'Location unknown'),
                              trailing: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.warning_amber_rounded, color: AppColors.danger),
                                  const SizedBox(height: 4),
                                  AppBadge(label: item.status ?? 'sent', tone: AppBadgeTone.danger),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
              loading: () => const Center(child: CircularProgressIndicator(color: Colors.white)),
              error: (error, _) => const Text(
                'Failed to load SOS feed right now.',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({required this.name, required this.phone});

  final String name;
  final String phone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFFFFECEC),
            child: Text(name.characters.first, style: const TextStyle(color: AppColors.danger)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(phone, style: const TextStyle(color: AppColors.mutedText)),
              ],
            ),
          ),
          InkWell(
            onTap: () => const ContactActionService().call(context, phone),
            borderRadius: BorderRadius.circular(18),
            child: const CircleAvatar(
              radius: 18,
              backgroundColor: Color(0xFFEAF8EF),
              child: Icon(Icons.call_rounded, size: 18, color: AppColors.primaryGreen),
            ),
          ),
        ],
      ),
    );
  }
}
