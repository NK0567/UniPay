import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';

class PaySuccessPage extends StatelessWidget {
  final String amountUSD;
  final String amountXAF;

  const PaySuccessPage({
    super.key,
    required this.amountUSD,
    required this.amountXAF,
  });

  @override
  Widget build(BuildContext context) {
    // Génération d'une référence de transaction dynamique propre à UniPay
    final String transactionReference = 'TXN${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';

    return Scaffold(
      backgroundColor: context.bgColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),

              // 🟢 Icône Succès Animée/Stylisée
              Container(
                height: 100,
                width: 100,
                decoration: BoxDecoration(
                  color: Color(0xFFE6F4EA), // Vert très clair
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF10B981), // Vert UniPay Succès
                  size: 64,
                ),
              ),
              const SizedBox(height: 32),

              // 📝 Titre Principal
              Text(
                'Envoi réussi !',
                style: TextStyle(
                  color: context.textColor,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              
              // ℹ️ Message contextuel dynamique
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  'Votre paiement par lien a été traité et converti instantanément par le moteur de change UniPay.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: context.secondaryTextColor.withOpacity(0.9), fontSize: 14, height: 1.4),
                ),
              ),
              const SizedBox(height: 32),

              // 📊 Ticket récapitulatif final (Comptabilité claire)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: context.surfaceColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: context.borderColor),
                ),
                child: Column(
                  children: [
                    _buildTicketRow(context, 'Montant débité', '$amountUSD USD'),
                     Divider(height: 24, color: context.borderColor),
                    _buildTicketRow(context, 'Montant reçu (Paul Yao)', '$amountXAF XAF', isHighlighted: true),
                     Divider(height: 24, color: context.borderColor),
                    _buildTicketRow(context, 'Référence', transactionReference, isCopyable: true),
                     Divider(height: 24, color: context.borderColor),
                    _buildTicketRow(context, 'Statut', 'Complété', statusGreen: true),
                  ],
                ),
              ),

              const Spacer(),

              // 📄 Bouton : Voir / Partager le reçu
              SizedBox(
                width: double.infinity,
                height: 54,
                child: OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Téléchargement du reçu PDF...'),
                        backgroundColor: Color(0xFF4E4AF2),
                      ),
                    );
                  },
                  icon: Icon(Icons.receipt_long_rounded, color: Color(0xFF4E4AF2)),
                  label: const Text(
                    'Voir le reçu',
                    style: TextStyle(color: Color(0xFF4E4AF2), fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Color(0xFF4E4AF2), width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // 🏠 Bouton : Retour à l'accueil (Reset de la navigation)
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    // Nettoie l'historique des écrans du tunnel et ramène au Dashboard
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.primaryColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Retour à l\'accueil',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTicketRow(
    BuildContext context,
    String label, 
    String value, {
    bool isHighlighted = false, 
    bool isCopyable = false, 
    bool statusGreen = false,
    
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: context.secondaryTextColor, fontSize: 14)),
        Row(
          children: [
            Text(
              value,
              style: TextStyle(
                color: statusGreen 
                    ? const Color(0xFF10B981) 
                    : (isHighlighted ?  Color(0xFF4E4AF2) : context.textColor),
                fontWeight: (isHighlighted || statusGreen) ? FontWeight.bold : FontWeight.w600,
                fontSize: isHighlighted ? 16 : 14,
              ),
            ),
            if (isCopyable && context != null) ...[
              const SizedBox(width: 6),
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Référence copiée !'), duration: Duration(seconds: 1)),
                  );
                },
                child: Icon(Icons.copy_rounded, size: 16, color: Color(0xFF4E4AF2)),
              )
            ]
          ],
        ),
      ],
    );
  }
}
