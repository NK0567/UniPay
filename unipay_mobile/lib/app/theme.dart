import 'package:flutter/material.dart';

// 🎨 CLASSE DE COULEURS POUR LIGHT ET DARK MODE
class AppColors {
  // ☀️ COULEURS CLAIRES
  static const Color lightBg = Colors.white;
  static const Color lightSurface = Color(0xFFF8F9FD);
  static const Color lightBorder = Color(0xFFE2E8F0);
  static const Color lightText = Color(0xFF1E293B);
  static const Color lightSecondaryText = Color(0xFF64748B);
  static const Color lightDisabled = Color(0xFFCBD5E1);

  // 🌙 COULEURS SOMBRES
  static const Color darkBg = Color(0xFF0F172A);
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkBorder = Color(0xFF334155);
  static const Color darkText = Colors.white;
  static const Color darkSecondaryText = Color(0xFF94A3B8);
  static const Color darkDisabled = Color(0xFF475569);

  // 🔵 COULEURS UNIVERSELLES
  static const Color primary = Color(0xFF4E4AF2); // Violet UniPay
  static const Color success = Color(0xFF10B981);
  static const Color error = Colors.red;
  static const Color warning = Color(0xFFF59E0B);

  // 📱 Méthode pour obtenir les couleurs selon le thème
  static AppColorsVariant getVariant(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark ? darkVariant : lightVariant;
  }

  // VARIANTES DE COULEURS POUR LIGHT ET DARK
  static const AppColorsVariant lightVariant = AppColorsVariant(
    bg: lightBg,
    surface: lightSurface,
    border: lightBorder,
    text: lightText,
    secondaryText: lightSecondaryText,
    disabled: lightDisabled,
  );

  static const AppColorsVariant darkVariant = AppColorsVariant(
    bg: darkBg,
    surface: darkSurface,
    border: darkBorder,
    text: darkText,
    secondaryText: darkSecondaryText,
    disabled: darkDisabled,
  );
}

class AppColorsVariant {
  final Color bg;
  final Color surface;
  final Color border;
  final Color text;
  final Color secondaryText;
  final Color disabled;

  const AppColorsVariant({
    required this.bg,
    required this.surface,
    required this.border,
    required this.text,
    required this.secondaryText,
    required this.disabled,
  });
}

class AppTheme {
  // ☀️ THÈME CLAIR
  // 🔄 L'interrupteur global (par défaut en mode système ou clair)
  static final ValueNotifier<ThemeMode> themeNotifier = ValueNotifier(ThemeMode.light);

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.lightBg,
      primaryColor: AppColors.primary,
      useMaterial3: true,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.lightBg,
        elevation: 0,
        iconTheme: IconThemeData(color: AppColors.lightText),
        titleTextStyle: TextStyle(color: AppColors.lightText, fontSize: 18, fontWeight: FontWeight.bold),
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: AppColors.lightText),
        bodyMedium: TextStyle(color: AppColors.lightSecondaryText),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightSurface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          minimumSize: const Size(double.infinity, 56),
        ),
      ),
    );
  }

  // 🌙 THÈME SOMBRE
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.darkBg,
      primaryColor: AppColors.primary,
      useMaterial3: true,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkBg,
        elevation: 0,
        iconTheme: IconThemeData(color: AppColors.darkText),
        titleTextStyle: TextStyle(color: AppColors.darkText, fontSize: 18, fontWeight: FontWeight.bold),
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: AppColors.darkText),
        bodyMedium: TextStyle(color: AppColors.darkSecondaryText),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          minimumSize: const Size(double.infinity, 56),
        ),
      ),
    );
  }

  // 🌍 L'interrupteur global pour la langue ('fr' pour Français, 'en' pour Anglais)
  static final ValueNotifier<String> languageNotifier = ValueNotifier('fr');

  // 📖 Dictionnaire de traduction simplifié pour ton prototype
  static const Map<String, Map<String, String>> translations = {
    'fr': {
      'history': 'Historique',
      'stats': 'Statistiques',
      'notif': 'Notifications',
      'security': 'Sécurité',
      'support': 'Support',
      'settings': 'Paramètres',
      'logout': 'Déconnexion',
      'lang': 'Langue',
    },
    'en': {
      'history': 'History',
      'stats': 'Statistics',
      'notif': 'Notifications',
      'security': 'Security',
      'support': 'Support',
      'settings': 'Settings',
      'logout': 'Logout',
      'lang': 'Language',
    }
  };

  // 🛠️ Fonction utilitaire pour récupérer le texte traduit
  static String translate(String key) {
    return translations[languageNotifier.value]?[key] ?? key;
  }
}