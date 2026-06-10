import 'package:flutter/material.dart';
import '../../../../app/colors.dart';
import '../../../carte_virtuelle/presentation/pages/virtual_card_screen.dart';
import '../../../epargne/presentation/pages/savings_home_page.dart';
import '../../../chatbot/presentation/pages/UniPayFloatingAssistant.dart';
import 'dashboard_page.dart';
import '../../../profil/presentation/pages/profile_view.dart';

// --- Ajout des imports pour l'historique et le reçu ---
import 'transaction_history_view.dart'; // Écran 30 : Liste des transactions
import '../../../stistique/presentation/pages/transaction_detail_view.dart';  // Écran 31 : Reçu de transaction

class MainShellPage extends StatefulWidget {
  const MainShellPage({super.key});

  @override
  State<MainShellPage> createState() => _MainShellPageState();
}

class _MainShellPageState extends State<MainShellPage> {
  int _currentIndex = 0;
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const DashboardPage(),    // Index 0 : Accueil
      const VirtualCardScreen(),  // Index 1 : Cartes Virtuelles (Maquette 29)
      const Center(
        child: Text(
          'Écran Paiements / Liens de paiement', 
          style: TextStyle(fontSize: 24, color: Colors.black),
        ),
      ),                        // Index 2 : Liens de paiement
      const SavingsHomePage(), // Index 3 : Épargne Intelligente (Maquettes 25-28)
      const ProfileView(),      // Index 4 : Profil Utilisateur
    ];
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF4E4AF2);
    const darkTextColor = Color(0xFF1E293B);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('UniPay', style: TextStyle(color: darkTextColor, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: darkTextColor),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined, color: darkTextColor),
            onPressed: () {
              // Optionnel : Navigation vers l'écran des notifications (ex: Page 12)
            },
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const UserAccountsDrawerHeader(
              decoration: BoxDecoration(color: Color(0xFFF8F9FD)),
              currentAccountPicture: CircleAvatar(
                backgroundColor: primaryColor,
                child: Text('BN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              accountName: Text('Boris Ngouadjeu', style: TextStyle(color: darkTextColor, fontWeight: FontWeight.bold)),
              accountEmail: Text('boris@unipay.com', style: TextStyle(color: Color(0xFF64748B))),
            ),
            _buildDrawerItem(Icons.person_outline, 'Mon Profil', () {
              Navigator.pop(context); 
              setState(() => _currentIndex = 4); 
            }),
            
            // 🔄 CONNEXION À L'ÉCRAN 30 (HISTORIQUE) VIA LE DRAWER
            _buildDrawerItem(Icons.swap_horiz_rounded, 'Transactions', () {
              Navigator.pop(context); // Ferme le menu latéral
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const TransactionHistoryView()),
              );
            }),
            
            _buildDrawerItem(Icons.credit_card_outlined, 'Cartes Virtuelles', () {
              Navigator.pop(context);
              setState(() => _currentIndex = 1); 
            }),
            _buildDrawerItem(Icons.link_rounded, 'Liens de Paiement', () {
              Navigator.pop(context);
              setState(() => _currentIndex = 2); 
            }),
            _buildDrawerItem(Icons.smart_toy_outlined, 'Chatbot IA', () {
              Navigator.pop(context);
              // Déclencheur direct du comportement de l'assistant virtuel
            }),
            _buildDrawerItem(Icons.security_outlined, 'Sécurité', () {
              Navigator.pop(context);
            }),
            _buildDrawerItem(Icons.support_agent_rounded, 'Support', () {
              Navigator.pop(context);
            }),
            _buildDrawerItem(Icons.settings_outlined, 'Paramètres', () {
              Navigator.pop(context);
            }),
            const Divider(color: Color(0xFFE2E8F0)),
            _buildDrawerItem(Icons.logout_rounded, 'Déconnexion', () {}, color: Colors.red),
          ],
        ),
      ),
      body: _pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: primaryColor,
        unselectedItemColor: const Color(0xFF94A3B8),
        showUnselectedLabels: true,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Accueil'),
          BottomNavigationBarItem(icon: Icon(Icons.credit_card_rounded), label: 'Cartes'),
          BottomNavigationBarItem(icon: Icon(Icons.payment_rounded), label: 'Paiements'),
          BottomNavigationBarItem(icon: Icon(Icons.trending_up_rounded), label: 'Épargne'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profil'),
        ],
      ),
      floatingActionButton: const UniPayFloatingAssistant(),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, VoidCallback onTap, {Color? color}) {
    return ListTile(
      leading: Icon(icon, color: color ?? const Color(0xFF1E293B)),
      title: Text(title, style: TextStyle(color: color ?? const Color(0xFF1E293B), fontSize: 16)),
      onTap: onTap,
    );
  }
}