import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';

class AppSearchBar extends StatefulWidget {
  const AppSearchBar({
    super.key,
    required this.controller,
    required this.hintText,
    this.onChanged,
    this.onValueSelected,
    this.recentKey,
    this.suggestions = const [],
    this.shortcuts = const [],
  });

  final TextEditingController controller;
  final String hintText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onValueSelected;
  final String? recentKey;
  final List<String> suggestions;
  final List<String> shortcuts;

  @override
  State<AppSearchBar> createState() => _AppSearchBarState();
}

class _AppSearchBarState extends State<AppSearchBar> {
  List<String> _recent = const [];
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    _loadRecent();
  }

  Future<void> _loadRecent() async {
    if (widget.recentKey == null) return;
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('lokals_search_${widget.recentKey}');
    if (!mounted) return;
    setState(() {
      _recent = raw == null ? const [] : (jsonDecode(raw) as List<dynamic>).cast<String>();
    });
  }

  Future<void> _persistRecent(String value) async {
    if (widget.recentKey == null || value.trim().isEmpty) return;
    final next = [value.trim(), ..._recent.where((item) => item != value.trim())].take(4).toList();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('lokals_search_${widget.recentKey}', jsonEncode(next));
    if (!mounted) return;
    setState(() => _recent = next);
  }

  void _selectValue(String value) {
    widget.controller.text = value;
    widget.onChanged?.call(value);
    widget.onValueSelected?.call(value);
    _persistRecent(value);
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final query = widget.controller.text.trim().toLowerCase();
    final visibleSuggestions = widget.suggestions.where((item) => item.toLowerCase().contains(query)).take(4).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Focus(
          onFocusChange: (focused) {
            setState(() => _focused = focused);
            if (!focused) {
              _persistRecent(widget.controller.text);
            }
          },
          child: TextField(
            controller: widget.controller,
            onChanged: widget.onChanged,
            decoration: InputDecoration(
              hintText: widget.hintText,
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.mutedText),
              filled: true,
              fillColor: AppColors.surfaceWhite,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                borderSide: const BorderSide(color: AppColors.lokalsGreen),
              ),
            ),
          ),
        ),
        if (_focused || _recent.isNotEmpty) ...[
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ...visibleSuggestions.map((item) => ActionChip(label: Text(item), onPressed: () => _selectValue(item))),
              ..._recent.map((item) => ActionChip(avatar: const Icon(Icons.history_rounded, size: 16), label: Text(item), onPressed: () => _selectValue(item))),
              ...widget.shortcuts.map((item) => ActionChip(label: Text(item), onPressed: () => _selectValue(item))),
            ],
          ),
        ],
      ],
    );
  }
}
