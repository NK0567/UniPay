import 'package:flutter/material.dart';
import 'pin_creation_page.dart';

class KycPage extends StatelessWidget {
  const KycPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Vérification d'identité",
                style: TextStyle(color: Color(0xFF1E293B), fontSize: 26, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              const Text(
                "Pour sécuriser votre compte, veuillez vérifier votre identité.",
                style: TextStyle(color: Color(0xFF64748B), fontSize: 15, height: 1.4),
              ),
              const SizedBox(height: 32),

              // 🪪 Option 1 : Pièce d'identité
              _buildKycCard(
                icon: Icons.badge_outlined,
                title: "Pièce d'identité",
                subtitle: "Prenez une photo claire de votre pièce d'identité.",
                onTap: () {
                  // TODO: Intégrer mobile_scanner ou camera plus tard pour l'API
                  debugPrint("Lancement de l'appareil photo pour la CNI");
                },
              ),
              const SizedBox(height: 16),

              // 👤 Option 2 : Selfie
              _buildKycCard(
                icon: Icons.account_circle_outlined,
                title: "Selfie",
                subtitle: "Prenez un selfie pour confirmer que c'est bien vous.",
                onTap: () {
                  debugPrint("Lancement de la caméra frontale pour le Selfie");
                },
              ),

              const Spacer(),

              // 🚀 Bouton Continuer (Envoie vers le PIN)
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    // TODO: Plus tard, s'assurer que les fichiers sont chargés avant de push l'API Node.js
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (context) => const PinCreationPage()),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4E4AF2),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: const Text('Continuer', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKycCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFFF8F9FD),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Icon(icon, color: const Color(0xFF4E4AF2), size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(color: Color(0xFF1E293B), fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.3),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}