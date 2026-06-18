import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import '../../../../app/theme.dart';
import '../../../carte_virtuelle/presentation/pages/virtual_card_screen.dart';
import '../../../epargne/presentation/pages/savings_home_page.dart';
import '../../../chatbot/presentation/pages/UniPayFloatingAssistant.dart';
import 'dashboard_page.dart';
import '../../widgets/dashboard_ticker_widget.dart'; // ✅ Import de ton nouveau widget Ticker API
import '../../../profil/presentation/pages/profile_view.dart';
import '../../../lien/presentation/pages/create_link_page.dart';
import '../../../securite/presentation/page/anti_fraude_page.dart';
import '../../../historique/presentation/pages/transactions_history_view.dart';
import '../../../notification/presentation/pages/notifications_page.dart';
import '../../../support/presentation/pages/helper_page.dart';
import '../../../parametre/presentation/pages/general_settings_page.dart';

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
      const DashboardPage(), // Index 0 : Accueil
      const VirtualCardScreen(), // Index 1 : Cartes Virtuelles
      const CreateLinkPage(), // Index 2 : Liens de paiement
      const SavingsHomePage(), // Index 3 : Épargne Intelligente
      const ProfileView(), // Index 4 : Profil Utilisateur
    ];
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF4E4AF2);
    final theme = Theme.of(context);
    final dynamicTextColor =
        theme.textTheme.bodyLarge?.color ?? context.textColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,

      appBar: AppBar(
        backgroundColor: theme.appBarTheme.backgroundColor,
        elevation: 0,
        iconTheme: theme.appBarTheme.iconTheme,
        automaticallyImplyLeading: true,
        titleSpacing:
            -12, // 🎯 Supprime l'espace vide inutile entre le menu et le titre UniPay
        title: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 0),
          child: Row(
            children: [
              Text(
                'UniPay',
                style: TextStyle(
                  color: context.textColor,
                  fontSize:
                      22, // Légèrement réduit pour maximiser l'espace du ticker
                  fontWeight: FontWeight.w900,
                ),
              ),

              // 🔄 Le Ticker prend tout l'espace central de manière fluide
              Expanded(
                // <--- Plus de "const" ici !
                child: const Padding(
                  // Le const peut aller ici sur le Padding si tu veux
                  padding: EdgeInsets.symmetric(horizontal: 12.0),
                  child: DashboardTickerWidget(utilisateurId: "USER_ID_123"),
                ),
              ),
            ],
          ),
        ),
        actions: [
          // ☀️/🌙 SWITCH THEME (Taille optimisée pour réduire les écarts)
          ValueListenableBuilder<ThemeMode>(
            valueListenable: AppTheme.themeNotifier,
            builder: (context, currentMode, child) {
              return SizedBox(
                width:
                    40, // 📐 Force une largeur fixe pour rapprocher les icônes
                child: IconButton(
                  padding: EdgeInsets.zero,
                  icon: Icon(
                    currentMode == ThemeMode.dark
                        ? Icons.light_mode_rounded
                        : Icons.dark_mode_rounded,
                    color: theme.appBarTheme.iconTheme?.color,
                  ),
                  onPressed: () {
                    AppTheme.themeNotifier.value =
                        AppTheme.themeNotifier.value == ThemeMode.light
                        ? ThemeMode.dark
                        : ThemeMode.light;
                  },
                ),
              );
            },
          ),

          // 🔔 CLOCHE NOTIFICATION
          SizedBox(
            width: 40, // 📐 Rapproche également la cloche du bouton thème
            child: IconButton(
              padding: EdgeInsets.zero,
              icon: const Icon(Icons.notifications_none_outlined),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const NotificationsPage(),
                  ),
                );
              },
            ),
          ),
          const SizedBox(width: 12), // Marge fine à l'extrême droite de l'écran
        ],
      ),

      // 🚪 MENU LATÉRAL (DRAWER)
      drawer: Drawer(
        backgroundColor: theme.scaffoldBackgroundColor,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              decoration: BoxDecoration(
                color: AppTheme.themeNotifier.value == ThemeMode.dark
                    ? context.textColor
                    : context.surfaceColor,
              ),
              currentAccountPicture: const CircleAvatar(
                backgroundColor: primaryColor,
                child: Text(
                  'BN',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              accountName: Text(
                'Boris Ngouadjeu',
                style: TextStyle(
                  color: dynamicTextColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
              accountEmail: Text(
                'boris@unipay.com',
                style: TextStyle(
                  color: AppTheme.themeNotifier.value == ThemeMode.dark
                      ? const Color(0xFF94A3B8)
                      : context.secondaryTextColor,
                ),
              ),
            ),

            // 🔄 1. HISTORIQUE
            _buildDrawerItem(Icons.history_rounded, 'Historique', () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TransactionsHistoryView(),
                ),
              );
            }),

            // 📊 2. STATISTIQUES
            _buildDrawerItem(Icons.bar_chart_rounded, 'Statistiques', () {
              Navigator.pop(context);
            }),

            // 🔔 3. NOTIFICATIONS
            _buildDrawerItem(
              Icons.notifications_none_rounded,
              'Notifications',
              () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const NotificationsPage(),
                  ),
                );
              },
            ),

            // 🛡️ 4. SÉCURITÉ (CENTRE ANTI-FRAUDE)
            _buildDrawerItem(Icons.security_outlined, 'Sécurité', () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const AntiFraudePage()),
              );
            }),

            // 🎧 5. SUPPORT
            _buildDrawerItem(Icons.support_agent_rounded, 'Support', () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const HelpCenterPage()),
              );
            }),

            // 🌍 6. BOUTON LANGUE (Dynamique avec ValueListenableBuilder)
            ValueListenableBuilder<String>(
              valueListenable: AppTheme.languageNotifier,
              builder: (context, lang, child) {
                return _buildDrawerItem(
                  Icons.language_rounded,
                  '${AppTheme.translate('lang')} (${lang.toUpperCase()})',
                  () {
                    Navigator.pop(context);
                    _showLanguageDialog(context);
                  },
                );
              },
            ),

            // ⚙️ 7. PARAMÈTRES
            _buildDrawerItem(Icons.settings_outlined, 'Paramètres', () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const GeneralSettingsPage(),
                ),
              );
            }),

            Divider(color: context.borderColor),
            _buildDrawerItem(
              Icons.logout_rounded,
              'Déconnexion',
              () {},
              color: Colors.red,
            ),
          ],
        ),
      ),

      body: _pages[_currentIndex],

      // 🎛️ BARRE DE NAVIGATION BASSE
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: theme.brightness == Brightness.dark
            ? context.textColor
            : Colors.white,
        selectedItemColor: primaryColor,
        unselectedItemColor: const Color(0xFF94A3B8),
        showUnselectedLabels: true,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_filled),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.credit_card_rounded),
            label: 'Cartes',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.payment_rounded),
            label: 'Paiements',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.trending_up_rounded),
            label: 'Épargne',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: 'Profil',
          ),
        ],
      ),
      floatingActionButton: const UniPayFloatingAssistant(),
    );
  }

  void _showLanguageDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Choisir la langue / Select Language'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Text('🇫🇷', style: TextStyle(fontSize: 24)),
                title: const Text('Français'),
                trailing: AppTheme.languageNotifier.value == 'fr'
                    ? const Icon(Icons.check, color: Color(0xFF4E4AF2))
                    : null,
                onTap: () {
                  AppTheme.languageNotifier.value = 'fr';
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Text('🇺🇸', style: TextStyle(fontSize: 24)),
                title: const Text('English'),
                trailing: AppTheme.languageNotifier.value == 'en'
                    ? const Icon(Icons.check, color: Color(0xFF4E4AF2))
                    : null,
                onTap: () {
                  AppTheme.languageNotifier.value = 'en';
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDrawerItem(
    IconData icon,
    String title,
    VoidCallback onTap, {
    Color? color,
  }) {
    final defaultTextColor =
        Theme.of(context).textTheme.bodyLarge?.color ?? context.textColor;

    return ListTile(
      leading: Icon(icon, color: color ?? defaultTextColor),
      title: Text(
        title,
        style: TextStyle(color: color ?? defaultTextColor, fontSize: 16),
      ),
      onTap: onTap,
    );
  }
}
