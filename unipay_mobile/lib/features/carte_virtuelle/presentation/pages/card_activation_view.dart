import 'package:flutter/material.dart';

class CardActivationView extends StatelessWidget {
  final VoidCallback onActivate;

  const CardActivationView({super.key, required this.onActivate});

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF4E4AF2);

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          // Illustration visuelle de la future carte UniPay
          Container(
            height: 180,
            width: 300,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [primaryColor.withOpacity(0.6), primaryColor],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: primaryColor.withOpacity(0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                )
              ],
            ),
            child: const Stack(
              children: [
                Positioned(
                  top: 20,
                  left: 20,
                  child: Text(
                    'UniPay Virtual',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ),
                Positioned(
                  bottom: 20,
                  right: 20,
                  child: Icon(Icons.contactless, color: Colors.white, size: 28),
                )
              ],
            ),
          ),
          const SizedBox(height: 40),
          const Text(
            'Activez votre carte virtuelle',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          const Text(
            'Pas besoin de recharge. Votre carte est directement liée à votre portefeuille principal. Vous définissez simplement un plafond de dépenses sécurisé.',
            style: TextStyle(fontSize: 14, color: Color(0xFF64748B), height: 1.5),
            textAlign: TextAlign.center,
          ),
          const Spacer(),
          // Bouton d'action pour valider l'Opt-in
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: onActivate,
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: const Text(
                'Accepter et Activer la carte',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}