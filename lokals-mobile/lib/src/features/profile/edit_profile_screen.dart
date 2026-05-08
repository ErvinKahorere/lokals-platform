import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/experience_helpers.dart';
import '../../features/discovery/discovery_repository.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';
import '../auth/auth_controller.dart';
import 'widgets/avatar_uploader.dart';
import 'widgets/role_switcher.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _locationController = TextEditingController();
  final _townController = TextEditingController();
  final _areaController = TextEditingController();
  final _bioController = TextEditingController();
  final _professionController = TextEditingController();
  final _businessController = TextEditingController();
  final _whatsAppController = TextEditingController();
  final _secondaryPhoneController = TextEditingController();
  String _profileVisibility = 'public';
  XFile? _avatarFile;
  bool _saving = false;
  bool _initialized = false;
  List<String> _roles = [];
  List<String> _interests = [];

  static const _interestOptions = [
    'Services',
    'Jobs',
    'Marketplace',
    'Events',
    'Accommodation',
    'News',
    'Alerts',
  ];

  static const _roleOptions = [
    'citizen',
    'worker',
    'seller',
    'service_provider',
    'driver',
    'organization_admin',
    'town_manager',
    'municipality_admin',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _locationController.dispose();
    _townController.dispose();
    _areaController.dispose();
    _bioController.dispose();
    _professionController.dispose();
    _businessController.dispose();
    _whatsAppController.dispose();
    _secondaryPhoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(profileSummaryProvider);
    final preferences = ref.watch(preferencesProvider).asData?.value;

    return LokalsShell(
      title: 'Edit profile',
      showBack: true,
      child: profile.when(
        data: (summary) {
          if (!_initialized) {
            _nameController.text = summary.user.name;
            _phoneController.text = summary.user.phone;
            _emailController.text = summary.user.email ?? '';
            _locationController.text = summary.user.location ?? '';
            _townController.text =
                summary.user.defaultTown ??
                summary.profile['default_town']?.toString() ??
                'Windhoek';
            _areaController.text =
                summary.user.defaultArea ??
                summary.profile['default_area']?.toString() ??
                '';
            _bioController.text =
                summary.user.bio ?? summary.profile['bio']?.toString() ?? '';
            _professionController.text = summary.user.profession ??
                summary.profile['profession']?.toString() ??
                '';
            _businessController.text = summary.user.businessName ??
                summary.profile['business_name']?.toString() ??
                '';
            _whatsAppController.text = summary.user.whatsapp ??
                summary.profile['whatsapp']?.toString() ??
                '';
            _secondaryPhoneController.text = summary.user.secondaryPhone ??
                summary.profile['secondary_phone']?.toString() ??
                '';
            _profileVisibility = summary.user.profileVisibility ??
                summary.profile['profile_visibility']?.toString() ??
                _profileVisibility;
            _roles = List<String>.from(summary.user.roles);
            _interests = List<String>.from(
              (summary.user.currentRole != null &&
                      summary.user.currentRole!.isNotEmpty &&
                      summary.profile.isEmpty)
                  ? const []
                  : preferences?.interests ?? const [],
            );
            _initialized = true;
          }

          final avatarUrl = resolveMediaUrl(
            summary.user.avatar ?? summary.profile['avatar_url']?.toString(),
          );

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AvatarUploader(
                name: summary.user.name,
                networkUrl: avatarUrl,
                avatarFile: _avatarFile,
                isUploading: _saving,
                onChoosePhoto: () async {
                  final file = await _pickImageSource(context);
                  if (file == null) {
                    return;
                  }
                  setState(() => _avatarFile = file);
                },
              ),
              const SizedBox(height: 16),
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle(
                      title: 'Personal details',
                      subtitle: 'These details help LOKALS reuse your information across bookings, jobs, and marketplace actions.',
                    ),
                    const SizedBox(height: 14),
                    LokalsTextField(controller: _nameController, label: 'Name', hint: 'Your full name'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _phoneController, label: 'Phone', hint: 'Primary phone'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _emailController, label: 'Email', hint: 'Optional email'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _whatsAppController, label: 'WhatsApp', hint: 'WhatsApp number'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _professionController, label: 'Profession', hint: 'Profession or role'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _businessController, label: 'Business name', hint: 'Optional business name'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _bioController, label: 'Bio', hint: 'Short intro', maxLines: 4),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle(
                      title: 'Location and visibility',
                      subtitle: 'Set the town and area that should influence local results first.',
                    ),
                    const SizedBox(height: 14),
                    LokalsTextField(controller: _locationController, label: 'Location label', hint: 'Katutura, Windhoek'),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: LokalsTextField(controller: _townController, label: 'Town', hint: 'Town')),
                        const SizedBox(width: 12),
                        Expanded(child: LokalsTextField(controller: _areaController, label: 'Area', hint: 'Area')),
                      ],
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _profileVisibility,
                      decoration: const InputDecoration(labelText: 'Profile visibility'),
                      items: const [
                        DropdownMenuItem(value: 'public', child: Text('Public')),
                        DropdownMenuItem(value: 'private', child: Text('Private')),
                      ],
                      onChanged: (value) {
                        if (value == null) {
                          return;
                        }
                        setState(() => _profileVisibility = value);
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle(
                      title: 'Roles and interests',
                      subtitle: 'Choose the roles and local interests that best match how you use LOKALS.',
                    ),
                    const SizedBox(height: 14),
                    RoleSwitcher(
                      roles: _roles.isEmpty ? const ['citizen'] : _roles,
                      currentRole: summary.user.currentRole ??
                          (_roles.isNotEmpty ? _roles.first : 'citizen'),
                      onSelected: (role) {},
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: _roleOptions.map((role) {
                        final selected = _roles.contains(role);
                        return FilterChip(
                          label: Text(formatRoleLabel(role)),
                          selected: selected,
                          onSelected: (_) {
                            setState(() {
                              if (selected) {
                                _roles.remove(role);
                              } else {
                                _roles.add(role);
                              }
                              if (_roles.isEmpty) {
                                _roles = ['citizen'];
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: _interestOptions.map((interest) {
                        final selected = _interests.contains(interest);
                        return FilterChip(
                          label: Text(interest),
                          selected: selected,
                          onSelected: (_) {
                            setState(() {
                              if (selected) {
                                _interests.remove(interest);
                              } else {
                                _interests.add(interest);
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppButton(
                label: _saving ? 'Saving profile...' : 'Save profile',
                onPressed: _saving
                    ? null
                    : () async {
                        setState(() => _saving = true);
                        final repo = ref.read(discoveryRepositoryProvider);
                        if (_avatarFile != null) {
                          await repo.uploadAvatar(_avatarFile!);
                        }
                        await repo.updateProfile(
                          name: _nameController.text,
                          phone: _phoneController.text,
                          email: _emailController.text.trim().isEmpty
                              ? null
                              : _emailController.text.trim(),
                          location: _locationController.text,
                          defaultTown: _townController.text,
                          defaultArea: _areaController.text,
                          bio: _bioController.text,
                          profession: _professionController.text,
                          businessName: _businessController.text,
                          whatsapp: _whatsAppController.text,
                          secondaryPhone: _secondaryPhoneController.text,
                          profileVisibility: _profileVisibility,
                          roles: _roles,
                          interests: _interests,
                        );
                        await ref.read(authControllerProvider.notifier).refreshCurrentUser();
                        ref.invalidate(profileSummaryProvider);
                        ref.invalidate(preferencesProvider);
                        if (!mounted) {
                          return;
                        }
                        setState(() => _saving = false);
                        ScaffoldMessenger.of(this.context).showSnackBar(
                          const SnackBar(content: Text('Profile updated.')),
                        );
                        GoRouter.of(this.context).pop();
                      },
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Failed to load profile: $error')),
      ),
    );
  }

  Future<XFile?> _pickImageSource(BuildContext context) async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Take photo'),
              onTap: () => Navigator.of(context).pop(ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Choose from gallery'),
              onTap: () => Navigator.of(context).pop(ImageSource.gallery),
            ),
          ],
        ),
      ),
    );

    if (source == null) {
      return null;
    }

    return ImagePicker().pickImage(source: source, imageQuality: 82);
  }
}
