import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'pay_validation_page.dart'; // Import de l'Écran 13 dynamique

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
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Confirmation',
          style: TextStyle(
            color: context.textColor,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Vérifiez la transaction avant validation',
                style: TextStyle(
                  color: context.secondaryTextColor,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 24),

              // 👤 Profil du demandeur du lien
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: context.surfaceColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: context.borderColor),
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
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Bénéficiaire du lien',
                          style: TextStyle(
                            color: context.secondaryTextColor,
                            fontSize: 12,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Paul Yao',
                          style: TextStyle(
                            color: context.textColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        Text(
                          '+237 6 00 00 00 11',
                          style: TextStyle(
                            color: context.secondaryTextColor,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // 🧾 Facture Thermique Fintech de conversion
              Text(
                'Détail du règlement',
                style: TextStyle(
                  color: context.textColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: context.surfaceColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: context.borderColor),
                ),
                child: Column(
                  children: [
                    _buildSummaryRow(
                      context,
                      'Montant converti',
                      '$amountUSD USD',
                    ),
                    Divider(height: 24, color: context.borderColor),
                    _buildSummaryRow(
                      context,
                      'Valeur brute reçue',
                      '$amountXAF XAF',
                      isBold: true,
                    ),
                    Divider(height: 24, color: context.borderColor),
                    _buildSummaryRow(
                      context,
                      'Frais de traitement',
                      '$feesUSD USD',
                    ),
                    Divider(height: 24, color: context.borderColor),
                    _buildSummaryRow(
                      context,
                      'Total prélevé',
                      '$totalUSD USD',
                      isPrimaryColor: true,
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // 🔒 Le bouton appelle maintenant la validation par code PIN
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => PayValidationPage(
                          totalUSD: totalUSD,
                          amountXAF: amountXAF,
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.primaryColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Confirmer l\'envoi',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(
    BuildContext context,
    String label,
    String value, {
    bool isBold = false,
    bool isPrimaryColor = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(color: context.secondaryTextColor, fontSize: 14),
        ),
        Text(
          value,
          style: TextStyle(
            color: isPrimaryColor ? Color(0xFF4E4AF2) : context.textColor,
            fontWeight: (isBold || isPrimaryColor)
                ? FontWeight.bold
                : FontWeight.w600,
            fontSize: isPrimaryColor ? 18 : 15,
          ),
        ),
      ],
    );
  }
}
