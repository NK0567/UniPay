import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'link_shared_page.dart';
import '../../../dashboard/presentation/pages/main_shell_page.dart'; // Import de la page MainShellPage pour le fallback du bouton back

enum LinkType { simple, merchant }

class CreateLinkPage extends StatefulWidget {
  const CreateLinkPage({super.key});

  @override
  State<CreateLinkPage> createState() => _CreateLinkPageState();
}

class _CreateLinkPageState extends State<CreateLinkPage> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();

  LinkType _selectedLinkType = LinkType.simple;
  String _selectedCurrency = 'XAF';
  String _selectedExpiration = '7 jours';

  final List<String> _currencies = ['XAF', 'USD', 'EUR', 'CAD'];
  final List<String> _expirationOptions = [
    '24 heures',
    '3 jours',
    '7 jours',
    '30 jours',
    'Jamais',
  ];

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textColor),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            } else {
              // Optionnel : Si on ne peut pas pop, on redirige vers l'accueil/dashboard
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const MainShellPage()),
              );
              debugPrint("Impossible de pop, la pile de navigation est vide !");
            }
          },
        ),
        title: Text(
          'Recevoir de l\'argent',
          style: TextStyle(
            color: context.textColor,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Générez un lien de paiement unique pour recevoir des fonds instantanément depuis n\'importe où.',
                  style: TextStyle(
                    color: context.secondaryTextColor,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 24),

                // 🎛️ Sélecteur de type de lien (Logique UniPay)
                Text(
                  'Type de lien de paiement',
                  style: TextStyle(
                    color: context.textColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 10),
                LayoutBuilder(
                  builder: (context, constraints) => ToggleButtons(
                    direction: Axis.horizontal,
                    borderRadius: BorderRadius.circular(12),
                    selectedBorderColor: context.primaryColor,
                    selectedColor: Colors.white,
                    fillColor: context.primaryColor,
                    color: context.secondaryTextColor,
                    constraints: BoxConstraints.expand(
                      width: (constraints.maxWidth - 4) / 2,
                      height: 48,
                    ),
                    isSelected: [
                      _selectedLinkType == LinkType.simple,
                      _selectedLinkType == LinkType.merchant,
                    ],
                    onPressed: (int index) {
                      setState(() {
                        _selectedLinkType = index == 0
                            ? LinkType.simple
                            : LinkType.merchant;
                        if (_selectedLinkType == LinkType.simple) {
                          _amountController
                              .clear(); // Optionnel pour le lien simple
                        }
                      });
                    },
                    children:  [
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8),
                        child: Text(
                          'Lien Simple\n(Montant libre)',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8),
                        child: Text(
                          'Lien Marchand\n(Montant fixe)',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 💵 Champ Montant (Conditionnel, Dynamique et Désactivable)
                Row(
                  children: [
                    Text(
                      _selectedLinkType == LinkType.merchant
                          ? 'Montant obligatoire'
                          : 'Montant (Désactivé pour lien libre)',
                      style: TextStyle(
                        color: _selectedLinkType == LinkType.merchant
                            ? context.textColor
                            : const Color(
                                0xFF94A3B8,
                              ), // Texte plus clair si désactivé
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    if (_selectedLinkType == LinkType.merchant)
                      const Text(
                        ' *',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  // 🚫 Bloque ou active le champ dynamiquement
                  enabled: _selectedLinkType == LinkType.merchant,
                  validator: (value) {
                    if (_selectedLinkType == LinkType.merchant &&
                        (value == null || value.trim().isEmpty)) {
                      return 'Veuillez définir un montant pour un lien marchand.';
                    }
                    return null;
                  },
                  style: TextStyle(
                    color: _selectedLinkType == LinkType.merchant
                        ? context.textColor
                        :  Color(0xFF94A3B8),
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  decoration: InputDecoration(
                    hintText: _selectedLinkType == LinkType.merchant
                        ? 'Entrez le montant fixe'
                        : 'Le payeur choisira le montant',
                    hintStyle: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 14,
                      fontWeight: FontWeight.normal,
                    ),
                    filled: true,
                    // 🎨 Fond légèrement plus grisé (F1F5F9) quand le champ est désactivé
                    fillColor: _selectedLinkType == LinkType.merchant
                        ?  Color(0xFFF8F9FD)
                        :  Color(0xFFF1F5F9),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: context.borderColor),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: context.borderColor),
                    ), // Style quand désactivé
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: Color(0xFF4E4AF2),
                        width: 1.5,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.red, width: 1),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: Colors.red,
                        width: 1.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // 💱 Devise de Réception Automatique (Logique API UniPay)
                Text(
                  'Devise de réception',
                  style: TextStyle(
                    color: context.textColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(
                      0xFFF1F5F9,
                    ), // Fond légèrement grisé pour indiquer la lecture seule
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: context.borderColor),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.account_balance_wallet_outlined,
                            color: Color(0xFF4E4AF2),
                            size: 20,
                          ),
                           SizedBox(width: 12),
                          Text(
                            _selectedCurrency, // Garde ta variable qui sera alimentée par ton API
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: context.textColor,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding:  EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color:  Color(0xFF4E4AF2).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child:  Text(
                          'Automatique',
                          style: TextStyle(
                            color: Color(0xFF4E4AF2),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // 📝 Information Contextuelle (Dynamique selon le type de lien)
                Row(
                  children: [
                    Text(
                      _selectedLinkType == LinkType.merchant
                          ? "Nom de votre organisation / Entreprise"
                          : "Message d'exhortation ou Motif (Optionnel)",
                      style: TextStyle(
                        color: context.textColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    if (_selectedLinkType == LinkType.merchant)
                      const Text(
                        ' *',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _descriptionController,
                  maxLines: _selectedLinkType == LinkType.merchant
                      ? 1
                      : 3, // Plus de lignes pour un message d'exhortation
                  validator: (value) {
                    if (_selectedLinkType == LinkType.merchant &&
                        (value == null || value.trim().isEmpty)) {
                      return "Le nom de l'organisation est obligatoire pour un lien marchand.";
                    }
                    return null;
                  },
                  decoration: InputDecoration(
                    hintText: _selectedLinkType == LinkType.merchant
                        ? 'Ex: Alpha SARL, Boutique Horizon...'
                        : 'Ex: Merci pour votre précieux soutien à notre communauté !',
                    hintStyle: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 14,
                    ),
                    filled: true,
                    fillColor: const Color.fromARGB(255, 234, 234, 237),
                    prefixIcon: Icon(
                      _selectedLinkType == LinkType.merchant
                          ? Icons.business_rounded
                          : Icons
                                .volunteer_activism_rounded, // Icône de cœur/don ou d'entreprise
                      color: const Color(0xFF94A3B8),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: context.borderColor),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: Color(0xFF4E4AF2),
                        width: 1.5,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.red, width: 1),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: Colors.red,
                        width: 1.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // ⏳ Information sur la validité du lien (Aligné avec l'API 24h)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(
                      0xFFFFF7ED,
                    ), // Fond orange très léger (style alerte/info)
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFFEDD5)),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.speed_rounded,
                        color: Colors.orange,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: RichText(
                          text: TextSpan(
                            style: TextStyle(
                              color: Color(0xFFC2410C),
                              fontSize: 13,
                              height: 1.3,
                            ),
                            children: [
                              TextSpan(text: "Sécurité UniPay : "),
                              TextSpan(
                                text: "Ce lien sera valide pendant 24 heures.",
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              TextSpan(
                                text:
                                    " Passé ce délai, il expirera automatiquement.",
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 32,
                ), // Espace avant le bouton de validation
                // 🚀 Bouton Générer le lien (Version Mock/Test UniPay)
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        // 🧪 Génération du token fictif pour simuler le comportement de l'API UniPay
                        final String randomToken = DateTime.now()
                            .millisecondsSinceEpoch
                            .toString()
                            .substring(7);
                        final String generatedUrl =
                            'https://unipay.cm/pay/lnk-$randomToken';

                        // Redirection vers la page de partage avec les données validées
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => LinkSharedPage(
                              linkUrl: generatedUrl,
                              linkType: _selectedLinkType,
                              // Sera vide si Lien Simple (Montant libre), ou contiendra la valeur si Marchand
                              fixedAmount: _amountController.text.trim(),
                              currency: _selectedCurrency,
                              // Tu pourras aussi passer _descriptionController.text.trim() si ta page suivante le gère
                            ),
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: context.primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Créer le lien de paiement',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

