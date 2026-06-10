import 'package:flutter/material.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    const darkTextColor = Color(0xFF1E293B); // Slate 800
    const subtitleColor = Color(0xFF64748B); // Slate 500
    const primaryColor = Color(0xFF4E4AF2);   // Violet UniPay

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FE), // Fond clair identique aux maquettes
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 32),

            // 👤 SECTION AVATAR & NOM (Identique à la maquette)
            Center(
              child: Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 4),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const CircleAvatar(
                          radius: 50,
                          backgroundColor: Color(0xFFE2E8F0),
                          // Icône ou image par défaut simulant la photo de Jean Dupont
                          child: Icon(Icons.person, size: 60, color: Color(0xFF94A3B8)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Jean Dupont',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: darkTextColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    '+237 6 99 12 34 56',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: subtitleColor,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),

            // ⚙️ LISTE DES OPTIONS (Reproduction exacte de la liste de ta maquette)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 15,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildProfileTile(
                      icon: Icons.person_outline_rounded,
                      title: 'Informations personnelles',
                      onTap: () {},
                    ),
                    _buildDivider(),
                    _buildProfileTile(
                      icon: Icons.security_outlined,
                      title: 'Sécurité et accès',
                      onTap: () {},
                    ),
                    _buildDivider(),
                    _buildProfileTile(
                      icon: Icons.notifications_none_rounded,
                      title: 'Paramètres de notification',
                      onTap: () {},
                    ),
                    _buildDivider(),
                    _buildProfileTile(
                      icon: Icons.credit_card_outlined,
                      title: 'Méthodes de paiement',
                      onTap: () {},
                    ),
                    _buildDivider(),
                    _buildProfileTile(
                      icon: Icons.devices_rounded,
                      title: 'Appareils connectés',
                      onTap: () {},
                    ),
                    _buildDivider(),
                    _buildProfileTile(
                      icon: Icons.g_translate_rounded,
                      title: 'Langue',
                      trailingText: 'Français',
                      onTap: () {},
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 40),

            // 🛑 BOUTON DÉCONNEXION (Texte rouge centré en bas)
            TextButton(
              onPressed: () {
                // Logique de déconnexion
              },
              style: TextButton.styleFrom(
                foregroundColor: Colors.red.shade600,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
              child: const Text(
                'Déconnexion',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.3,
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  // Widget utilitaire pour créer une ligne d'option propre
  Widget _buildProfileTile({
    required IconData icon,
    required String title,
    String? trailingText,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9), // Fond léger derrière l'icône
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: const Color(0xFF4E4AF2), size: 22),
      ),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: Color(0xFF1E293B),
        ),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (trailingText != null)
            Text(
              trailingText,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
                fontWeight: FontWeight.w500,
              ),
            ),
          const SizedBox(width: 8),
          const Icon(
            Icons.arrow_forward_ios_rounded, 
            size: 14, 
            color: Color(0xFF94A3B8),
          ),
        ],
      ),
      onTap: onTap,
    );
  }

  // Séparateur discret entre les options
  Widget _buildDivider() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 20.0),
      child: Divider(
        height: 1,
        thickness: 1,
        color: Color(0xFFF1F5F9),
      ),
    );
  }
}