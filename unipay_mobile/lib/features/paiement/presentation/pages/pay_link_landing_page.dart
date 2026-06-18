import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'pay_amount_page.dart';
import 'pay_confirmation_page.dart';

class PayLinkLandingPage extends StatelessWidget {
  // Simuler les données reçues en parsant le lien UniPay (Deep Link)
  final String initiatorName; // ex: "Paul Yao"
  final double? fixedAmountXAF; // null si le montant est libre (Lien Simple)
  final String description; // ex: "Paiement pour service"

  const PayLinkLandingPage({
    super.key,
    this.initiatorName = "Paul Yao",
    this.fixedAmountXAF =
        50000.0, // Mets à null pour tester le flux "Montant Libre"
    this.description = "Paiement pour service",
  });

  @override
  Widget build(BuildContext context) {
    final bool isMerchantLink = fixedAmountXAF != null;

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textColor),
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
                    Text(
                      'Demande de paiement',
                      style: TextStyle(
                        color: context.textColor,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '$initiatorName vous demande un paiement via UniPay.',
                      style: TextStyle(
                        color: context.secondaryTextColor,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // 📦 Card Central de Facturation
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: context.surfaceColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: context.borderColor),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Montant demandé',
                            style: TextStyle(
                              color: context.secondaryTextColor,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            isMerchantLink
                                ? '${fixedAmountXAF!.toStringAsFixed(0)} FCFA'
                                : 'Montant libre',
                            style: TextStyle(
                              color: context.textColor,
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          if (isMerchantLink) ...[
                            const SizedBox(height: 4),
                            const Text(
                              '≈ 81.63 USD (selon le taux UniPay actuel)',
                              style: TextStyle(
                                color: Color(0xFF4E4AF2),
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                          Divider(height: 32, color: context.borderColor),
                          Text(
                            'Description',
                            style: TextStyle(
                              color: context.secondaryTextColor,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            description.isNotEmpty
                                ? description
                                : 'Aucune description fournie.',
                            style: TextStyle(
                              color: context.textColor,
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              height: 1.4,
                            ),
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
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 16.0,
              ),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: context.primaryColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      onPressed: () {
                        if (isMerchantLink) {
                          // 🚀 Flux Marchand : On va d'abord à la CONFIRMATION, pas au PIN direct !
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const PayConfirmationPage(
                                amountUSD: "81.63",
                                amountXAF: "50000",
                                feesUSD: "2.50",
                                totalUSD: "84.13",
                              ),
                            ),
                          );
                        } else {
                          // Flux Lien Simple : L'utilisateur configure le montant
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  const PayAmountPage(isMerchant: false),
                            ),
                          );
                        }
                      },
                      child: Text(
                        isMerchantLink
                            ? 'Payer maintenant'
                            : 'Saisir le montant',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // 🛡️ Réassurance Sécurité
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.lock_outline_rounded,
                        color: context.secondaryTextColor.withOpacity(0.8),
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Paiement 100% sécurisé par UniPay',
                        style: TextStyle(
                          color: context.secondaryTextColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
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
