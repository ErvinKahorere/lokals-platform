import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_network_image.dart';
import '../../../widgets/cards.dart';

class AvatarUploader extends StatelessWidget {
  const AvatarUploader({
    super.key,
    required this.name,
    required this.networkUrl,
    required this.avatarFile,
    required this.onChoosePhoto,
    this.isUploading = false,
  });

  final String name;
  final String? networkUrl;
  final XFile? avatarFile;
  final Future<void> Function() onChoosePhoto;
  final bool isUploading;

  @override
  Widget build(BuildContext context) {
    final initials = name.isEmpty ? 'L' : name.characters.first.toUpperCase();

    return AppCard(
      variant: AppCardVariant.dashboard,
      child: Column(
        children: [
          if (avatarFile != null)
            CircleAvatar(
              radius: 46,
              backgroundColor: AppColors.purpleSoft,
              backgroundImage: FileImage(File(avatarFile!.path)),
            )
          else
            AppAvatarImage(
              name: initials,
              imageUrl: networkUrl,
              radius: 46,
              backgroundColor: AppColors.purpleSoft,
            ),
          const SizedBox(height: 14),
          AppButton(
            label: isUploading ? 'Uploading photo...' : 'Choose photo',
            expanded: false,
            variant: AppButtonVariant.secondary,
            onPressed: onChoosePhoto,
          ),
          const SizedBox(height: 8),
          Text(
            'Upload a clear photo or keep your initials avatar.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMuted,
          ),
        ],
      ),
    );
  }
}
