import 'package:flutter/material.dart';
import 'package:provider/provider.dart'; // 1. On importe le package provider
import 'app/theme.dart';
import 'features/splash/presentation/pages/splash_page.dart';
// 2. N'oublie pas d'ajouter l'import vers ton CardSettingsProvider ici, exemple :
import 'features/carte_virtuelle/presentation/pages/card_settings_provider.dart';

void main() {
  // Optionnel mais recommandé si tu utilises des plugins natifs plus tard
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const UniPayApp());
}

class UniPayApp extends StatelessWidget {
  const UniPayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      // 🎧 On fusionne les deux écouteurs : l'application se reconstruit si le thème OU la langue change
      animation: Listenable.merge([AppTheme.themeNotifier, AppTheme.languageNotifier]),
      builder: (context, _) {
        // 3. On injecte le Provider ici pour qu'il englobe tout le MaterialApp
        return ChangeNotifierProvider(
          create: (_) => CardSettingsProvider(), // Ton provider pour les cartes
          child: MaterialApp(
            title: 'UniPay',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: AppTheme.themeNotifier.value,
            home: const SplashPage(),
            // home: const MainShellPage(),
          ),
        );
      },
    );
  }
}