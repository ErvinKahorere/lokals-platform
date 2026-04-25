import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../discovery/discovery_repository.dart';

class SosScreen extends ConsumerStatefulWidget {
  const SosScreen({super.key});

  @override
  ConsumerState<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends ConsumerState<SosScreen>
    with SingleTickerProviderStateMixin {
  final _messageController = TextEditingController();
  final _locationController = TextEditingController();
  bool _isBusy = false;
  String? _message;
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
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sosFeed = ref.watch(sosFeedProvider);

    return LokalsShell(
      title: 'SOS',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF7F1D1D), Color(0xFFDC2626)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(28),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('EMERGENCY MODE', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w700, letterSpacing: 1.4)),
                SizedBox(height: 10),
                Text('SOS for urgent help', style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800)),
                SizedBox(height: 10),
                Text('Your location will be shared with emergency contacts. SMS and WhatsApp alert integration will be connected later.', style: TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 18),
          AppCard(
            variant: AppCardVariant.emergency,
            child: Column(
              children: [
                ScaleTransition(
                  scale: Tween<double>(begin: 0.94, end: 1.04).animate(
                    CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
                  ),
                  child: Container(
                    height: 150,
                    width: 150,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withValues(alpha: 0.18),
                          blurRadius: 40,
                          spreadRadius: 12,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: CircleAvatar(
                        radius: 48,
                        backgroundColor: Colors.white,
                        child: Icon(Icons.sos_rounded, color: AppColors.danger, size: 56),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Send SOS now',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Use only for urgent situations.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                LokalsTextField(controller: _messageController, label: 'Emergency message', maxLines: 3),
                const SizedBox(height: 12),
                LokalsTextField(controller: _locationController, label: 'Location'),
                if (_message != null) ...[
                  const SizedBox(height: 12),
                  AppBadge(label: _message!, tone: AppBadgeTone.success),
                ],
                const SizedBox(height: 16),
                AppButton(
                  label: 'Send SOS',
                  variant: AppButtonVariant.danger,
                  isLoading: _isBusy,
                  onPressed: () async {
                    setState(() => _isBusy = true);
                    await ref.read(discoveryRepositoryProvider).createSos(
                          message: _messageController.text.trim(),
                          location: _locationController.text.trim(),
                        );
                    ref.invalidate(sosFeedProvider);
                    if (!mounted) return;
                    setState(() {
                      _isBusy = false;
                      _message = 'SOS sent. Your emergency contacts have been notified.';
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          AppCard(
            variant: AppCardVariant.emergency,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Emergency Contacts', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                const _ContactRow(name: 'Mom', phone: '+264 81 123 4567'),
                const SizedBox(height: 10),
                const _ContactRow(name: 'Dad', phone: '+264 81 987 6543'),
                const SizedBox(height: 10),
                const _ContactRow(name: 'Sister', phone: '+264 81 456 7890'),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const SectionTitle(title: 'Recent SOS alerts'),
          const SizedBox(height: 12),
          sosFeed.when(
            data: (items) => Column(
              children: items
                  .take(5)
                  .map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: AppCard(
                        variant: AppCardVariant.emergency,
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(item.message),
                          subtitle: Text(item.location ?? 'Location unknown'),
                          trailing: const Icon(Icons.warning_amber_rounded, color: AppColors.danger),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => Text('Failed to load SOS feed: $error'),
          ),
        ],
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
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFFFEE2E2),
            child: Text(name.characters.first, style: const TextStyle(color: AppColors.danger)),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text('$name • $phone')),
          AppButton(label: 'Call', expanded: false, variant: AppButtonVariant.secondary, onPressed: () {}),
        ],
      ),
    );
  }
}
