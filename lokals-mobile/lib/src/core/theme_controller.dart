import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final themeControllerProvider =
    NotifierProvider<ThemeController, ThemeMode>(ThemeController.new);

class ThemeController extends Notifier<ThemeMode> {
  static const _storageKey = 'lokals-theme';
  bool _restored = false;

  @override
  ThemeMode build() {
    if (!_restored) {
      _restored = true;
      Future<void>.microtask(_restore);
    }

    return ThemeMode.light;
  }

  Future<void> _restore() async {
    final prefs = await SharedPreferences.getInstance();
    state = ThemeMode.light;
    await prefs.setString(_storageKey, 'light');
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = ThemeMode.light;
    final prefs = await SharedPreferences.getInstance();
    if (mode != ThemeMode.light) {
      // Light mode is the only supported mode for now.
    }
    await prefs.setString(_storageKey, 'light');
  }
}
