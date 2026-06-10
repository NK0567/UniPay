import 'package:flutter/material.dart';
import 'pay_success_page.dart'; // Import de l'Écran 13 dynamique

class PayConfirmationPage extends StatelessWidget {
  final String amountUSD;
  final String amountXAF;
  final String feesUSD;
  final String totalUSD;

  const PayConfirmationPage({
    super.key,
    required this.amountUSD,
    required this.amountXAF,
    required this.feesUSD,
    required this.totalUSD,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Confirmation', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Vérifiez la transaction avant validation',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 15),
              ),
              const SizedBox(height: 24),

              // 👤 Profil du demandeur du lien
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8F9FD),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 22,
                      backgroundColor: const Color(0xFFEEEDFD),
                      child: ClipOval(
                        child: Image.network(
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Bénéficiaire du lien', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                        SizedBox(height: 2),
                        Text('Paul Yao', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 15)),
                        Text('+237 6 00 00 00 11', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                      ],
                    )
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // 🧾 Facture Thermique Fintech de conversion
              const Text('Détail du règlement', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8F9FD),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    _buildSummaryRow('Montant converti', '$amountUSD USD'),
                    const Divider(height: 24, color: Color(0xFFE2E8F0)),
                    _buildSummaryRow('Valeur brute reçue', '$amountXAF XAF', isBold: true),
                    const Divider(height: 24, color: Color(0xFFE2E8F0)),
                    _buildSummaryRow('Frais de traitement', '$feesUSD USD'),
                    const Divider(height: 24, color: Color(0xFFE2E8F0)),
                    _buildSummaryRow('Total prélevé', '$totalUSD USD', isPrimaryColor: true),
                  ],
                ),
              ),

              const Spacer(),

              // 🔒 Bouton de validation finale mis à jour pour le tunnel de succès UniPay
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    // Utilisation de pushAndRemoveUntil pour purger l'historique du tunnel de paiement
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(
                        builder: (context) => PaySuccessPage(
                          amountUSD: totalUSD, // On passe le total débité en USD
                          amountXAF: amountXAF, // On passe la valeur nette reçue en XAF
                        ),
                      ),
                      (route) => route.isFirst, // Conserve uniquement la racine (MainShellPage)
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4E4AF2),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: const Text('Confirmer l\'envoi', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false, bool isPrimaryColor = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 14)),
        Text(
          value,
          style: TextStyle(
            color: isPrimaryColor ? const Color(0xFF4E4AF2) : const Color(0xFF1E293B),
            fontWeight: (isBold || isPrimaryColor) ? FontWeight.bold : FontWeight.w600,
            fontSize: isPrimaryColor ? 18 : 15,
          ),
        ),
      ],
    );
  }
}