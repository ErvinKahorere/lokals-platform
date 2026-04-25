import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class SaveButton extends StatefulWidget {
  const SaveButton({super.key});

  @override
  State<SaveButton> createState() => _SaveButtonState();
}

class _SaveButtonState extends State<SaveButton> {
  bool _saved = false;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: () => setState(() => _saved = !_saved),
      style: IconButton.styleFrom(
        backgroundColor: _saved ? AppColors.dangerSoft : Colors.white,
      ),
      icon: Icon(
        _saved ? Icons.favorite : Icons.favorite_border_rounded,
        color: _saved ? AppColors.danger : AppColors.deepCharcoal,
      ),
    );
  }
}
