import 'package:flutter/material.dart';

class NewsCategoryChips extends StatelessWidget {
  const NewsCategoryChips({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  final String selected;
  final ValueChanged<String> onSelected;

  static const _categories = <({String value, String label})>[
    (value: 'all', label: 'Local'),
    (value: 'public_notice', label: 'Public Notice'),
    (value: 'community', label: 'Community'),
    (value: 'business', label: 'Business'),
    (value: 'events', label: 'Events'),
    (value: 'safety', label: 'Safety'),
    (value: 'health', label: 'Health'),
    (value: 'education', label: 'Education'),
    (value: 'transport', label: 'Transport'),
    (value: 'sports', label: 'Sports'),
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _categories.map((category) {
        final active = selected == category.value;
        return ChoiceChip(
          label: Text(category.label),
          selected: active,
          onSelected: (_) => onSelected(category.value),
        );
      }).toList(),
    );
  }
}
