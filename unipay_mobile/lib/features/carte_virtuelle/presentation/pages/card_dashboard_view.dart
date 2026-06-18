import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../../app/theme_extensions.dart';
import '../../../chatbot/presentation/pages/UniPayFloatingAssistant.dart';
import '../../../auth/presentation/pages/pin_creation_page.dart';
import '../../../../core/widgets/unipay_logo.dart';
import 'card_settings_screen.dart';
import 'card_settings_provider.dart';

/// 🔀 WIDGET PARENT : Il aiguille l'affichage selon l'existence de la carte
class CardDashboardView extends StatefulWidget {
  final double spendingLimit;
  final ValueChanged<double> onLimitChanged;

  const CardDashboardView({
    super.key,
    required this.spendingLimit,
    required this.onLimitChanged,
  });

  @override
  State<CardDashboardView> createState() => _CardDashboardViewState();
}

class _CardDashboardViewState extends State<CardDashboardView>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);

    // On écoute le provider qui gère l'état de la carte depuis l'API Node.js
    final settingsProvider = context.watch<CardSettingsProvider>();

    // ⏳ Affichage d'un loader pendant que l'API vérifie si l'utilisateur a une carte
    if (settingsProvider.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF3B36DB)),
          ),
        ),
      );
    }

    // ✅ LOGIQUE DE ROUTING DYNAMIQUE
    if (settingsProvider.hasCard) {
      // Si la carte existe (Image 2), on affiche le tableau de bord de la carte
      return CardDetailsWidget(
        spendingLimit: widget.spendingLimit,
        onLimitChanged: widget.onLimitChanged,
        settingsProvider: settingsProvider,
      );
    } else {
      // Si aucune carte n'est détectée (Image 1), on affiche l'écran d'activation payant
      return ActivateCardWidget(settingsProvider: settingsProvider);
    }
  }
}

/// 💳 ÉCRAN 1 : Présentation et Activation de la Carte Virtuelle (Payant)
class ActivateCardWidget extends StatelessWidget {
  final CardSettingsProvider settingsProvider;

