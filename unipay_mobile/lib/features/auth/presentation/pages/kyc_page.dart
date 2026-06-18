import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'pin_creation_page.dart';

class KycPage extends StatefulWidget {
  const KycPage({super.key});

  @override
  State<KycPage> createState() => _KycPageState();
}

class _KycPageState extends State<KycPage> {
  // 🧪 Variables de simulation hors-ligne
  bool _isIdUploaded = false;
  bool _isSelfieUploaded = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textColor),
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
                "Vérification d'identité",
                style: TextStyle(color: context.textColor, fontSize: 26, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Text(
                "Pour sécuriser votre compte, veuillez vérifier votre identité.",
                style: TextStyle(color: context.secondaryTextColor, fontSize: 15, height: 1.4),
              ),
              const SizedBox(height: 32),

              // 🪪 Option 1 : Pièce d'identité
              _buildKycCard(
                icon: Icons.badge_outlined,
                title: "Pièce d'identité",
                subtitle: _isIdUploaded 
                    ? "Document enregistré avec succès !" 
                    : "Prenez une photo claire de votre pièce d'identité.",
                isUploaded: _isIdUploaded,
                onTap: () {
                  setState(() => _isIdUploaded = true);
                  debugPrint("[OFFLINE TEST] CNI chargée virtuellement");
                },
              ),
              const SizedBox(height: 16),

              // 👤 Option 2 : Selfie
              _buildKycCard(
                icon: Icons.account_circle_outlined,
                title: "Selfie",
                subtitle: _isSelfieUploaded 
                    ? "Selfie enregistré avec succès !" 
                    : "Prenez un selfie pour confirmer que c'est bien vous.",
                isUploaded: _isSelfieUploaded,
                onTap: () {
                  setState(() => _isSelfieUploaded = true);
                  debugPrint("[OFFLINE TEST] Selfie chargé virtuellement");
                },
              ),

              const Spacer(),

              // 🚀 Bouton Continuer (Envoie vers le PIN)
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    // Alerte facultative si rien n'est cliqué pour guider ton test
                    if (!_isIdUploaded || !_isSelfieUploaded) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Astuce de test : Cliquez sur les options pour simuler le chargement !'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    }
                    
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (context) => const PinCreationPage()),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.primaryColor,
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
    required bool isUploaded,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isUploaded ? const Color(0xFFF0FDF4) : context.surfaceColor, // Vert clair si coché
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isUploaded ?  Color(0xFFBBF7D0) : context.borderColor),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isUploaded ?  Color(0xFFBBF7D0) : context.borderColor),
              ),
              child: Icon(icon, color: isUploaded ? const Color(0xFF16A34A) : context.primaryColor, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(color: context.textColor, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                   SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(color: isUploaded ?  Color(0xFF16A34A) : context.secondaryTextColor, fontSize: 13, height: 1.3),
                  ),
                ],
              ),
            ),
            if (isUploaded)
              Icon(Icons.check_circle, color: Color(0xFF16A34A), size: 24),
          ],
        ),
      ),
    );
  }
}
