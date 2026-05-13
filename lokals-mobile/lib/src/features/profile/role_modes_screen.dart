import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_text_styles.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';

class RoleModesScreen extends ConsumerStatefulWidget {
  const RoleModesScreen({super.key});

  @override
  ConsumerState<RoleModesScreen> createState() => _RoleModesScreenState();
}

class _RoleModesScreenState extends ConsumerState<RoleModesScreen> {
  bool _submitting = false;

  Future<void> _applyForRole(String role) async {
    final user = ref.read(authControllerProvider).user;
    if (user == null) return;

    setState(() => _submitting = true);
    try {
      final application = await ref.read(discoveryRepositoryProvider).createRoleApplication(
        requestedRole: role,
        fullName: user.name,
        phone: user.phone,
        email: user.email,
        townName: user.defaultTown ?? 'Okahandja',
        address: user.defaultArea ?? 'Okahandja pilot area',
        licenseNumber: role == 'driver' || role == 'courier' ? 'PENDING-${user.id}' : null,
        vehicleRegistration: role == 'driver' || role == 'courier' ? 'N ${user.id} TEST' : null,
        vehicleType: role == 'driver' ? 'Sedan' : role == 'courier' ? 'Bike' : null,
      );
      await ref.read(discoveryRepositoryProvider).submitRoleApplication(application.id);
      ref.invalidate(modesProvider);
      ref.invalidate(roleApplicationsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${role.replaceAll('_', ' ')} application submitted for review.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final modes = ref.watch(modesProvider);
    final applications = ref.watch(roleApplicationsProvider);
    final auth = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Modes & Roles',
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        children: [
          const SectionTitle(
            title: 'Switch mode or apply',
            subtitle: 'Citizen access stays available. Additional roles unlock role-specific dashboards and workflows after approval.',
          ),
          const SizedBox(height: 16),
          modes.when(
            data: (data) => LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Available modes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: data.availableModes.map((mode) {
                      final active = mode == (auth.user?.currentRole ?? 'citizen');
                      return AppBadge(
                        label: active ? '${mode.replaceAll('_', ' ')} active' : mode.replaceAll('_', ' '),
                        tone: active ? AppBadgeTone.brand : AppBadgeTone.neutral,
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),
                  ...data.availableModes.map((mode) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: AppButton(
                      label: mode == (auth.user?.currentRole ?? 'citizen') ? 'Current: ${mode.replaceAll('_', ' ')}' : 'Switch to ${mode.replaceAll('_', ' ')}',
                      variant: mode == (auth.user?.currentRole ?? 'citizen') ? AppButtonVariant.secondary : AppButtonVariant.primary,
                      onPressed: () async {
                        await ref.read(authControllerProvider.notifier).switchRole(mode);
                      },
                    ),
                  )),
                ],
              ),
            ),
            loading: () => const LokalsCard(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
            error: (error, _) => const LokalsCard(child: Padding(padding: EdgeInsets.all(20), child: Text('Modes unavailable right now.'))),
          ),
          const SizedBox(height: 16),
          LokalsCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: 'Apply for another role',
                  subtitle: 'Apply for transport, provider, business, or organisation access.',
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    _applyButton('driver', 'Apply: Driver'),
                    _applyButton('courier', 'Apply: Courier'),
                    _applyButton('service_provider', 'Apply: Provider'),
                    _applyButton('business_owner', 'Apply: Business'),
                    _applyButton('organization_admin', 'Apply: Organisation'),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          applications.when(
            data: (items) => LokalsCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle(
                    title: 'My applications',
                    subtitle: 'Track pending, approved, rejected, and changes requested applications.',
                  ),
                  const SizedBox(height: 14),
                  if (items.isEmpty)
                    Text('No role applications yet.', style: AppTextStyles.bodyMuted)
                  else
                    ...items.map((application) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: LokalsSurfaceTile(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    application.requestedRole.replaceAll('_', ' '),
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                                  ),
                                ),
                                AppBadge(
                                  label: application.status.replaceAll('_', ' '),
                                  tone: AppBadgeTone.neutral,
                                ),
                              ],
                            ),
                            if ((application.rejectionReason ?? '').isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text(application.rejectionReason!, style: const TextStyle(color: Colors.orange)),
                            ],
                          ],
                        ),
                      ),
                    )),
                ],
              ),
            ),
            loading: () => const LokalsCard(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
            error: (error, _) => const LokalsCard(child: Padding(padding: EdgeInsets.all(20), child: Text('Applications unavailable right now.'))),
          ),
        ],
      ),
    );
  }

  Widget _applyButton(String role, String label) {
    return SizedBox(
      width: 172,
      child: AppButton(
        label: label,
        variant: AppButtonVariant.secondary,
        isLoading: _submitting,
        onPressed: () => _applyForRole(role),
      ),
    );
  }
}
