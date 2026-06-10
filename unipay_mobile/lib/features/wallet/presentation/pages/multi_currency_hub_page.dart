import 'package:flutter/material.dart';
import '../../../../app/colors.dart';

class MultiCurrencyHubPage extends StatelessWidget {
  const MultiCurrencyHubPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🌍 Hub Multi-Devises UniPay')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildCurrencyCard('Franc CFA', '1 250 750 XAF', '🇨🇲'),
          _buildCurrencyCard('Dollar US', '1 050.00 USD', '🇺🇸'),
          _buildCurrencyCard('Euro', '320.00 EUR', '🇪🇺'),
        ],
      ),
    );
  }

  Widget _buildCurrencyCard(String name, String amount, String flag) {
    return Card(
      color: AppColors.surface,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Text(flag, style: const TextStyle(fontSize: 32)),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        trailing: Text(amount, style: const TextStyle(fontSize: 18, color: AppColors.accentCyan, fontWeight: FontWeight.bold)),
      ),
    );
  }
}