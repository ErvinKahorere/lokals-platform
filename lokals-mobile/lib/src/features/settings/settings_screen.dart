import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_text_styles.dart';
import '../../core/role_routing.dart';
import '../../config/app_config.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import '../discovery/discovery_repository.dart';
import '../profile/widgets/role_switcher.dart';
import 'widgets/appearance_settings.dart';
import 'widgets/location_settings.dart';
import 'widgets/notification_preferences.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _townController = TextEditingController(text: AppConfig.pilotTown);
  final _areaController = TextEditingController();
  final _radiusController = TextEditingController(text: '10');
  final Map<String, bool> _notificationPreferences = {
    'alerts_from_followed_entities': true,
    'booking_updates': true,
    'job_updates': true,
    'event_updates': true,
    'news_updates': true,
    'promotions': true,
    'city_alerts': true,
  };
  bool _saving = false;
  bool _initializedAppearance = false;
  String _appearance = 'light';

  @override
  void dispose() {
    _townController.dispose();
    _areaController.dispose();
    _radiusController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final preferences = ref.watch(preferencesProvider);
    final profile = ref.watch(profileSummaryProvider);
    final profileSummary = profile.asData?.value;
    final auth = ref.watch(authControllerProvider);

    return LokalsShell(
      title: 'Settings',
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionTitle(
            title: 'Settings',
            subtitle: 'Keep your account, roles, location, alerts, and appearance under control.',
          ),
          const SizedBox(height: 16),
          profile.when(
            data: (summary) {
              return AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle(
                      title: 'Account',
                      subtitle: 'Profile, phone, and active role.',
                    ),
                    const SizedBox(height: 12),
                    Text(summary.user.name, style: AppTextStyles.h3),
                    const SizedBox(height: 4),
                    Text(
                      '${summary.user.phone}${summary.user.email != null ? ' - ${summary.user.email}' : ''}',
                      style: AppTextStyles.bodyMuted,
                    ),
                  ],
                ),
              );
            },
            loading: () => const LoadingSkeleton(height: 120),
            error: (error, _) => const SizedBox.shrink(),
          ),
          const SizedBox(height: 16),
          preferences.when(
            data: (prefs) {
              _townController.text = AppConfig.pilotTown;
              _areaController.text = prefs.defaultArea ?? _areaController.text;
              _radiusController.text =
                  '${prefs.serviceRadius ?? int.tryParse(_radiusController.text) ?? 10}';
              for (final entry in _notificationPreferences.keys) {
                _notificationPreferences[entry] =
                    prefs.notificationPreferences[entry] as bool? ??
                    _notificationPreferences[entry]!;
              }

              if (!_initializedAppearance) {
                _initializedAppearance = true;
                SharedPreferences.getInstance().then((sharedPreferences) {
                  if (!mounted) {
                    return;
                  }
                  setState(() {
                    _appearance =
                        sharedPreferences.getString('lokals_appearance') ??
                        'light';
                  });
                });
              }

              return Column(
                children: [
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionTitle(
                          title: 'Location',
                          subtitle: AppConfig.pilotLocationMessage,
                        ),
                        const SizedBox(height: 16),
                        LocationSettingsSection(
                          townController: _townController,
                          areaController: _areaController,
                          radiusController: _radiusController,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  profile.when(
                    data: (summary) => AppCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SectionTitle(
                            title: 'Roles',
                            subtitle: 'Switch the tools and account shortcuts you need right now.',
                          ),
                          const SizedBox(height: 16),
                          RoleSwitcher(
                            roles: summary.user.roles,
                            currentRole: summary.user.currentRole ??
                                (summary.user.roles.isNotEmpty
                                    ? summary.user.roles.first
                                    : 'citizen'),
                            isBusy: auth.isLoading,
                            onSelected: (role) async {
                              final nextUser = await ref
                                  .read(authControllerProvider.notifier)
                                  .switchRole(role);
                              ref.invalidate(profileSummaryProvider);
                              if (!context.mounted) {
                                return;
                              }
                              context.go(
                                roleHomePath(nextUser?.currentRole ?? role),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    loading: () => const LoadingSkeleton(height: 120),
                    error: (error, _) => const SizedBox.shrink(),
                  ),
                  const SizedBox(height: 16),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionTitle(
                          title: 'Notifications',
                          subtitle: 'Only keep the local updates that matter to you.',
                        ),
                        const SizedBox(height: 16),
                        NotificationPreferencesSection(
                          values: _notificationPreferences,
                          onChanged: (entry) {
                            setState(() {
                              _notificationPreferences[entry.key] = entry.value;
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionTitle(
                          title: 'Appearance',
                          subtitle: 'Save your preferred look on this device.',
                        ),
                        const SizedBox(height: 16),
                        AppearanceSettingsSection(
                          value: _appearance,
                          onChanged: (value) async {
                            final sharedPreferences =
                                await SharedPreferences.getInstance();
                            await sharedPreferences.setString(
                              'lokals_appearance',
                              value,
                            );
                            if (!mounted) {
                              return;
                            }
                            setState(() => _appearance = value);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionTitle(
                          title: 'Privacy',
                          subtitle: 'Keep profile visibility and personal details predictable.',
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Current profile visibility follows the value saved in your profile. More detailed privacy controls can be added later without changing your account flow.',
                          style: AppTextStyles.bodyMuted,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionTitle(
                          title: 'Help & support',
                          subtitle: 'Get help fast if something in your account does not look right.',
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Use Activity to track notifications and reports, or visit your Profile shortcuts to reach bookings, tickets, and saved items quickly.',
                          style: AppTextStyles.bodyMuted,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppCard(
                    color: const Color(0xFFEEF2FF),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionTitle(
                          title: 'Save changes',
                          subtitle:
                              'Keep your location, notifications, and role-ready account preferences in sync.',
                        ),
                        const SizedBox(height: 14),
                        PrimaryAction(
                          label: 'Save settings',
                          isBusy: _saving,
                          onPressed: () async {
                            setState(() => _saving = true);
                            await Future.wait([
                              ref.read(discoveryRepositoryProvider).updatePreferences(
                                    defaultTown: _townController.text.trim(),
                                    defaultArea: _areaController.text.trim(),
                                    serviceRadius:
                                        int.tryParse(_radiusController.text.trim()) ??
                                        10,
                                    notificationPreferences: _notificationPreferences,
                                  ),
                              ref.read(discoveryRepositoryProvider).updateProfile(
                                    name: profileSummary?.user.name ?? auth.user?.name ?? '',
                                    phone: profileSummary?.user.phone ?? auth.user?.phone ?? '',
                                    email: profileSummary?.user.email,
                                    location: profileSummary?.user.location ?? '',
                                    defaultTown: _townController.text.trim(),
                                    defaultArea: _areaController.text.trim(),
                                    bio: profileSummary?.user.bio ?? '',
                                    profession: profileSummary?.user.profession ?? '',
                                    businessName: profileSummary?.user.businessName ?? '',
                                    whatsapp: profileSummary?.user.whatsapp ?? '',
                                    secondaryPhone: profileSummary?.user.secondaryPhone ?? '',
                                    profileVisibility: profileSummary?.user.profileVisibility ?? 'public',
                                    roles: profileSummary?.user.roles ?? const ['citizen'],
                                    interests: prefs.interests,
                                  ),
                            ]);
                            await ref.read(authControllerProvider.notifier).refreshCurrentUser();
                            ref.invalidate(profileSummaryProvider);
                            ref.invalidate(preferencesProvider);
                            if (!context.mounted) return;
                            setState(() => _saving = false);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Settings saved')),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
            loading: () => const LokalsLoadingScreen(
              title: 'Loading settings',
              message: 'Preparing your account and notification preferences...',
            ),
            error: (error, _) => Center(
              child: EmptyStateView(
                title: 'Settings unavailable',
                body: 'We could not load your settings right now.',
                action: AppButton(
                  label: 'Retry',
                  expanded: false,
                  onPressed: () => ref.invalidate(preferencesProvider),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
