import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_radius.dart';

class AppTheme {
  static ThemeData light() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.primaryGreen,
      brightness: Brightness.light,
      primary: AppColors.primaryGreen,
      secondary: AppColors.primaryPurple,
      error: AppColors.danger,
      surface: AppColors.surfaceWhite,
    );

    return _baseTheme(
      colorScheme: colorScheme,
      scaffoldBackground: AppColors.softBackground,
      surfaceColor: AppColors.glassLight,
      borderColor: AppColors.border,
      mutedColor: AppColors.mutedText,
      navBackground: AppColors.glassLight,
      navIndicator: AppColors.primaryGreen.withValues(alpha: 0.16),
    );
  }

  static ThemeData dark() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.primaryGreen,
      brightness: Brightness.dark,
      primary: AppColors.primaryGreen,
      secondary: AppColors.electricPurple,
      error: AppColors.danger,
      surface: AppColors.darkSurface,
    );

    return _baseTheme(
      colorScheme: colorScheme,
      scaffoldBackground: AppColors.darkBackground,
      surfaceColor: AppColors.glassDark,
      borderColor: AppColors.darkBorder,
      mutedColor: AppColors.darkTextSecondary,
      navBackground: AppColors.glassDark,
      navIndicator: AppColors.primaryGreen.withValues(alpha: 0.22),
    );
  }

  static ThemeData _baseTheme({
    required ColorScheme colorScheme,
    required Color scaffoldBackground,
    required Color surfaceColor,
    required Color borderColor,
    required Color mutedColor,
    required Color navBackground,
    required Color navIndicator,
  }) {
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: scaffoldBackground,
      dividerColor: borderColor,
      textTheme: ThemeData(
        colorScheme: colorScheme,
        useMaterial3: true,
      ).textTheme.apply(
            bodyColor: colorScheme.onSurface,
            displayColor: colorScheme.onSurface,
          ),
      cardTheme: CardThemeData(
        color: surfaceColor,
        elevation: 0,
        shadowColor: Colors.black.withValues(alpha: 0.12),
        shape: RoundedRectangleBorder(
          side: BorderSide(color: borderColor),
          borderRadius: BorderRadius.circular(AppRadius.xl),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        labelStyle: TextStyle(color: mutedColor),
        hintStyle: TextStyle(color: mutedColor),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: borderColor),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: colorScheme.primary, width: 1.4),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: colorScheme.onSurface,
        centerTitle: false,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: navBackground,
        indicatorColor: navIndicator,
        height: 78,
        labelTextStyle: WidgetStateProperty.all(
          const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: colorScheme.onSurface,
        contentTextStyle: TextStyle(color: colorScheme.surface),
      ),
      iconTheme: IconThemeData(color: colorScheme.onSurface),
      listTileTheme: ListTileThemeData(
        iconColor: colorScheme.onSurface,
        textColor: colorScheme.onSurface,
      ),
    );
  }
}
