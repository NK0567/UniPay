import 'package:flutter/material.dart';
import 'pay_amount_page.dart';
import 'pay_validation_page.dart';

class PayLinkLandingPage extends StatelessWidget {
  // Simuler les données reçues en parsant le lien UniPay (Deep Link)
  final String initiatorName;    // ex: "Paul Yao"
  final double? fixedAmountXAF;  // null si le montant est libre (Lien Simple)
  final String description;      // ex: "Paiement pour service"

  const PayLinkLandingPage({
    super.key,
    this.initiatorName = "Paul Yao",
    this.fixedAmountXAF = 50000.0, // Mets à null pour tester le flux "Montant Libre"
    this.description = "Paiement pour service",
  });

  @override
  Widget build(BuildContext context) {
    final bool isMerchantLink = fixedAmountXAF != null;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Demande de paiement',
                      style: TextStyle(color: Color(0xFF1E293B), fontSize: 24, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '$initiatorName vous demande un paiement via UniPay.',
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 15),
                    ),
                    const SizedBox(height: 32),

                    // 📦 Card Central de Facturation
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8F9FD),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Montant demandé', style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500)),
                          const SizedBox(height: 6),
                          Text(
                            isMerchantLink ? '${fixedAmountXAF!.toStringAsFixed(0)} FCFA' : 'Montant libre',
                            style: const TextStyle(color: Color(0xFF1E293B), fontSize: 28, fontWeight: FontWeight.w900),
                          ),
                          if (isMerchantLink) ...[
                            const SizedBox(height: 4),
                            const Text(
                              '≈ 81.63 USD (selon le taux UniPay actuel)',
                              style: TextStyle(color: Color(0xFF4E4AF2), fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                          ],
                          const Divider(height: 32, color: Color(0xFFE2E8F0)),
                          const Text('Description', style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500)),
                          const SizedBox(height: 6),
                          Text(
                            description.isNotEmpty ? description : 'Aucune description fournie.',
                            style: const TextStyle(color: Color(0xFF1E293B), fontSize: 15, fontWeight: FontWeight.w600, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 🚀 Zone d'action basse fixe
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF4E4AF2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      onPressed: () {
                        if (isMerchantLink) {
                          // Flux Marchand direct : On passe à la validation par PIN
                          // On pré-calcule ou passe les données nécessaires à l'écran 18
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const PayValidationPage(
                                totalUSD: "84.13", // 81.63 + 2.50 de frais simulés
                                amountXAF: "50000",
                              ),
                            ),
                          );
                        } else {
                          // Flux Lien Simple : L'utilisateur doit configurer le montant
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const PayAmountPage(isMerchant: false),
                            ),
                          );
                        }
                      },
                      child: Text(
                        isMerchantLink ? 'Payer maintenant' : 'Saisir le montant',
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // 🛡️ Réassurance Sécurité
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.lock_outline_rounded, color: const Color(0xFF64748B).withOpacity(0.8), size: 16),
                      const SizedBox(width: 6),
                      const Text(
                        'Paiement 100% sécurisé par UniPay',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}