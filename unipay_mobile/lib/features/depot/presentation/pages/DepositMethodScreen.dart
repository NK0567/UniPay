import 'package:flutter/material.dart';
import 'DepositDetailsScreen.dart';

class DepositMethodScreen extends StatelessWidget {
  const DepositMethodScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Couleur principale du thème UniPay
    const primaryColor = Color(0xFF3F3DCE);

    final methods = [
      {
        'title': 'MTN Mobile Money',
        'icon': Icons.money, // Remplace par tes images/logos locaux
        'color': Colors.amber,
      },
      {
        'title': 'Orange Money',
        'icon': Icons.phone_android,
        'color': Colors.orange,
      },
      {
        'title': 'Carte bancaire',
        'icon': Icons.credit_card,
        'color': primaryColor,
      },
      {
        'title': 'Virement bancaire',
        'icon': Icons.account_balance,
        'color': Colors.grey,
      },
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Déposer de l\'argent',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Choisissez votre méthode',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.separated(
                itemCount: methods.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final method = methods[index];
                  return Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade200),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: (method['color'] as Color).withOpacity(0.1),
                        child: Icon(method['icon'] as IconData, color: method['color'] as Color),
                      ),
                      title: Text(
                        method['title'] as String,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                      onTap: () {
                        if (index == 0) {
                          // Si MTN MoMo est sélectionné, on passe à l'écran de détails
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const DepositDetailsScreen()),
                          );
                        }
                      },
                    ),
                  );
                },
              ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('• Historique des dépôts', style: TextStyle(color: Colors.grey)),
            ),
          ],
        ),
      ),
    );
  }
}