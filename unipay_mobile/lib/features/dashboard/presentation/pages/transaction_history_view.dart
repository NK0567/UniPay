import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';

class TransactionHistoryView extends StatelessWidget {
  const TransactionHistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historique des transactions'),
        backgroundColor: context.bgColor,
        foregroundColor: context.textColor,
        elevation: 0,
      ),
      body: Center(
        child: Text(
          'Aucune transaction à afficher pour le moment.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 16, color: context.secondaryTextColor),
        ),
      ),
    );
  }
}
