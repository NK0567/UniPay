import 'package:flutter/material.dart';
import 'unipay_assistant_view.dart'; // Import de la vue créée juste au-dessus

class UniPayFloatingAssistant extends StatelessWidget {
  const UniPayFloatingAssistant({super.key});

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      backgroundColor: const Color(0xFF3B36DB), // Couleur UniPay officielle
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
      child: const Icon(
        Icons.smart_toy_rounded, // Icône de petit robot/assistant intelligent
        color: Colors.white,
        size: 26,
      ),
      onPressed: () {
        // Ouvre l'assistance de manière fluide
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const UniPayAssistantView()),
        );
      },
    );
  }
}