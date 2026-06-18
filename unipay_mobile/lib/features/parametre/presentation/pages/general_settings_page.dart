import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';

class GeneralSettingsPage extends StatefulWidget {
  const GeneralSettingsPage({super.key});

  @override
  State<GeneralSettingsPage> createState() => _GeneralSettingsPageState();
}

class _GeneralSettingsPageState extends State<GeneralSettingsPage> {
  // Données d'état fictives (À lier avec tes providers ou SharedPreferences)
  final String _currentLanguage = "Français";
  final String _currentTheme = "Clair";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.surfaceColor, // Fond clair standard de l'app
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Paramètres généraux',
          style: TextStyle(
            color: context.textColor, 
            fontWeight: FontWeight.bold, 
            fontSize: 20
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Titre de section de la maquette
              const Text(
                'PARAMÈTRES',
                style: TextStyle(
                  color: Color(0xFF4E4AF2),
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 16),

              // Bloc de paramètres groupés
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: context.borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F172A).withOpacity(0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // 1. Informations personnelles
                    _buildSettingTile(
                      icon: Icons.person_outline_rounded,
                      title: 'Informations personnelles',
                      onTap: () {
                        // Navigator.push(context, MaterialPageRoute(builder: (context) => const PersonalInfoPage()));
                      },
                    ),
                    const _SettingDivider(),

                    // 2. Sécurité
                    _buildSettingTile(
                      icon: Icons.lock_outline_rounded,
                      title: 'Sécurité',
                      onTap: () {
                        // Navigator.push(context, MaterialPageRoute(builder: (context) => const SecuritySettingsPage()));
                      },
                    ),
                    const _SettingDivider(),

                    // 3. Notifications
                    _buildSettingTile(
                      icon: Icons.notifications_none_rounded,
                      title: 'Notifications',
                      onTap: () {
                        // Déjà créé précédemment :
                        // Navigator.push(context, MaterialPageRoute(builder: (context) => const NotificationSettingsPage()));
                      },
                    ),
                    const _SettingDivider(),

                    // 4. Langue
                    _buildSettingTile(
                      icon: Icons.language_rounded,
                      title: 'Langue',
                      trailingText: _currentLanguage,
                      onTap: () {
                        _showLanguageSelector(context);
                      },
                    ),
                    const _SettingDivider(),

                    // 5. Thème
                    _buildSettingTile(
                      icon: Icons.palette_outlined,
                      title: 'Thème',
                      trailingText: _currentTheme,
                      onTap: () {
                        _showThemeSelector(context);
                      },
                    ),
                    const _SettingDivider(),

                    // 6. Aide et support
                    _buildSettingTile(
                      icon: Icons.help_outline_rounded,
                      title: 'Aide et support',
                      onTap: () {
                        // Déjà créé précédemment :
                        // Navigator.push(context, MaterialPageRoute(builder: (context) => const HelpCenterPage()));
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 🏗️ Constructeur d'option de paramètre (Tile)
  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    String? trailingText,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: context.primaryColor.withOpacity(0.08),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: context.primaryColor, size: 22),
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
                color: context.secondaryTextColor,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          const SizedBox(width: 8),
          Icon(
            Icons.chevron_right_rounded,
            color: Color(0xFF94A3B8),
            size: 20,
          ),
        ],
      ),
    );
  }

  // 🌍 Bottom Sheet de sélection des langues
  void _showLanguageSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
               Text('Sélectionner la langue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: context.textColor)),
              const SizedBox(height: 16),
              ListTile(
                title: const Text('Français'),
                trailing: _currentLanguage == 'Français' ? Icon(Icons.check, color: Color(0xFF4E4AF2)) : null,
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                title: const Text('English'),
                trailing: _currentLanguage == 'English' ? Icon(Icons.check, color: Color(0xFF4E4AF2)) : null,
                onTap: () => Navigator.pop(context),
              ),
            ],
          ),
        );
      },
    );
  }

  // 🎨 Bottom Sheet de sélection du Thème
  void _showThemeSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
               Text('Choisir le mode d\'affichage', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: context.textColor)),
              const SizedBox(height: 16),
              ListTile(
                leading: Icon(Icons.light_mode_outlined),
                title: const Text('Clair'),
                trailing: _currentTheme == 'Clair' ? Icon(Icons.check, color: Color(0xFF4E4AF2)) : null,
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: Icon(Icons.dark_mode_outlined),
                title: const Text('Sombre'),
                trailing: _currentTheme == 'Sombre' ? Icon(Icons.check, color: Color(0xFF4E4AF2)) : null,
                onTap: () => Navigator.pop(context),
              ),
            ],
          ),
        );
      },
    );
  }
}

// 🪚 Séparateur personnalisé fin et discret entre les paramètres
class _SettingDivider extends StatelessWidget {
  const _SettingDivider();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.only(left: 68.0), // Aligné après l'icône pour un rendu épuré iOS/Android moderne
      child: Divider(color: Color(0xFFF1F5F9), height: 1, thickness: 1),
    );
  }
}
