import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../app/theme_extensions.dart';
import 'card_settings_provider.dart'; // Vérifiez la casse exacte du fichier
import 'card_dashboard_view.dart';

class VirtualCardScreen extends StatelessWidget {
  const VirtualCardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // 🟢 1. ÉCOUTE DU PROVIDER (SOUS RÉSERVE DE L'API REST / GRAPHQL)
    // Le watch permet de reconstruire l'écran si l'état de la carte change côté serveur ou localement
    final settingsProvider = context.watch<CardSettingsProvider>();
    final carteActive = settingsProvider.carteActive;

    // 🟢 2. EXTRACTION ET NETTOYAGE DU PLAFOND (SPENDING LIMIT)
    double spendingLimit = 150000.0; // Valeur par défaut (ex: 150 000 FCFA)

    if (carteActive != null) {
      // Nettoie la chaîne venant de l'API (ex: "150.000 FCFA" -> "150000")
      final cleanedPlafond = carteActive.plafondActuel.replaceAll(RegExp(r'[^0-9]'), '');
      spendingLimit = double.tryParse(cleanedPlafond) ?? 150000.0;
    }

    // 🟢 3. RENDU DE L'INTERFACE
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text(
          'Carte Virtuelle',
          style: TextStyle(
            color: context.textColor, 
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: context.bgColor,
        elevation: 0,
        centerTitle: true,
      ),
      body: CardDashboardView(
        spendingLimit: spendingLimit,
        onLimitChanged: (newLimit) {
          // 🟢 4. ACTION DE MISE À JOUR
          // On utilise .read() dans les callbacks pour éviter les rebuilds inutiles
          context.read<CardSettingsProvider>().modifierPlafondDansLeProvider(
                newLimit.toInt().toString(),
              );
        },
      ),
    );
  }
}