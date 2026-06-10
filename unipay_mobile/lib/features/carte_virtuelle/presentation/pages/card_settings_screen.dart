import 'package:flutter/material.dart';

class CardSettingsScreen extends StatefulWidget {
  const CardSettingsScreen({super.key});

  @override
  State<CardSettingsScreen> createState() => _CardSettingsScreenState();
}

class _CardSettingsScreenState extends State<CardSettingsScreen> {
  // États des commutateurs (Switches) pour les canaux et la sécurité
  bool _allowInternational = true;
  bool _allowOnline = true;
  bool _notifyOnSpend = true;
  bool _requirePinForWeb = false;

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF3B36DB); // Bleu/Violet UniPay

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FE), // Fond doux identique aux maquettes
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF1E293B), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Paramètres de la carte',
          style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            
            // 🛡️ SECTION 1 : SÉCURITÉ
            _buildSectionTitle('Sécurité'),
            Container(
              decoration: _buildBoxDecoration(),
              child: Column(
                children: [
                  _buildSettingTile(
                    icon: Icons.lock_outline_rounded,
                    title: 'Modifier le code PIN de la carte',
                    subtitle: 'Utilisé pour certaines validations',
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    onTap: () {
                      // Ouvrir l'écran de validation/modification du PIN
                    },
                  ),
                  const Divider(height: 1, indent: 55, color: Color(0xFFF1F5F9)),
                  _buildSwitchTile(
                    icon: Icons.security_rounded,
                    title: 'Double authentification (3D Secure)',
                    subtitle: 'Demander le code PIN de l\'app pour chaque achat web',
                    value: _requirePinForWeb,
                    onChanged: (val) => setState(() => _requirePinForWeb = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 🌍 SECTION 2 : AUTORISATIONS DE PAIEMENT (Contrôle des canaux)
            _buildSectionTitle('Canaux de paiement'),
            Container(
              decoration: _buildBoxDecoration(),
              child: Column(
                children: [
                  _buildSwitchTile(
                    icon: Icons.language_rounded,
                    title: 'Paiements internationaux',
                    subtitle: 'Autoriser les transactions hors de la zone CEMAC',
                    value: _allowInternational,
                    onChanged: (val) => setState(() => _allowInternational = val),
                  ),
                  const Divider(height: 1, indent: 55, color: Color(0xFFF1F5F9)),
                  _buildSwitchTile(
                    icon: Icons.shopping_cart_outlined,
                    title: 'Achats en ligne',
                    subtitle: 'Autoriser l\'utilisation sur les sites e-commerce',
                    value: _allowOnline,
                    onChanged: (val) => setState(() => _allowOnline = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 🔔 SECTION 3 : NOTIFICATIONS
            _buildSectionTitle('Alertes'),
            Container(
              decoration: _buildBoxDecoration(),
              child: _buildSwitchTile(
                icon: Icons.notifications_none_rounded,
                title: 'Notifications de dépenses',
                subtitle: 'Recevoir une alerte instantanée à chaque débit',
                value: _notifyOnSpend,
                onChanged: (val) => setState(() => _notifyOnSpend = val),
              ),
            ),
            const SizedBox(height: 32),

            // 🚨 SECTION 4 : ACTIONS CRITIQUES (Rouge)
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red.shade100),
              ),
              child: _buildSettingTile(
                icon: Icons.delete_outline_rounded,
                iconColor: Colors.red,
                title: 'Supprimer la carte virtuelle',
                titleColor: Colors.red,
                subtitle: 'Action irréversible. Le solde reste sur votre wallet.',
                trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.red),
                onTap: () => _showDeleteConfirmation(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Styles réutilisables pour les blocs de paramètres
  BoxDecoration _buildBoxDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: const Color(0xFFE2E8F0)),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 10),
      child: Text(
        title,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 0.5),
      ),
    );
  }

  // Ligne de paramètre classique (Lien / Bouton)
  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget trailing,
    required VoidCallback onTap,
    Color iconColor = const Color(0xFF3B36DB),
    Color titleColor = const Color(0xFF1E293B),
  }) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: iconColor, size: 22),
      title: Text(title, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: titleColor)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
      trailing: trailing,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    );
  }

  // Ligne de paramètre avec un Switch toggle
  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile(
      value: value,
      onChanged: onChanged,
      secondary: Icon(icon, color: const Color(0xFF3B36DB), size: 22),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF1E293B))),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
      activeColor: const Color(0xFF3B36DB),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    );
  }

  // Pop-up de confirmation pour la suppression de la carte
  void _showDeleteConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer la carte ?'),
        content: const Text('Êtes-vous sûr de vouloir supprimer définitivement cette carte virtuelle UniPay ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () {
              // Logique API pour supprimer la carte
              Navigator.pop(context); // Ferme le dialogue
              Navigator.pop(context); // Revient à l'écran précédent (ou recharge l'état opt-in)
            },
            child: const Text('Supprimer', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}