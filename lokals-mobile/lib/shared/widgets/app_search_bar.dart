import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_text_styles.dart';

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
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(AppRadius.hero),
              border: Border.all(
                color: _focused ? AppColors.primaryPurple : AppColors.border,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: _focused ? 0.08 : 0.05),
                  blurRadius: 24,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: TextField(
              controller: widget.controller,
              onChanged: widget.onChanged,
              decoration: InputDecoration(
                hintText: widget.hintText,
                prefixIcon: Container(
                  margin: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.purpleSoftAlt,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.search_rounded, color: AppColors.primaryPurple),
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                suffixIcon: widget.controller.text.trim().isEmpty
                    ? null
                    : IconButton(
                        tooltip: 'Clear search',
                        onPressed: () {
                          widget.controller.clear();
                          widget.onChanged?.call('');
                          setState(() {});
                        },
                        icon: const Icon(Icons.close_rounded, color: AppColors.mutedText),
                      ),
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
              ...visibleSuggestions.map((item) => ActionChip(label: Text(item, style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal)), onPressed: () => _selectValue(item))),
              ..._recent.map((item) => ActionChip(avatar: const Icon(Icons.history_rounded, size: 16, color: AppColors.primaryPurple), label: Text(item, style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal)), onPressed: () => _selectValue(item))),
              ...widget.shortcuts.map((item) => ActionChip(label: Text(item, style: AppTextStyles.caption.copyWith(color: AppColors.deepCharcoal)), onPressed: () => _selectValue(item))),
            ],
          ),
        ],
      ],
    );
  }
}
