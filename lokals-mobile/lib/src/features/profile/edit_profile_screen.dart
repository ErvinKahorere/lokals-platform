import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/experience_helpers.dart';
import '../../features/discovery/discovery_repository.dart';
import '../../widgets/cards.dart';
import '../../widgets/shell.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
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

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(profileSummaryProvider);

    return LokalsShell(
      title: 'Edit profile',
      showBack: true,
      child: profile.when(
        data: (summary) {
          if (!_initialized) {
            _nameController.text = summary.user.name;
            _phoneController.text = summary.user.phone;
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
            _initialized = true;
          }

          final avatarUrl = resolveMediaUrl(summary.user.avatar ?? summary.profile['avatar_url']?.toString());

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundImage: _avatarFile != null
                          ? FileImage(File(_avatarFile!.path))
                          : (avatarUrl != null ? NetworkImage(avatarUrl) : null),
                      child: _avatarFile == null && avatarUrl == null
                          ? Text(summary.user.name.characters.first.toUpperCase())
                          : null,
                    ),
                    const SizedBox(height: 12),
                    AppButton(
                      label: 'Choose photo',
                      expanded: false,
                      variant: AppButtonVariant.secondary,
                      onPressed: () async {
                        final file = await _pickImageSource(context);
                        if (file == null) {
                          return;
                        }
                        setState(() => _avatarFile = file);
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                variant: AppCardVariant.dashboard,
                child: Column(
                  children: [
                    LokalsTextField(controller: _nameController, label: 'Name', hint: 'Your name'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _phoneController, label: 'Phone', hint: 'Primary phone'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _locationController, label: 'Location', hint: 'Town or suburb'),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: LokalsTextField(controller: _townController, label: 'Town', hint: 'Town')),
                        const SizedBox(width: 12),
                        Expanded(child: LokalsTextField(controller: _areaController, label: 'Area', hint: 'Area')),
                      ],
                    ),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _professionController, label: 'Profession', hint: 'Profession'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _businessController, label: 'Business name', hint: 'Business name'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _whatsAppController, label: 'WhatsApp', hint: 'WhatsApp number'),
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _secondaryPhoneController, label: 'Secondary phone', hint: 'Optional backup number'),
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
                    const SizedBox(height: 12),
                    LokalsTextField(controller: _bioController, label: 'Bio', hint: 'Short intro', maxLines: 4),
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
                          location: _locationController.text,
                          defaultTown: _townController.text,
                          defaultArea: _areaController.text,
                          bio: _bioController.text,
                          profession: _professionController.text,
                          businessName: _businessController.text,
                          whatsapp: _whatsAppController.text,
                          secondaryPhone: _secondaryPhoneController.text,
                          profileVisibility: _profileVisibility,
                        );
                        ref.invalidate(profileSummaryProvider);
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
