import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'withdraw_details_page.dart';

class WithdrawMethodPage extends StatelessWidget {
  final String? initialAmount; 

  const WithdrawMethodPage({super.key, this.initialAmount});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text(
          initialAmount != null ? 'Retrait de l\'épargne' : 'Retirer de l\'argent',
          style: TextStyle(color: context.textColor, fontWeight: FontWeight.bold),
        ),
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: context.textColor, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Choisissez votre méthode de réception', 
                style: TextStyle(color: context.secondaryTextColor),
              ),
              const SizedBox(height: 24),
              _buildMethodTile(context, 'MTN Mobile Money', '📱', Colors.yellow[700]!),
              const SizedBox(height: 12),
              _buildMethodTile(context, 'Orange Money', '🍊', Colors.orange),
              const SizedBox(height: 12),
              _buildMethodTile(context, 'Compte bancaire', '🏛️', Colors.blue),
              const Spacer(),
              Center(
                child: TextButton(
                  onPressed: () {}, 
                  child: const Text(
                    'Historique des retraits', 
                    style: TextStyle(color: Color(0xFF4E4AF2), fontWeight: FontWeight.bold),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMethodTile(BuildContext context, String title, String icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor, 
        borderRadius: BorderRadius.circular(14), 
        border: Border.all(color: context.borderColor),
      ),
      child: ListTile(
        onTap: () => Navigator.push(
          context, 
          MaterialPageRoute(
            builder: (context) => WithdrawDetailsPage(
              methodName: title,
              initialAmount: initialAmount, // 🚀 Transmis proprement au DetailsPage
            ),
          ),
        ),
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1), 
          child: Text(icon, style: const TextStyle(fontSize: 18)),
        ),
        title: Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: context.textColor)),
        trailing: Icon(Icons.chevron_right, color: context.secondaryTextColor),
      ),
    );
  }
}