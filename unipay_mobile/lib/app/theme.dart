import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.accentCyan,
        surface: AppColors.surface,
        error: AppColors.alertRed,
      ),
      cardColor: AppColors.surface,
      textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme).copyWith(
        headlineMedium: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold),
        bodyMedium: const TextStyle(color: AppColors.textSecondary),
      ),
    );
  }
}