  const ActivateCardWidget({super.key, required this.settingsProvider});

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF3B36DB);

    return Scaffold(
      backgroundColor: context.bgColor,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Visuel de la carte inactive / présentation
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [primaryColor.withOpacity(0.8), primaryColor],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: primaryColor.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(22),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'UniPay Virtual',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Icon(
                      Icons.contactless_outlined,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),

            Text(
              'Activez votre carte virtuelle',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: context.textColor,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),

            Text(
              'Pas besoin de recharge. Votre carte est directement liée à votre portefeuille principal. Vous définissez simplement un plafond de dépenses sécurisé.',
              style: TextStyle(
                fontSize: 14,
                color: context.secondaryTextColor,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),

            // 🏷️ Rappel du coût de l'abonnement/création indiqué dans ton API (FRAIS_BASE_CREATION = 1000.00)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFEEEDFD),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Frais d\'activation uniques : 1 000 XAF',
                style: TextStyle(
                  color: primaryColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
            const SizedBox(height: 50),

            // Bouton d'action payant
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: () {
                  // Déclenche la création de la carte côté Backend Node.js
                  settingsProvider.commanderNouvelleCarte();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Accepter et Activer la carte',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: const UniPayFloatingAssistant(),
    );
  }
}

/// 📊 ÉCRAN 2 : Tableau de bord de la carte active avec données de l'API Node.js
class CardDetailsWidget extends StatefulWidget {
  final double spendingLimit;
  final ValueChanged<double> onLimitChanged;
  final CardSettingsProvider settingsProvider;

  const CardDetailsWidget({
    super.key,
    required this.spendingLimit,
    required this.onLimitChanged,
    required this.settingsProvider,
  });

  @override
  State<CardDetailsWidget> createState() => _CardDetailsWidgetState();
}

class _CardDetailsWidgetState extends State<CardDetailsWidget> {
  bool _revealDetails = false;

  void _toggleDetails() async {
    if (_revealDetails) {
      setState(() {
        _revealDetails = false;
      });
      return;
    }

    final bool? isPinVerified = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return PopScope(
          canPop: false,
          child: Scaffold(
            backgroundColor: Colors.black.withOpacity(0.4),
            body: const PinCreationPage(isVerificationMode: true),
          ),
        );
      },
    );

    if (isPinVerified == true && mounted) {
      setState(() {
        _revealDetails = true;
      });
    }
  }

  void _copyToClipboard(BuildContext context, String fullNumber) {
    Clipboard.setData(ClipboardData(text: fullNumber));
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.white, size: 20),
            SizedBox(width: 10),
            Text('Numéro de carte copié !'),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: const Color(0xFF3B36DB),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  // 🛠️ RECTIFICATION ICI : Utilisation propre et sécurisée de l'instance du Provider
  void _navigateToSettings() {
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (routeContext, animation, secondaryAnimation) =>
            ChangeNotifierProvider.value(
              value: widget
                  .settingsProvider, // On injecte l'instance du widget parent directement
              child: const CardSettingsScreen(),
            ),
        transitionsBuilder:
            (routeContext, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isCardFrozen = widget.settingsProvider.isFrozen;

    // 🔥 Extraction dynamique des données du serveur Node.js depuis ton Provider
    final String labelNumeroMasque =
        widget.settingsProvider.carteActive?.numeroMasque ??
        "••••  ••••  ••••  ••••";
    final String labelNumeroComplet =
        widget.settingsProvider.carteActive?.numeroComplet ?? labelNumeroMasque;
    final String labelExpiration =
        widget.settingsProvider.carteActive?.dateExpiration ?? "••/••";
    final String labelCvv = widget.settingsProvider.carteActive?.cvv ?? "•••";
    final String labelSolde =
        widget.settingsProvider.carteActive?.soldeDisponible ?? "0.00 XAF";
    final String labelPlafond =
        widget.settingsProvider.carteActive?.plafondActuel ??
        "${widget.spendingLimit.toInt()} XAF";

    const primaryColor = Color(0xFF3B36DB);
    const backgroundColor = Color(0xFFF8F9FE);

    return Scaffold(
      backgroundColor: context.bgColor,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // 💳 LA CARTE VIRTUELLE DYNAMIQUE
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: double.infinity,
              height: 215,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: isCardFrozen ? context.secondaryTextColor : primaryColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: (isCardFrozen ? Colors.grey : primaryColor)
                        .withOpacity(0.25),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Container(
                      //   padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                      //   decoration: BoxDecoration(
                      //     color: Colors.white.withOpacity(0.2),
                      //     borderRadius: BorderRadius.circular(8),
                      //   ),
                      //   child: const Text(
                      //     'U',
                      //     style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                      //   ),
                      // ),
                      // ✅ NOUVEAU CODE AVEC TON VRAI LOGO
                      const UniPayLogo(
                        size:
                            32.0, // Ajuste la taille selon tes besoins visuels
                        color: Colors
                            .white, // Si tu veux forcer le logo à s'afficher en blanc sur la carte
                      ),
                      const Text(
                        'VISA',
                        style: TextStyle(
                          color: Colors.white,
                          fontStyle: FontStyle.italic,
                          fontWeight: FontWeight.bold,
                          fontSize: 22,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    _revealDetails ? labelNumeroComplet : labelNumeroMasque,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 2,
                    ),
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Expire',
                            style: TextStyle(
                              color: Colors.white60,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _revealDetails ? labelExpiration : '••/••',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 50),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'CVV',
                            style: TextStyle(
                              color: Colors.white60,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _revealDetails ? labelCvv : '•••',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Solde',
                        style: TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                      Text(
                        labelSolde,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ⚡ BOUTONS D'ACTION
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _toggleDetails,
                    icon: Icon(
                      _revealDetails
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      size: 18,
                      color: context.textColor,
                    ),
                    label: Text(_revealDetails ? 'Masquer' : 'Afficher'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: context.textColor,
                      side: BorderSide(color: Colors.grey.shade200),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () =>
                        _copyToClipboard(context, labelNumeroComplet),
                    icon: Icon(
                      Icons.copy_rounded,
                      size: 18,
                      color: context.textColor,
                    ),
                    label: const Text('Copier'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: context.textColor,
                      side: BorderSide(color: Colors.grey.shade200),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            Align(
              alignment: Alignment.center,
              child: Text(
                'Options de la carte',
                style: TextStyle(
                  color: context.secondaryTextColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(height: 12),

            // 🛠️ BARRE DE MENUS
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: backgroundColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildActionMenu(
                    icon: Icons.pause_circle_outline,
                    label: 'Geler',
                    iconColor: isCardFrozen ? Colors.grey : Colors.orange,
                    onTap: () => widget.settingsProvider.toggleFreezeCard(true),
                  ),
                  _buildActionMenu(
                    icon: Icons.play_circle_outline,
                    label: 'Dégeler',
                    iconColor: !isCardFrozen ? Colors.grey : Colors.green,
                    onTap: () =>
                        widget.settingsProvider.toggleFreezeCard(false),
                  ),
                  _buildActionMenu(
                    icon: Icons.tune_rounded,
                    label: 'Plafond',
                    iconColor: primaryColor,
                    onTap: () => _showPlafondSettings(
                      context,
                      currentPlafond: widget.spendingLimit,
                    ),
                  ),
                  _buildActionMenu(
                    icon: Icons.settings_outlined,
                    label: 'Paramètres',
                    iconColor: context.secondaryTextColor,
                    onTap: _navigateToSettings,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 📊 STATUT & PROGRESSION
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade100),
                boxShadow: [
                  BoxShadow(
                    color: context.textColor.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Statut',
                        style: TextStyle(
                          color: context.secondaryTextColor,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        isCardFrozen ? 'Gelée' : 'Active',
                        style: TextStyle(
                          color: isCardFrozen ? Colors.orange : Colors.green,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    child: Divider(
                      height: 1,
                      thickness: 1,
                      color: Color(0xFFF1F5F9),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Plafond actuel',
                        style: TextStyle(
                          color: context.secondaryTextColor,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        labelPlafond,
                        style: const TextStyle(
                          color: Color(0xFF1E1B4B),
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    child: Divider(
                      height: 1,
                      thickness: 1,
                      color: Color(0xFFF1F5F9),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Dépenses ce mois',
                            style: TextStyle(
                              color: context.secondaryTextColor,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            '25%',
                            style: TextStyle(
                              color: context.textColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: 0.25,
                          minHeight: 7,
                          backgroundColor: context.borderColor,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            primaryColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: const UniPayFloatingAssistant(),
    );
  }

  void _showPlafondSettings(
    BuildContext context, {
    required double currentPlafond,
  }) {
    final TextEditingController plafondController = TextEditingController(
      text: currentPlafond.toStringAsFixed(0),
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (modalContext) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(modalContext).viewInsets.bottom + 24,
            top: 24,
            left: 24,
            right: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Configurer le plafond',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: context.textColor,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Définissez la limite maximale de transaction pour ce compte.',
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: plafondController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'Montant maximum (XAF)',
                  prefixIcon: const Icon(Icons.account_balance_wallet_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () async {
                    final String newPlafondStr = plafondController.text.trim();
                    if (newPlafondStr.isEmpty) return;

                    final double? newPlafond = double.tryParse(newPlafondStr);
                    if (newPlafond == null) return;

                    // Met à jour la variable de l'UI parente via la fonction callback
                    widget.onLimitChanged(newPlafond);

                    // ✅ Synchronise directement le changement de texte sur la carte virtuelle du Provider
                    widget.settingsProvider.modifierPlafondDansLeProvider(
                      newPlafondStr,
                    );

                    if (mounted) {
                      Navigator.pop(modalContext);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Plafond mis à jour : ${newPlafond.toInt()} XAF',
                          ),
                          backgroundColor: const Color(0xFF4E4AF2),
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4E4AF2),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Enregistrer les modifications',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildActionMenu({
    required IconData icon,
    required String label,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: iconColor, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: context.textColor,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
