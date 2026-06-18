import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final darkTextColor = context.textColor; // Slate 800
    final subtitleColor = context.secondaryTextColor; // Slate 500

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FE), // Fond clair identique aux maquettes
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 32),

            // 👤 SECTION AVATAR & NOM
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
                              color: context.textColor.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: CircleAvatar(
                          radius: 50,
                          backgroundColor: context.borderColor,
                          child: const Icon(Icons.person, size: 60, color: Color(0xFF94A3B8)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Jean Dupont',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: darkTextColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
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

            // ⚙️ LISTE DES OPTIONS (Résolution de l'exception de Splash/Contraste)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: context.textColor.withOpacity(0.02),
                      blurRadius: 15,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                // Le Theme local force des effets de clics contrastés pour éviter l'exception
                child: Theme(
                  data: Theme.of(context).copyWith(
                    splashColor: const Color(0xFF4E4AF2).withOpacity(0.06),
                    highlightColor: const Color(0xFF4E4AF2).withOpacity(0.03),
                  ),
                  child: Column(
                    children: [
                      _buildProfileTile(
                        context: context,
                        icon: Icons.person_outline_rounded,
                        title: 'Informations personnelles',
                        onTap: () {},
                      ),
                      _buildDivider(),
                      _buildProfileTile(
                        context: context,
                        icon: Icons.security_outlined,
                        title: 'Sécurité et accès',
                        onTap: () {},
                      ),
                      _buildDivider(),
                      _buildProfileTile(
                        context: context,
                        icon: Icons.notifications_none_rounded,
                        title: 'Paramètres de notification',
                        onTap: () {},
                      ),
                      _buildDivider(),
                      _buildProfileTile(
                        context: context,
                        icon: Icons.credit_card_outlined,
                        title: 'Méthodes de paiement',
                        onTap: () {},
                      ),
                      _buildDivider(),
                      _buildProfileTile(
                        context: context,
                        icon: Icons.devices_rounded,
                        title: 'Appareils connectés',
                        onTap: () {},
                      ),
                      _buildDivider(),
                      _buildProfileTile(
                        context: context,
                        icon: Icons.g_translate_rounded,
                        title: 'Langue',
                        trailingText: 'Français',
                        onTap: () {},
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 40),

            // 🛑 BOUTON DÉCONNEXION
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
    required BuildContext context,
    required IconData icon,
    required String title,
    String? trailingText,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      // Adapte les vagues de clic aux bords arrondis du conteneur parent
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9), 
          borderRadius: BorderRadius.circular(12),
        ),
        // Le mot-clé const a été retiré d'ici car 'icon' est dynamique
        child: Icon(icon, color: const Color(0xFF4E4AF2), size: 22),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: context.textColor,
        ),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (trailingText != null)
            Text(
              trailingText,
              style: TextStyle(
                fontSize: 14,
                color: context.secondaryTextColor,
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