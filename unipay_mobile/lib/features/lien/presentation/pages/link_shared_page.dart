import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'package:flutter/services.dart'; // 💡 Requis pour le Clipboard (Presse-papiers)
import 'package:share_plus/share_plus.dart'; // 💡 Requis pour le partage natif
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

  // 📋 Fonction pour copier le lien dans le presse-papiers
  void _copyToClipboard(BuildContext context) {
    Clipboard.setData(ClipboardData(text: linkUrl)).then((_) {
      // Affichage d'un SnackBar de confirmation propre
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 10),
              Text('Lien copié dans le presse-papiers !'),
            ],
          ),
          backgroundColor: const Color(0xFF10B981), // Vert succès
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          duration: const Duration(seconds: 2),
        ),
      );
    });
  }

  // 📤 Fonction pour ouvrir le menu de partage natif du smartphone
  void _shareLink(BuildContext context) async {
    // Personnalisation du message de partage selon le type de paiement
    final String message = linkType == LinkType.merchant
        ? "Bonjour, veuillez utiliser ce lien UniPay pour régler le montant fixe de $fixedAmount $currency : $linkUrl"
        : "Bonjour, vous pouvez m'envoyer les fonds via ce lien de paiement sécurisé UniPay : $linkUrl";

    // Ouvre la feuille de partage du système (Android / iOS)
    await Share.share(
      message,
      subject: 'Lien de paiement UniPay', // Sujet utile si partagé par e-mail
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: Icon(Icons.close, color: context.textColor),
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
                    color: linkType == LinkType.merchant ? context.primaryColor : const Color(0xFF10B981),
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
                decoration: BoxDecoration(color: Color(0xFFF1F5F9), shape: BoxShape.circle),
                child: Icon(Icons.link_rounded, color: Color(0xFF4E4AF2), size: 40),
              ),
              const SizedBox(height: 24),

              Text(
                'Votre lien est prêt !',
                style: TextStyle(color: context.textColor, fontSize: 22, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              
              Text(
                linkType == LinkType.merchant
                    ? 'Le payeur devra régler obligatoirement la somme fixe de $fixedAmount $currency.'
                    : 'Le payeur pourra définir lui-même le montant à vous envoyer en $currency.',
                textAlign: TextAlign.center,
                style: TextStyle(color: context.secondaryTextColor, fontSize: 14, height: 1.4),
              ),
              const SizedBox(height: 32),

              // 🔗 Box d'affichage de l'URL générée UniPay
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                decoration: BoxDecoration(
                  color: context.surfaceColor,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: context.borderColor),
                ),
                child: Text(
                  linkUrl,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Color(0xFF4E4AF2),
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // 📤 Bouton principal : Partager via le système du téléphone
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: () => _shareLink(context), // 🚀 Appel de la fonction de partage
                  icon: Icon(Icons.share_outlined, color: Colors.white, size: 20),
                  label: const Text('Partager le lien', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.primaryColor,
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
                  onPressed: () => _copyToClipboard(context), // 🚀 Appel de la fonction copier
                  icon: Icon(Icons.copy_rounded, color: context.textColor, size: 18),
                  label:  Text('Copier le lien', style: TextStyle(color: context.textColor, fontSize: 15, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Color(0xFFCBD5E1)),
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
