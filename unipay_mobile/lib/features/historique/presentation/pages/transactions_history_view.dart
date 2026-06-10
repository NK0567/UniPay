import 'package:flutter/material.dart';

class TransactionsHistoryView extends StatelessWidget {
  const TransactionsHistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Historique', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              IconButton(onPressed: () {}, icon: const Icon(Icons.tune_rounded, color: Color(0xFF64748B), size: 20)),
            ],
          ),
          const SizedBox(height: 10),
          _buildTransactionItem(name: 'Paul Yao', subtitle: 'Reçu', amount: '+25 000 FCFA', date: '10/06/2026 10:30', isPositive: true),
          _buildTransactionItem(name: 'Awa Kenan', subtitle: 'Envoyé', amount: '-10 000 FCFA', date: '10/06/2026 13:20', isPositive: false),
          _buildTransactionItem(name: 'MTN Mobile Money', subtitle: 'Dépôt', amount: '+20 000 FCFA', date: '09/06/2026 09:15', isPositive: true),
          _buildTransactionItem(name: 'Orange Money', subtitle: 'Retrait', amount: '-15 000 FCFA', date: '08/06/2026', isPositive: false),
          
          const SizedBox(height: 16),
          Center(
            child: TextButton(
              onPressed: () {},
              child: const Text('Voir tout', style: TextStyle(color: Color(0xFF3B36DB), fontWeight: FontWeight.bold, fontSize: 15)),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildTransactionItem({required String name, required String subtitle, required String amount, required String date, required bool isPositive}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: const Color(0xFFF1F5F9),
            child: Icon(isPositive ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded, color: isPositive ? Colors.green : Colors.red, size: 18),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1E293B))),
                const SizedBox(height: 2),
                Text('$subtitle • $date', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
              ],
            ),
          ),
          Text(
            amount,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isPositive ? Colors.green : const Color(0xFF1E293B)),
          ),
        ],
      ),
    );
  }
}