import 'package:flutter/material.dart';
import '../../../../app/colors.dart';

class AntiFraudePage extends StatelessWidget {
  const AntiFraudePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🛡️ Centre Anti-Fraude')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.accentGreen.withOpacity(0.3)),
              ),
              child: const Column(
                children: [
                  Text('Votre Score de Risque Actuel', style: TextStyle(fontSize: 16)),
                  SizedBox(height: 12),
                  Text('98 / 100', style: TextStyle(fontSize: 48, color: AppColors.accentGreen, fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text('Sécurité Maximale Certifiée', style: TextStyle(color: AppColors.accentGreen)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}