import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme{
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: const Color(0xFF00A3FF), // Bleu Cyan pour les actions principales
      scaffoldBackgroundColor: const Color(0xFF0B1426), // Le fameux Bleu Nuit Profond de fond
      cardColor: const Color(0xFF131E35), // Couleur des cartes de transactions
      textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme).copyWith(
        headlineMedium: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        bodyMedium: const TextStyle(color: Color(0xFF94A3B8)), // Gris léger pour les sous-titres
      ),
    );
  }
}