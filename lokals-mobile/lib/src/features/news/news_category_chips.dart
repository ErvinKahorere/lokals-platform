import 'package:flutter/material.dart';

class NewsCategoryChips extends StatelessWidget {
  const NewsCategoryChips({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  final String selected;
  final ValueChanged<String> onSelected;

  static const _categories = [
    'all',
    'business',
    'community',
    'events',
    'safety',
    'health',
    'education',
    'transport',
    'sports',
    'property',
    'public_notice',
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _categories.map((category) {
        final active = selected == category;
        return ChoiceChip(
          label: Text(category == 'all' ? 'Local' : category.replaceAll('_', ' ')),
          selected: active,
          onSelected: (_) => onSelected(category),
        );
      }).toList(),
    );
  }
}
