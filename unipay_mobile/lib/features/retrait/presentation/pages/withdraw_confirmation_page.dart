import 'package:flutter/material.dart';

class WithdrawConfirmationPage extends StatelessWidget {
  final String methodName;
  final String totalAmount;
  final String netAmount;
  final String fees;

  const WithdrawConfirmationPage({super.key, required this.methodName, required this.totalAmount, required this.netAmount, required this.fees});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Confirmation')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Vérifiez les informations', style: TextStyle(color: Color(0xFF64748B))),
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: const Color(0xFFF8F9FD), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
                child: Column(
                  children: [
                    _buildRow('Méthode', methodName),
                    const Divider(height: 24),
                    _buildRow('Montant', '$totalAmount FCFA'),
                    const SizedBox(height: 12),
                    _buildRow('Frais', '$fees FCFA'),
                    const Divider(height: 24),
                    _buildRow('Vous recevrez', '$netAmount FCFA', isTotal: true),
                  ],
                ),
              ),
              const Spacer(),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4E4AF2), minimumSize: const Size(double.infinity, 56), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Demande de retrait transmise !'), backgroundColor: Colors.green));
                  Navigator.of(context).popUntil((route) => route.isFirst);
                },
                child: const Text('Confirmer le retrait', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: const Color(0xFF64748B), fontWeight: isTotal ? FontWeight.bold : FontWeight.normal)),
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: isTotal ? 16 : 14, color: isTotal ? const Color(0xFF4E4AF2) : const Color(0xFF1E293B))),
      ],
    );
  }
}