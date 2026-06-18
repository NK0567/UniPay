import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import '../../../depot/presentation/pages/transaction_detail_view.dart'; // ✅ Importation indispensable pour ouvrir le reçu

class TransactionsHistoryView extends StatelessWidget {
  const TransactionsHistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // 1. Ajouter le widget Material ici pour corriger le crash InkWell 🛡️
    return Material(
      color: Colors
          .transparent, // Laisse le Container gérer la couleur ou gère-la ici
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? context.textColor : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? Colors.transparent : Colors.grey.shade100,
          ),
        ),
child: SingleChildScrollView( // 🔄 Rend la vue défilable pour éviter le débordement
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Historique', 
                  style: TextStyle(
                    fontSize: 16, 
                    fontWeight: FontWeight.bold, 
                    color: theme.textTheme.bodyLarge?.color
                  )
                ),
                IconButton(
                  onPressed: () {}, 
                  icon: Icon(
                    Icons.tune_rounded, 
                    color: context.secondaryTextColor, 
                    size: 20
                  )
                ),
              ],
            ),
            const SizedBox(height: 10),

            // ✅ Ajout du "context" pour permettre la navigation dans les items ci-dessous
            _buildTransactionItem(
              context,
              name: 'Paul Yao',
              subtitle: 'Reçu',
              amount: '+25 000 FCFA',
              date: '10/06/2026 10:30',
              isPositive: true,
            ),
            _buildTransactionItem(
              context,
              name: 'Awa Kenan',
              subtitle: 'Envoyé',
              amount: '-10 000 FCFA',
              date: '10/06/2026 13:20',
              isPositive: false,
            ),
            _buildTransactionItem(
              context,
              name: 'MTN Mobile Money',
              subtitle: 'Dépôt',
              amount: '+20 000 FCFA',
              date: '09/06/2026 09:15',
              isPositive: true,
            ),
            _buildTransactionItem(
              context,
              name: 'Orange Money',
              subtitle: 'Retrait',
              amount: '-15 000 FCFA',
              date: '08/06/2026',
              isPositive: false,
            ),

            const SizedBox(height: 16),
            Center(
              child: TextButton(
                onPressed: () {
                  // Optionnel : Envoie vers l'historique plein écran si nécessaire
                },
                child: const Text(
                  'Voir tout',
                  style: TextStyle(
                    color: Color(0xFF4E4AF2),
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      )
    );
  }

  Widget _buildTransactionItem(
    BuildContext context, { // ✅ On passe le context ici
    required String name,
    required String subtitle,
    required String amount,
    required String date,
    required bool isPositive,
  }) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: () {
        // 🚀 Ouvre le reçu de transaction au clic
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const TransactionDetailView(),
          ),
        );
      },
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 4.0),
        child: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: theme.brightness == Brightness.dark
                  ? const Color(0xFF334155)
                  : const Color(0xFFF1F5F9),
              child: Icon(
                isPositive
                    ? Icons.arrow_downward_rounded
                    : Icons.arrow_upward_rounded,
                color: isPositive ? Colors.green : Colors.red,
                size: 18,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: theme.textTheme.bodyLarge?.color,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$subtitle • $date',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            Text(
              amount,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: isPositive
                    ? Colors.green
                    : (theme.textTheme.bodyLarge?.color),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
