import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/theme/app_colors.dart';
import '../../../src/features/auth/auth_controller.dart';
import '../../../src/features/discovery/discovery_repository.dart';

class SaveButton extends ConsumerStatefulWidget {
  const SaveButton({
    super.key,
    required this.storageId,
    this.itemType,
    this.itemId,
    this.onChanged,
  });

  final String storageId;
  final String? itemType;
  final Object? itemId;
  final ValueChanged<bool>? onChanged;

  @override
  ConsumerState<SaveButton> createState() => _SaveButtonState();
}

class _SaveButtonState extends ConsumerState<SaveButton> {
  static const _storageKey = 'lokals_saved_products';
  bool _saved = false;

  @override
  void initState() {
    super.initState();
    _loadSaved();
  }

  Future<void> _loadSaved() async {
    final auth = ref.read(authControllerProvider);
    if (auth.token != null && widget.itemType != null && widget.itemId != null) {
      final payload = await ref.read(discoveryRepositoryProvider).fetchSavedItems();
      final items = (payload['items'] as List<dynamic>? ?? const [])
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();
      if (!mounted) {
        return;
      }
      setState(() {
        _saved = items.any((item) => item['kind'] == widget.itemType && item['id'].toString() == widget.itemId.toString());
      });
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    final savedItems = raw == null ? <String>{} : Set<String>.from((jsonDecode(raw) as List<dynamic>).cast<String>());
    if (!mounted) {
      return;
    }
    setState(() => _saved = savedItems.contains(widget.storageId));
  }

  Future<void> _toggle() async {
    final auth = ref.read(authControllerProvider);
    if (auth.token != null && widget.itemType != null && widget.itemId != null) {
      final nextSaved = !_saved;
      setState(() => _saved = nextSaved);
      widget.onChanged?.call(nextSaved);
      try {
        if (nextSaved) {
          await ref.read(discoveryRepositoryProvider).saveItem(type: widget.itemType!, id: widget.itemId!);
        } else {
          await ref.read(discoveryRepositoryProvider).removeSavedItem(type: widget.itemType!, id: widget.itemId!);
        }
        ref.invalidate(savedItemsProvider);
      } catch (_) {
        if (!mounted) {
          return;
        }
        setState(() => _saved = !nextSaved);
        widget.onChanged?.call(!nextSaved);
      }
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    final savedItems = raw == null ? <String>{} : Set<String>.from((jsonDecode(raw) as List<dynamic>).cast<String>());
    final nextSaved = !savedItems.contains(widget.storageId);

    if (nextSaved) {
      savedItems.add(widget.storageId);
    } else {
      savedItems.remove(widget.storageId);
    }

    await prefs.setString(_storageKey, jsonEncode(savedItems.toList()));
    if (!mounted) {
      return;
    }

    setState(() => _saved = nextSaved);
    widget.onChanged?.call(nextSaved);
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: _toggle,
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
