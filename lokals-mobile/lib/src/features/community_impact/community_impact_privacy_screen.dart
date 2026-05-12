import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import 'community_impact_repository.dart';

class CommunityImpactPrivacyScreen extends ConsumerStatefulWidget {
  const CommunityImpactPrivacyScreen({super.key});

  @override
  ConsumerState<CommunityImpactPrivacyScreen> createState() => _CommunityImpactPrivacyScreenState();
}

class _CommunityImpactPrivacyScreenState extends ConsumerState<CommunityImpactPrivacyScreen> {
  bool? _optIn;
  String? _privacyMode;
  final _nameController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(communityImpactDashboardProvider);

    return LokalsShell(
      title: 'Privacy Settings',
      showBack: true,
      child: dashboard.when(
        data: (data) {
          _optIn ??= data.account.publicLeaderboardOptIn;
          _privacyMode ??= data.account.privacyMode;
          if (_nameController.text.isEmpty) {
            _nameController.text = data.account.publicDisplayName ?? '';
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
            children: [
              const SectionTitle(
                eyebrow: 'Privacy first',
                title: 'Public leaderboard settings',
                subtitle: 'Leaderboard visibility is off by default. Detailed deed history is never public.',
              ),
              const SizedBox(height: 16),
              LokalsCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      value: _optIn ?? false,
                      title: const Text('Show me on public Community Impact leaderboard'),
                      subtitle: const Text('Only your chosen display style, rank, and points are public.'),
                      onChanged: (value) => setState(() => _optIn = value),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _privacyMode,
                      items: const [
                        DropdownMenuItem(value: 'private', child: Text('Private')),
                        DropdownMenuItem(value: 'initials', child: Text('Initials')),
                        DropdownMenuItem(value: 'display_name', child: Text('Display name')),
                      ],
                      onChanged: (value) => setState(() => _privacyMode = value ?? 'private'),
                      decoration: const InputDecoration(labelText: 'Display mode'),
                    ),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _nameController, label: 'Public display name (optional)'),
                    const SizedBox(height: 16),
                    AppButton(
                      label: 'Save privacy settings',
                      onPressed: () async {
                        await ref.read(communityImpactRepositoryProvider).updatePrivacy(
                              optIn: _optIn ?? false,
                              privacyMode: _privacyMode ?? 'private',
                              publicDisplayName: _nameController.text.trim().isEmpty ? null : _nameController.text.trim(),
                            );
                        ref.invalidate(communityImpactDashboardProvider);
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Community Impact privacy updated.')),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const LokalsLoadingScreen(title: 'Loading privacy settings', message: 'Bringing in your current Community Impact preferences...'),
        error: (error, _) => const Center(child: EmptyStateView(title: 'Settings unavailable', body: 'Please try again shortly.')),
      ),
    );
  }
}
