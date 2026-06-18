// lib/screens/card_settings_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../app/theme_extensions.dart'; 
import 'card_settings_provider.dart'; // 🚀 Correction de la casse de l'import (minuscule)

class CardSettingsScreen extends StatelessWidget {
  const CardSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: const Text(
          'Paramètres de la carte',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () {
            FocusScope.of(context).unfocus(); 
            Navigator.of(context).pop();
          },
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Consumer<CardSettingsProvider>(
        builder: (context, settingsProvider, child) {
          if (settingsProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionTitle('Sécurité'),
                const SizedBox(height: 10),
                _buildSettingsGroup(
                  children: [
                    _buildSwitchTile(
                      icon: Icons.lock_outline_rounded,
                      iconColor: Colors.blue,
                      title: 'Double authentification',
                      subtitle: 'Exiger le code PIN pour les achats web',
                      value: settingsProvider.requirePinForWeb,
                      onChanged: (val) => _executeAction(context, () => settingsProvider.toggleRequirePinForWeb(val)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                _buildSectionTitle('Canaux d\'utilisation'),
                const SizedBox(height: 10),
                _buildSettingsGroup(
                  children: [
                    _buildSwitchTile(
                      icon: Icons.language_rounded,
                      iconColor: Colors.green,
                      title: 'Paiements internationaux',
                      subtitle: 'Autoriser les transactions hors du pays',
                      value: settingsProvider.allowInternational,
                      onChanged: (val) => _executeAction(context, () => settingsProvider.toggleInternational(val)),
                    ),
                    const Divider(height: 1, indent: 56, color: Color(0xFFF1F5F9)),
                    _buildSwitchTile(
                      icon: Icons.shopping_cart_outlined,
                      iconColor: Colors.orange,
                      title: 'Achats en ligne',
                      subtitle: 'Autoriser l\'utilisation sur les sites e-commerce',
                      value: settingsProvider.allowOnline,
                      onChanged: (val) => _executeAction(context, () => settingsProvider.toggleOnline(val)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                _buildSectionTitle('Alertes'),
                const SizedBox(height: 10),
                _buildSettingsGroup(
                  children: [
                    _buildSwitchTile(
                      icon: Icons.notifications_none_rounded,
                      iconColor: Colors.purple,
                      title: 'Notifications de dépenses',
                      subtitle: 'Recevoir une alerte après chaque achat',
                      value: settingsProvider.notifyOnSpend,
                      onChanged: (val) => _executeAction(context, () => settingsProvider.toggleNotifyOnSpend(val)),
                    ),
                  ],
                ),
                const SizedBox(height: 40),

                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: TextButton.icon(
                    onPressed: () => _confirmDeletion(context, settingsProvider),
                    icon: const Icon(Icons.delete_forever_rounded, color: Colors.red),
                    label: const Text(
                      'Supprimer définitivement la carte', 
                      style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    style: TextButton.styleFrom(
                      backgroundColor: Colors.red.withOpacity(0.08),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title.toUpperCase(), 
      style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
    );
  }

  Widget _buildSettingsGroup({required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: Column(children: children),
      ),
    );
  }

  Widget _buildSwitchTile({
    required IconData icon, 
    required Color iconColor, 
    required String title,
    required String subtitle, 
    required bool value, 
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: iconColor.withOpacity(0.1), shape: BoxShape.circle),
        child: Icon(icon, color: iconColor, size: 22),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFF1E293B))),
      subtitle: Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      trailing: Switch.adaptive(value: value, activeColor: const Color(0xFF3B36DB), onChanged: onChanged),
    );
  }

  Future<void> _executeAction(BuildContext context, Future<void> Function() action) async {
    try {
      await action();
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de la mise à jour.'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _confirmDeletion(BuildContext context, CardSettingsProvider provider) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Supprimer la carte ?'),
        content: const Text('Cette action est irréversible. Vous perdrez définitivement l\'accès à cette carte virtuelle.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler', style: TextStyle(color: Colors.grey))),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx); 
              bool success = await provider.deleteCard();
              if (success && context.mounted) {
                Navigator.of(context).pop(); 
              }
            },
            child: const Text('Supprimer', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}