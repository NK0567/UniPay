import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'notification_setting_page.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  // Catégorie actuellement sélectionnée pour le filtre
  String _selectedCategory = 'Toutes';

  // Liste des puces de filtrage (Maquette)
  final List<String> _categories = ['Toutes', 'Transferts', 'Cartes', 'Sécurité'];

@override
  Widget build(BuildContext context) {
    // 1️⃣ Déplace la liste ici pour avoir accès au context
    final List<Map<String, dynamic>> notificationsMock = [
      {
        'type': 'Transferts',
        'title': 'Paiement reçu',
        'body': 'Vous avez reçu 50 000 XAF de Paul',
        'time': 'Aujourd\'hui, 10:30',
        'icon': Icons.account_balance_wallet_rounded,
        'color': context.primaryColor, // ✅ Maintenant, le context est connu
      },
      {
        'type': 'Cartes',
        'title': 'Carte gelée',
        'body': 'Votre carte VISA se termine par 5678 a été gelée',
        'time': 'Hier, 21:15',
        'icon': Icons.warning_rounded,
        'color': Colors.orange,
      },
      {
        'type': 'Sécurité',
        'title': 'Connexion détectée',
        'body': 'Nouvelle connexion depuis Douala',
        'time': 'Hier, 19:45',
        'icon': Icons.security_rounded,
        'color': Colors.blue,
      },
      // ... reste des éléments
    ];

    // 2️⃣ Utilise la liste locale
    final filteredNotifications = _selectedCategory == 'Toutes'
        ? notificationsMock
        : notificationsMock.where((n) => n['type'] == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: context.surfaceColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Notifications',
          style: TextStyle(color: context.textColor, fontWeight: FontWeight.bold, fontSize: 20),
        ),
        actions: [
          // Bouton optionnel pour naviguer vers les paramètres de la 2ème maquette
          IconButton(
            icon: Icon(Icons.settings_outlined, color: context.secondaryTextColor),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const NotificationSettingsPage()),
              );
            },
          )
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 🏆 BARRE DE FILTRAGE HORIZONTALE
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12.0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: _categories.map((category) {
                  final isSelected = _selectedCategory == category;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(category),
                      selected: isSelected,
                      selectedColor: context.primaryColor,
                      backgroundColor: const Color(0xFFF1F5F9),
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : context.secondaryTextColor,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      side: BorderSide.none,
                      onSelected: (bool selected) {
                        setState(() {
                          if (selected) _selectedCategory = category;
                        });
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          
          // 📜 LISTE DES NOTIFICATIONS
          Expanded(
            child: filteredNotifications.isEmpty
                ? const Center(child: Text('Aucune alerte dans cette catégorie'))
                : ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: filteredNotifications.length,
                    itemBuilder: (context, index) {
                      final item = filteredNotifications[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12.0),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: context.borderColor),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16.0),
                          leading: CircleAvatar(
                            backgroundColor: (item['color'] as Color).withOpacity(0.1),
                            child: Icon(item['icon'], color: item['color']),
                          ),
                          title: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                item['title'],
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: context.textColor),
                              ),
                              Icon(Icons.chevron_right, size: 16, color: Color(0xFFCBD5E1)),
                            ],
                          ),
                          subtitle: Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item['body'],
                                  style: TextStyle(color: context.secondaryTextColor, fontSize: 13, height: 1.3),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  item['time'],
                                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
