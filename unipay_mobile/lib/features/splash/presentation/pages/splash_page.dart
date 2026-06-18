import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../app/colors.dart';
import '../../../auth/presentation/pages/login_page.dart';
import '../../../onboarding/presentation/pages/onboarding_page.dart';
import '../../../dashboard/presentation/pages/main_shell_page.dart';
import '../../../../core/widgets/unipay_logo.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    _startCrono();
  }

  // ⏳ Déclenche le chrono de 3 secondes au démarrage
  void _startCrono() {
    Timer(const Duration(seconds: 3), () {
      _checkNavigation();
    });
  }

  // 🧠 Logique intelligente : Trie l'écran de destination selon l'historique de l'utilisateur
  void _checkNavigation() async {
    final prefs = await SharedPreferences.getInstance();
    final bool isSharedOnboardingSeen =
        prefs.getBool('onboarding_seen') ?? false;
    final bool isUserRegistered = prefs.getBool('is_user_registered') ?? false;

    if (mounted) {
      if (isUserRegistered) {
        // L'utilisateur a déjà tout configuré par le passé -> Go Dashboard direct !
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const MainShellPage()),
        );
      } else if (isSharedOnboardingSeen) {
        // S'il a vu l'onboarding mais n'a pas fini le tunnel, il reprend à la connexion
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const LoginPage()),
        );
      } else {
        // Tout premier lancement de l'application
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const OnboardingPage()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // ✅ TON ANCIEN DESIGN EST PRÉSERVÉ À 100% ICI
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF4E4AF2),
              Color(0xFF191654),
              AppColors.background,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(flex: 3),

              // 📦 Bloc Logo Blanc Arrondi
              // Container(
              //   width: 80,
              //   height: 80,
              //   decoration: BoxDecoration(
              //     color: Colors.white,
              //     borderRadius: BorderRadius.circular(20),
              //   ),
              //   child: const Center(
              //     child: Text(
              //       'U',
              //       style: TextStyle(
              //         color: Color(0xFF4E4AF2),
              //         fontSize: 48,
              //         fontWeight: FontWeight.bold,
              //       ),
              //     ),
              //   ),
              // ),
              // ✅ NOUVEAU CODE AVEC TON VRAI LOGO
              const UniPayLogo(
                size: 32.0, // Ajuste la taille selon tes besoins visuels
                color: Colors
                    .white, // Si tu veux forcer le logo à s'afficher en blanc sur la carte
              ),
              const SizedBox(height: 24),

              // 🏷️ Nom de la marque
              const Text(
                'UniPay',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 32),

              // 📜 Slogan
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 40.0),
                child: Column(
                  children: [
                    Text(
                      'Payez. Transférez.',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Épargnez.',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'En toute simplicité.',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 15,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(flex: 2),

              // 🔄 Molette de chargement blanche
              const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white70),
                ),
              ),

              const Spacer(flex: 1),
            ],
          ),
        ),
      ),
    );
  }
}
