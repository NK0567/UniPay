import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'package:flutter/services.dart'; // 🔐 Requis pour le contrôle du clavier numérique (MaxLengthEnforcement)
import '../../../paiement/presentation/pages/pay_amount_page.dart'; 
import '../../../auth/presentation/pages/pin_creation_page.dart'; // Exemple de chemin vers ta page PIN
import '../../../depot/presentation/pages/DepositMethodScreen.dart'; // Exemple de chemin
import '../../../retrait/presentation/pages/withdraw_method_page.dart'; // Exemple de chemin

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  // 👁️ État local : le solde est désormais VOILÉ par défaut au démarrage
  bool _isBalanceObscured = true;

  // 📡 DONNÉES SIMULÉES DU BACKEND (Aucune valeur en dur dans les widgets UI)
  final String _userName = "boris";
  final String _userAvatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
  
  final double _mainBalance = 125750.0;
  final String _currency = "FCFA";

  // 🔗 VARIABLES DU LIEN DE PAIEMENT (Modifiées de final à variables d'état pour permettre la mise à jour)
  int _payersCount = 3;
  double _totalReceivedLink = 75000.0;
  bool _isLinkActive = true;
  String _currentLinkUrl = "https://unipay.io/pay/req_9281f"; // Stockage initial de l'URL du lien

  final bool _isCardActive = true;
  final double _cardLimit = 500000.0;

  final bool _isSavingsObjectiveAchieved = false;
  final int _daysToSavingsObjective = 14;

  // Données de la section Épargne (Bas de page)
  final double _savingsAmount = 12500.0;
  final String _savingsObjectiveName = "Acheter un téléphone";

  // Liste JSON simulée pour l'historique des transactions
  final List<Map<String, dynamic>> _recentTransactions = [
    {
      'avatarUrl': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      'title': 'Boris vian',
      'subtitle': 'Lien de paiement - Reçu',
      'amount': 25000.0,
      'isPositive': true,
    },
    {
      'avatarUrl': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      'title': 'Boris STN',
      'subtitle': 'Lien de paiement - Payé',
      'amount': 10000.0,
      'isPositive': false,
    }
  ];

  // 🚀 FONCTION AJOUTÉE : Appelle cette fonction lorsque ton API génère un nouveau lien !
  void creerNouveauLienDePaiement({required String urlProvenantDeAPI}) {
    setState(() {
      // 1. On active le statut du nouveau lien
      _isLinkActive = true;
      
      // 2. Réinitialisation automatique des compteurs à 0 🚀
      _payersCount = 0;
      _totalReceivedLink = 0.0;
      
      // 3. Stockage de la nouvelle URL reçue pour ton système
      _currentLinkUrl = urlProvenantDeAPI; 
    });
  }

  // 🧮 Fonction utilitaire de formatage monétaire (ex: 125750 -> "125 750")
  String _formatAmount(double amount) {
    return amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), 
      (Match m) => '${m[1]} ',
    );
  }

  // 🔐 Navigue vers ta page PIN pour déverrouiller le solde
  void _verifyPinAndToggleBalance() async {
    if (!_isBalanceObscured) {
      setState(() => _isBalanceObscured = true);
      return;
    }

    final bool? isPinVerified = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (context) => const PinCreationPage(isVerificationMode: true),
      ),
    );

    if (isPinVerified == true) {
      setState(() => _isBalanceObscured = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 👋 En-tête Utilisateur
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Bonjour, $_userName 👋',
                    style: TextStyle(
                      color: isDark ? Colors.white : context.textColor, 
                      fontSize: 22, 
                      fontWeight: FontWeight.bold
                    ),
                  ),
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: isDark ? context.textColor :  Color(0xFFF8F9FD),
                    child: ClipOval(
                      child: Image.network(
                        _userAvatarUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Icon(Icons.person, color: Color(0xFF4E4AF2)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // 💳 Carte du Solde Principal
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? context.textColor :  Color(0xFFF8F9FD),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isDark ? Colors.transparent : context.borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Solde principal',
                      style:  TextStyle(color: context.secondaryTextColor, fontSize: 14, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _isBalanceObscured ? '••••••• $_currency' : '${_formatAmount(_mainBalance)} $_currency',
                          style: TextStyle(
                            color: isDark ? Colors.white : context.textColor, 
                            fontSize: 28, 
                            fontWeight: FontWeight.w900
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            _isBalanceObscured ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                            color:  Color(0xFF4E4AF2),
                          ),
                          onPressed: _verifyPinAndToggleBalance, 
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // ⚡ BOUTONS D'ACTIONS RAPIDES : DÉPÔT & RETRAIT
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (context) => const DepositMethodScreen()),
                          );
                        },
                        icon: Icon(Icons.add_rounded, color: Colors.white, size: 22),
                        label: const Text(
                          'Dépôt',
                          style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: context.primaryColor,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (context) => const WithdrawMethodPage()),
                          );
                        },
                        icon: Icon(Icons.arrow_outward_rounded, color: isDark ? Colors.white : context.textColor, size: 20),
                        label: Text(
                          'Retrait',
                          style: TextStyle(
                            color: isDark ? Colors.white : context.textColor, 
                            fontSize: 15, 
                            fontWeight: FontWeight.bold
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          backgroundColor: isDark ? context.textColor : Colors.transparent,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),


              // 📊 Section Vue d'Ensemble
              Text(
                "Vue d'ensemble",
                style: TextStyle(color: isDark ? Colors.white : context.textColor, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              
              Column(
                children: [
                  // 🔗 1. Carte Lien de Paiement
                  _buildOverviewCard(
                    context: context,
                    title: "Paiement via lien",
                    borderColor: _isLinkActive 
                        ? const Color(0xFF10B981) 
                        : const Color(0xFFEF4444),
                    onTap: () {
                      // if (_isLinkActive) {
                      //   Navigator.of(context).push(
                      //     MaterialPageRoute(builder: (context) => const PayAmountPage()),
                      //   );
                      // } else {
                      //   ScaffoldMessenger.of(context).showSnackBar(
                      //     const SnackBar(
                      //       content: Text('Ce lien de paiement a expiré.'),
                      //       backgroundColor: Color(0xFFEF4444),
                      //     ),
                      //   );
                      // }
                    },
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            color: _isLinkActive 
                                ? const Color(0xFF10B981).withOpacity(0.1) 
                                : const Color(0xFFEF4444).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _isLinkActive ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                _isLinkActive ? "Lien actif" : "Lien expiré",
                                style: TextStyle(
                                  fontSize: 11, 
                                  color: _isLinkActive ? const Color(0xFF10B981) : const Color(0xFFEF4444), 
                                  fontWeight: FontWeight.bold
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          "$_payersCount personnes ont payé",
                          style: TextStyle(
                            fontSize: 13, 
                            color: isDark ? Colors.white70 : context.secondaryTextColor, 
                            fontWeight: FontWeight.w500
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Total : ${_formatAmount(_totalReceivedLink)} $_currency",
                          style: TextStyle(
                            fontSize: 14, 
                            fontWeight: FontWeight.bold, 
                            color: _isLinkActive ? context.primaryColor : const Color(0xFF94A3B8)
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // 💳 2. Carte Carte Virtuelle
                  _buildOverviewCard(
                    context: context,
                    title: "Carte Virtuelle",
                    borderColor: context.primaryColor,
                    onTap: () {},
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: _isCardActive ? Colors.green.withOpacity(0.1) : context.secondaryTextColor.withOpacity(0.1), 
                                borderRadius: BorderRadius.circular(4)
                              ),
                              child: Text(
                                _isCardActive ? "Active" : "Inactive", 
                                style: TextStyle(color: _isCardActive ? Colors.green : context.secondaryTextColor, fontSize: 11, fontWeight: FontWeight.bold)
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text("•••• 4582", style: TextStyle(fontSize: 12, color: context.secondaryTextColor/*.shade500*/)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          "Plafond : ${_formatAmount(_cardLimit)} $_currency",
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: isDark ? Colors.white : context.textColor),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // 🐖 3. Carte Intelligence Épargne
                  _buildOverviewCard(
                    context: context,
                    title: "Suivi Épargne",
                    borderColor: context.primaryColor,
                    onTap: () {},
                    child: Text(
                      _isSavingsObjectiveAchieved 
                          ? "Félicitations, votre objectif d'épargne est atteint ! 🎉"
                          : "Sera atteint dans $_daysToSavingsObjective jours si vous conservez la cadence", 
                      style: TextStyle(
                        fontSize: 13, 
                        color: isDark ? Colors.white70 : context.textColor, 
                        fontWeight: FontWeight.w500
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // 🧾 Section Transactions Récentes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Transactions récentes',
                    style: TextStyle(color: isDark ? Colors.white : context.textColor, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('Voir tout', style: TextStyle(color: Color(0xFF4E4AF2), fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              ..._recentTransactions.map((tx) {
                final prefix = tx['isPositive'] ? '+' : '-';
                return _buildTransactionItem(
                  context: context,
                  avatarUrl: tx['avatarUrl'],
                  title: tx['title'],
                  subtitle: tx['subtitle'],
                  amount: '$prefix${_formatAmount(tx['amount'])} $_currency',
                  isPositive: tx['isPositive'],
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  // 🏗️ Widget Helper : Cartes de la vue d'ensemble
  Widget _buildOverviewCard({
    required BuildContext context,
    required String title,
    required Widget child,
    required Color borderColor,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? context.textColor : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: borderColor,
            width: 1.2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 15, 
                fontWeight: FontWeight.bold, 
                color: isDark ? Colors.white : context.textColor
              ),
            ),
            const SizedBox(height: 10),
            child,
          ],
        ),
      ),
    );
  }

  // 🏗️ Widget Helper : Éléments de transaction
  Widget _buildTransactionItem({
    required BuildContext context,
    required String avatarUrl,
    required String title,
    required String subtitle,
    required String amount,
    required bool isPositive,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: isDark ? context.textColor :  Color(0xFFF8F9FD),
            child: ClipOval(
              child: Image.network(
                avatarUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Icon(Icons.person),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: isDark ? Colors.white : context.textColor, fontSize: 15, fontWeight: FontWeight.bold)),
                 SizedBox(height: 2),
                Text(subtitle, style: TextStyle(color: context.secondaryTextColor, fontSize: 13)),
              ],
            ),
          ),
          Text(
            amount,
            style: TextStyle(
              color: isPositive ?  Color(0xFF10B981) : (isDark ? Colors.white : context.textColor),
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
