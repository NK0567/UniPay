import 'package:flutter/material.dart';
import '../../../../app/colors.dart';
import '../../../auth/presentation/pages/login_page.dart'; // Import à adapter selon tes besoins futurs

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  // Données des 3 diapositives (Textes issus exactement de tes images)
  final List<Map<String, String>> _onboardingData = [
    {
      'title': 'Envoyez de l\'argent\ninstantanément',
      'subtitle': 'Transférez gratuitement\nvers vos proches.',
      'image':
          'assets/illustrations/onboarding_1.png', // Tu pourras y lier tes images ou des icônes temporaires
    },
    {
      'title': 'Payez facilement\nen ligne ou en magasin',
      'subtitle': 'Utilisez votre carte virtuelle\nen toute sécurité.',
      'image': 'assets/illustrations/onboarding_2.png',
    },
    {
      'title': 'Épargnez\nintelligemment',
      'subtitle':
          'Atteignez vos objectifs grâce\nà nos suggestions personnalisées.',
      'image': 'assets/illustrations/onboarding_3.png',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // Fond blanc pur comme sur le cliché
      body: SafeArea(
        child: Column(
          children: [
            // 📖 Le Carrousel de pages
            Expanded(
              flex: 5,
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (value) {
                  setState(() {
                    _currentPage = value;
                  });
                },
                itemCount: _onboardingData.length,
                itemBuilder: (context, index) => _buildPageContent(
                  title: _onboardingData[index]['title']!,
                  subtitle: _onboardingData[index]['subtitle']!,
                  index: index,
                ),
              ),
            ),

            // 🎛️ Barre du bas : Indicateurs de points + Bouton d'action
            Expanded(
              flex: 1,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // 1. Les petits points (Page Indicators)
                    Row(
                      children: List.generate(
                        _onboardingData.length,
                        (index) => _buildDot(index: index),
                      ),
                    ),

                    // 2. Le bouton dynamique (Suivant ou Commencer)
                    _currentPage == _onboardingData.length - 1
                        ? ElevatedButton(
                            onPressed: _navigateToLogin,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(
                                0xFF4E4AF2,
                              ), // Violet UniPay
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 32,
                                vertical: 16,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              'Commencer',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                        : TextButton(
                            onPressed: () {
                              _pageController.nextPage(
                                duration: const Duration(milliseconds: 300),
                                curve: Curves.easeIn,
                              );
                            },
                            child: Row(
                              children: [
                                const Text(
                                  'Suivant',
                                  style: TextStyle(
                                    color: Color(0xFF4E4AF2),
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF4E4AF2),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.arrow_forward_rounded,
                                    color: Colors.white,
                                    size: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Structure interne de chaque slide
  Widget _buildPageContent({
    required String title,
    required String subtitle,
    required int index,
  }) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // 🎨 Zone d'image / Illustration
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(
                  0xFFF8F9FD,
                ), // Couleur de fond douce pour l'image
                borderRadius: BorderRadius.circular(24),
              ),
              child: Center(
                // Simulation visuelle de l'illustration en attendant tes fichiers assets
                child: Icon(
                  index == 0
                      ? Icons.send_to_mobile_rounded
                      : index == 1
                      ? Icons.credit_card_rounded
                      : Icons.savings_rounded,
                  size: 100,
                  color: const Color(0xFF4E4AF2),
                ),
              ),
            ),
          ),
          const SizedBox(height: 40),

          // 🏷️ Titre principal
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Color(0xFF1E293B), // Texte sombre pour l'écran clair
              fontSize: 24,
              fontWeight: FontWeight.bold,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 16),

          // 📜 Descriptif secondaire
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 16,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  // Widget de dessin des trois points indicateurs
  Widget _buildDot({required int index}) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.only(right: 8),
      height: 8,
      width: _currentPage == index
          ? 24
          : 8, // Effet d'étirement sur le point actif
      decoration: BoxDecoration(
        color: _currentPage == index
            ? const Color(0xFF4E4AF2)
            : const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }

  // Réactive le code à la fin de onboarding_page.dart :
  void _navigateToLogin() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const LoginPage()),
    );
  }
}
