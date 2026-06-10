import 'package:flutter/material.dart';
import 'withdraw_details_page.dart';

class WithdrawMethodPage extends StatelessWidget {
  const WithdrawMethodPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Retirer de l\'argent')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Choisissez votre méthode', style: TextStyle(color: Color(0xFF64748B))),
              const SizedBox(height: 24),
              _buildMethodTile(context, 'MTN Mobile Money', '📱', Colors.yellow[700]!),
              const SizedBox(height: 12),
              _buildMethodTile(context, 'Orange Money', '🍊', Colors.orange),
              const SizedBox(height: 12),
              _buildMethodTile(context, 'Compte bancaire', '🏛️', Colors.blue),
              const Spacer(),
              Center(child: TextButton(onPressed: () {}, child: const Text('Historique des retraits', style: TextStyle(color: Color(0xFF4E4AF2), fontWeight: FontWeight.bold))))
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMethodTile(BuildContext context, String title, String icon, Color color) {
    return Container(
      decoration: BoxDecoration(color: const Color(0xFFF8F9FD), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: ListTile(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => WithdrawDetailsPage(methodName: title))),
        leading: CircleAvatar(backgroundColor: color.withOpacity(0.1), child: Text(icon)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFF64748B)),
      ),
    );
  }
}