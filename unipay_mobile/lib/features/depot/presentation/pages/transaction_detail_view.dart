import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';

class TransactionDetailView extends StatelessWidget {
  const TransactionDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF3B36DB); // Bleu official UniPay
    const successColor = Color(0xFF10B981); // Vert succès
    const darkTextColor = Color(0xFF0F172A); // Slate 900

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FE), // Fond doux des maquettes
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.close, color: darkTextColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Reçu de transaction',
          style: TextStyle(
            color: darkTextColor,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(Icons.share_outlined, color: darkTextColor),
            onPressed: () {
              // Logique de partage (WhatsApp, PDF, etc.)
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 10.0),
        child: Column(
          children: [
            // 🎫 DESIGN DU TICKET (REÇU COUPÉ)
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: context.textColor.withOpacity(0.03),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const SizedBox(height: 24),

                  // En-tête : Icône Succès dynamique
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: successColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.check_circle,
                      color: successColor,
                      size: 40,
                    ),
                  ),
                  const SizedBox(height: 12),

                  const Text(
                    'Transfert Réussi',
                    style: TextStyle(
                      color: successColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Montant Principal
                  const Text(
                    '- 25 000 FCFA',
                    style: TextStyle(
                      color: darkTextColor,
                      fontWeight: FontWeight.w900,
                      fontSize: 28,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Ligne pointillée de découpe du reçu
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Row(
                      children: List.generate(
                        30,
                        (index) => Expanded(
                          child: Container(
                            color: index % 2 == 0
                                ? Colors.transparent
                                : Colors.grey.shade200,
                            height: 2,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 📊 BLOC DES DÉTAILS DE LA TRANSACTION
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Column(
                      children: [
                        _buildDetailRow(
                          context,
                          'Destinataire',
                          'Paul Jean',
                          isBoldValue: true,
                        ),
                        _buildDetailRow(
                          context,
                          'Numéro de téléphone',
                          '+237 677 88 99 00',
                        ),
                        _buildDetailRow(
                          context,
                          'Opérateur',
                          'MTN Mobile Money',
                        ),
                        _buildDetailRow(
                          context,
                          'ID Transaction',
                          'TXN-20260610-98745',
                          isCopyable: true,
                        ),
                        _buildDetailRow(
                          context,
                          'Date & Heure',
                          '10 Juin 2026 à 10:30',
                        ),
                        const Divider(
                          height: 32,
                          thickness: 1,
                          color: Color(0xFFF1F5F9),
                        ),
                        _buildDetailRow(
                          context,
                          'Montant envoyé',
                          '25 000 FCFA',
                        ),
                        _buildDetailRow(context, 'Frais de service', '0 FCFA'),
                        const SizedBox(height: 8),
                        _buildDetailRow(
                          context,
                          'Total Débité',
                          '25 000 FCFA',
                          valueColor: primaryColor,
                          isBoldValue: true,
                          fontSize: 16,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // 🛠️ ACTIONS EN BAS DE PAGE (Figure 31)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  // Logique pour télécharger en PDF
                },
                icon: Icon(
                  Icons.download_rounded,
                  color: Colors.white,
                  size: 20,
                ),
                label: const Text(
                  'Télécharger le reçu (PDF)',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
              ),
            ),
            const SizedBox(height: 12),

            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () =>
                    Navigator.popUntil(context, (route) => route.isFirst),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: BorderSide(color: Colors.grey.shade200),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  backgroundColor: context.bgColor,
                ),
                child: const Text(
                  'Retour à l\'accueil',
                  style: TextStyle(
                    color: darkTextColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // Widget utilitaire pour aligner proprement les paires clé/valeur du ticket
  Widget _buildDetailRow(
    BuildContext context,
    String label,
    String value, {
    bool isBoldValue = false,
    Color valueColor = const Color(0xFF0F172A),
    bool isCopyable = false,
    double fontSize = 14,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: context.secondaryTextColor,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
          Row(
            children: [
              Text(
                value,
                style: TextStyle(
                  color: valueColor,
                  fontSize: fontSize,
                  fontWeight: isBoldValue ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              if (isCopyable && context != null) ...[
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: () {
                    // Petite action de copie rapide pour l'ID transaction
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('ID copié !'),
                        duration: Duration(seconds: 1),
                      ),
                    );
                  },
                  child: Icon(
                    Icons.copy_rounded,
                    size: 14,
                    color: Color(0xFF3B36DB),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
