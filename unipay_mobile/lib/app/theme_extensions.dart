import 'package:flutter/material.dart';
import 'theme.dart';

/// 🎨 Extension pour accéder facilement aux couleurs du thème
extension ThemeColorExtension on BuildContext {
  /// Obtenir les couleurs selon le thème actuel
  AppColorsVariant get colors => AppColors.getVariant(this);

  /// Vérifier si on est en mode sombre
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;

  /// Fond principal
  Color get bgColor => Theme.of(this).scaffoldBackgroundColor;

  /// Texte principal
  Color get textColor =>
      Theme.of(this).textTheme.bodyLarge?.color ?? Colors.black;

  /// Texte secondaire
  Color get secondaryTextColor =>
      Theme.of(this).textTheme.bodyMedium?.color ?? Colors.grey;

  /// Couleur primaire
  Color get primaryColor => Theme.of(this).primaryColor;

  /// Surface (cartes, inputs)
  Color get surfaceColor => colors.surface;

  /// Bordures
  Color get borderColor => colors.border;
}
