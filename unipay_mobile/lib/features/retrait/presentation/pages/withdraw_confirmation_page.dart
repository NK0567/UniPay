import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import '../../../dashboard/presentation/pages/main_shell_page.dart';

class WithdrawConfirmationPage extends StatelessWidget {
  final String methodName;
  final String totalAmount;
  final String netAmount;
  final String fees;
  final bool isSavings;

  const WithdrawConfirmationPage({
    super.key,
    required this.methodName,
    required this.totalAmount,
    required this.netAmount,
    required this.fees,
    required this.isSavings,
  });

  /// 🏠 Méthode centralisée pour rediriger proprement vers l'accueil sans crash
  void _redirectToHome(BuildContext context) {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (context) => const MainShellPage(),
      ),
      (route) => false, // Efface tout l'historique pour éviter les écrans noirs
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // 🔒 Bloque le retour automatique par défaut (anti-crash)
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _redirectToHome(context); // 🚀 Force la redirection propre sur le bouton retour Android
      },
      child: Scaffold(
        backgroundColor: context.bgColor,
        appBar: AppBar(
          title: const Text('Confirmation'),
          centerTitle: true,
          // ⬅️ Bouton retour personnalisé pour l'AppBar
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
            onPressed: () => _redirectToHome(context), // Redirige proprement au clic
          ),
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Vérifiez les informations',
                  style: TextStyle(color: context.secondaryTextColor),
                ),
                const SizedBox(height: 24),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8F9FD),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: context.borderColor),
                  ),
                  child: Column(
                    children: [
                      _buildRow(
                        context,
                        'Méthode',
                        methodName,
                      ),
                      const Divider(height: 24),
                      _buildRow(context, 'Montant', '$totalAmount FCFA'),
                      const SizedBox(height: 12),
                      _buildRow(context, 'Frais', '$fees FCFA'),
                      const Divider(height: 24),
                      _buildRow(
                        context,
                        'Vous recevrez',
                        '$netAmount FCFA',
                        isTotal: true,
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.primaryColor,
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Demande de retrait transmise !'),
                        backgroundColor: Colors.green,
                        duration: Duration(seconds: 1),
                      ),
                    );
                    
                    // Ajustement du délai pour laisser l'animation du SnackBar visible
                    Future.delayed(const Duration(milliseconds: 800), () {
                      if (context.mounted) {
                        _redirectToHome(context);
                      }
                    });
                  },
                  child: const Text(
                    'Confirmer le retrait',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRow(
    BuildContext context,
    String label,
    String value, {
    bool isTotal = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: context.secondaryTextColor,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: isTotal ? 16 : 14,
            color: isTotal ? const Color(0xFF4E4AF2) : context.textColor,
          ),
        ),
      ],
    );
  }
}