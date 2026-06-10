import 'package:flutter/material.dart';
import 'create_link_page.dart';

class LinkSharedPage extends StatelessWidget {
  final String linkUrl;
  final LinkType linkType;
  final String fixedAmount;
  final String currency;

  const LinkSharedPage({
    super.key,
    required this.linkUrl,
    required this.linkType,
    required this.fixedAmount,
    required this.currency,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.close, color: Color(0xFF1E293B)),
            onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
          )
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),

              // Badge Type de lien généré
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: linkType == LinkType.merchant ? const Color(0xFFEEEDFD) : const Color(0xFFE6F4EA),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  linkType == LinkType.merchant ? '💳 LIEN MARCHAND ACTIF' : '✨ LIEN SIMPLE ACTIF',
                  style: TextStyle(
                    color: linkType == LinkType.merchant ? const Color(0xFF4E4AF2) : const Color(0xFF10B981),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Icône succès intégrée
              Container(
                height: 80,
                width: 80,
                decoration: const BoxDecoration(color: Color(0xFFF1F5F9), shape: BoxShape.circle),
                child: const Icon(Icons.link_rounded, color: Color(0xFF4E4AF2), size: 40),
              ),
              const SizedBox(height: 24),

              const Text(
                'Votre lien est prêt !',
                style: TextStyle(color: Color(0xFF1E293B), fontSize: 22, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              
              Text(
                linkType == LinkType.merchant
                    ? 'Le payeur devra régler obligatoirement la somme fixe de $fixedAmount $currency.'
                    : 'Le payeur pourra définir lui-même le montant à vous envoyer en $currency.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 14, height: 1.4),
              ),
              const SizedBox(height: 32),

              // 🔗 Box d'affichage de l'URL générée UniPay
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8F9FD),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Text(
                  linkUrl,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF4E4AF2),
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // 📤 Bouton principal : Partager via d'autres canaux
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Logique future : Appeler le package 'share_plus' pour ouvrir les apps de messagerie du smartphone
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Ouverture des options de partage système...'), backgroundColor: Color(0xFF4E4AF2)),
                    );
                  },
                  icon: const Icon(Icons.share_outlined, color: Colors.white, size: 20),
                  label: const Text('Partager le lien', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4E4AF2),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // 📋 Bouton secondaire : Copier dans le presse-papier
              SizedBox(
                width: double.infinity,
                height: 54,
                child: OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Lien copié dans le presse-papiers !'), duration: Duration(seconds: 2)),
                    );
                  },
                  icon: const Icon(Icons.copy_rounded, color: Color(0xFF1E293B), size: 18),
                  label: const Text('Copier le lien', style: TextStyle(color: Color(0xFF1E293B), fontSize: 15, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFCBD5E1)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}