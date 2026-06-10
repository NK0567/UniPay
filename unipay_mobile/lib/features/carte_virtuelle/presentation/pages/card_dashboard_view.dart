import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../chatbot/presentation/pages/UniPayFloatingAssistant.dart';
import 'card_settings_screen.dart';

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

class _CardDashboardViewState extends State<CardDashboardView> {
  bool _revealDetails = false;
  // Ajout d'un état local pour gérer dynamiquement le gel depuis le menu
  bool _isFrozen = false; 

  final String _cardNumber = "4587 1293 8475 4587";
  final String _cardExpiry = "12/28";
  final String _cardCvv = "123";

  void _toggleDetails() {
    setState(() {
      _revealDetails = !_revealDetails;
    });
  }

  void _copyToClipboard(BuildContext context) {
    Clipboard.setData(ClipboardData(text: _cardNumber));
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

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF3B36DB); 
    const backgroundColor = Color(0xFFF8F9FE); 

    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            
            // 💳 1. LA CARTE VIRTUELLE
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: double.infinity,
              height: 215,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                // La carte devient grise si elle est gelée
                color: _isFrozen ? const Color(0xFF64748B) : primaryColor, 
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: (_isFrozen ? Colors.grey : primaryColor).withOpacity(0.25),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  )
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'U',
                          style: TextStyle(
                            color: Colors.white, 
                            fontWeight: FontWeight.bold, 
                            fontSize: 18,
                          ),
                        ),
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
                    _revealDetails 
                        ? _cardNumber 
                        : '••••  ••••  ••••  ${_cardNumber.substring(_cardNumber.length - 4)}',
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
                          const Text('Expire', style: TextStyle(color: Colors.white60, fontSize: 11)),
                          const SizedBox(height: 2),
                          Text(
                            _revealDetails ? _cardExpiry : '••/••', 
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(width: 50),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('CVV', style: TextStyle(color: Colors.white60, fontSize: 11)),
                          const SizedBox(height: 2),
                          Text(
                            _revealDetails ? _cardCvv : '•••', 
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                  
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Solde', style: TextStyle(color: Colors.white60, fontSize: 11)),
                      Text(
                        '125 750 FCFA', 
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ⚡ 2. BOUTONS D'ACTION : AFFICHER & COPIER
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _toggleDetails,
                    icon: Icon(
                      _revealDetails ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 18,
                      color: const Color(0xFF1E293B),
                    ),
                    label: Text(_revealDetails ? 'Masquer' : 'Afficher'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF1E293B),
                      side: BorderSide(color: Colors.grey.shade200),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _copyToClipboard(context),
                    icon: const Icon(Icons.copy_rounded, size: 18, color: Color(0xFF1E293B)),
                    label: const Text('Copier'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF1E293B),
                      side: BorderSide(color: Colors.grey.shade200),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            TextButton(
              onPressed: () {},
              child: const Text(
                'Afficher les détails',
                style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
            const SizedBox(height: 12),

            // 🛠️ 3. BARRE DE MENUS HORIZONTALE BRANCHÉE
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
                    iconColor: Colors.orange,
                    onTap: () {
                      setState(() => _isFrozen = true);
                    },
                  ),
                  _buildActionMenu(
                    icon: Icons.play_circle_outline, 
                    label: 'Dégeler', 
                    iconColor: Colors.green,
                    onTap: () {
                      setState(() => _isFrozen = false);
                    },
                  ),
                  _buildActionMenu(
                    icon: Icons.tune_rounded, 
                    label: 'Plafond', 
                    iconColor: primaryColor,
                    onTap: () {
                      // Action pour focus ou ouvrir le panneau de réglage du plafond
                    },
                  ),
                  _buildActionMenu(
                    icon: Icons.settings_outlined, 
                    label: 'Paramètres', 
                    iconColor: const Color(0xFF64748B),
                    onTap: () {
                      // 🚀 LIAISON EN CLIC : Redirection vers la page des paramètres
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const CardSettingsScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 📊 4. BLOC INFOS STATUT & PROGRESSION MIROIR
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade100),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Column(
                children: [
                  // Statut Card dynamique
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Statut', style: TextStyle(color: Color(0xFF64748B), fontSize: 14, fontWeight: FontWeight.w500)),
                      Text(
                        _isFrozen ? 'Gelée' : 'Active', 
                        style: TextStyle(
                          color: _isFrozen ? Colors.orange : Colors.green, 
                          fontWeight: FontWeight.bold, 
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    child: Divider(height: 1, thickness: 1, color: Color(0xFFF1F5F9)),
                  ),
                  
                  // Plafond Actuel
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Plafond actuel', style: TextStyle(color: Color(0xFF64748B), fontSize: 14, fontWeight: FontWeight.w500)),
                      Text(
                        '${widget.spendingLimit.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]} ')} XAF',
                        style: const TextStyle(color: Color(0xFF1E1B4B), fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    child: Divider(height: 1, thickness: 1, color: Color(0xFFF1F5F9)),
                  ),
                  
                  // Jauge d'évolution Dépenses
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('Dépenses ce mois', style: TextStyle(color: Color(0xFF64748B), fontSize: 14, fontWeight: FontWeight.w500)),
                          Text('25%', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 14)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: const LinearProgressIndicator(
                          value: 0.25, 
                          minHeight: 7,
                          backgroundColor: Color(0xFFE2E8F0),
                          valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
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
    // Raccourci d'accès direct branché ici :
  floatingActionButton: const UniPayFloatingAssistant(),
    );
  }

  // Signature de fonction mise à jour pour accepter le callback de clic (onTap)
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
              style: const TextStyle(color: Color(0xFF1E293B), fontSize: 12, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }
}