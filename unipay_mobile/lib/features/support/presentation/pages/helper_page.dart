import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import '../../../chatbot/presentation/pages/unipay_assistant_view.dart';

class HelpCenterPage extends StatefulWidget {
  const HelpCenterPage({super.key});

  @override
  State<HelpCenterPage> createState() => _HelpCenterPageState();
}

class _HelpCenterPageState extends State<HelpCenterPage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";

  // Données simulées du centre d'aide (Sous réserve de ton API)
  final List<Map<String, dynamic>> _helpTopics = [
    {
      'title': 'Comment envoyer de l\'argent ?',
      'icon': Icons.send_rounded,
    },
    {
      'title': 'Comment retirer de l\'argent ?',
      'icon': Icons.arrow_downward_rounded,
    },
    {
      'title': 'Frais et commissions',
      'icon': Icons.percent_rounded,
    },
    {
      'title': 'Sécurité du compte',
      'icon': Icons.lock_outline_rounded,
    },
    {
      'title': 'Cartes virtuelles',
      'icon': Icons.credit_card_rounded,
    },
    {
      'title': 'Épargne intelligente',
      'icon': Icons.savings_outlined,
    },
    {
      'title': 'Nous contacter',
      'icon': Icons.headset_mic_outlined,
    },
  ];

  @override
  Widget build(BuildContext context) {
    // Filtrage local en fonction de la saisie dans la barre de recherche
    final filteredTopics = _helpTopics
        .where((topic) => topic['title']
            .toLowerCase()
            .contains(_searchQuery.toLowerCase()))
        .toList();

    return Scaffold(
      backgroundColor: context.surfaceColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Centre d\'aide',
          style: TextStyle(color: context.textColor, fontWeight: FontWeight.bold, fontSize: 20),
        ),
        centerTitle: false,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 🔍 BARRE DE RECHERCHE FIXE EN HAUT
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16.0),
              child: TextFormField(
                controller: _searchController,
                onChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Rechercher une aide...',
                  hintStyle: TextStyle(color: Color(0xFF94A3B8)),
                  prefixIcon: Icon(Icons.search, color: context.secondaryTextColor),
                  filled: true,
                  fillColor: context.surfaceColor,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: context.borderColor),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Color(0xFF4E4AF2), width: 1.5),
                  ),
                ),
              ),
            ),

            // 📜 LISTE DES OPTIONS DE SUPPORT
            Expanded(
              child: filteredTopics.isEmpty
                  ? const Center(child: Text('Aucun résultat trouvé pour votre recherche.'))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                      itemCount: filteredTopics.length,
                      itemBuilder: (context, index) {
                        final topic = filteredTopics[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 1), // Légère séparation
                          decoration: BoxDecoration(
                            color: Colors.white,
                            // Arrondir uniquement le premier et le dernier élément pour créer l'effet de bloc uni de la maquette
                            borderRadius: BorderRadius.vertical(
                              top: index == 0 ? const Radius.circular(16) : Radius.zero,
                              bottom: index == filteredTopics.length - 1 ? const Radius.circular(16) : Radius.zero,
                            ),
                            border: Border.all(color: const Color(0xFFF1F5F9)),
                          ),
                          child: ListTile(
                            onTap: () {
                              // Action future pour ouvrir l'article de l'API
                            },
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            leading: CircleAvatar(
                              backgroundColor: context.primaryColor.withOpacity(0.08),
                              child: Icon(topic['icon'], color: context.primaryColor, size: 20),
                            ),
                            title: Text(
                              topic['title'],
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: context.textColor,
                              ),
                            ),
                            trailing: Icon(Icons.chevron_right, color: context.secondaryTextColor, size: 20),
                          ),
                        );
                      },
                    ),
            ),

            // 🤖 BOUTON FIXE : ASSISTANT VIRTUEL (STICKY BOTTOM)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.primaryColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  onPressed: () {
                    // Action pour lancer ton Assistant Virtuel / Chatbot 
                    _openVirtualAssistantChat(context);
                  },
                  child: const Text(
                    'Discuter avec l\'assistant',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Fonction de routage temporaire vers l'assistant virtuel
  void _openVirtualAssistantChat(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Ouverture du chat avec l\'assistant virtuel...'),
        backgroundColor: Color(0xFF4E4AF2),
      ),
    );
    // Plus tard : Navigator.push(context, MaterialPageRoute(builder: (context) => const VirtualAssistantPage()));
    Navigator.push(context, MaterialPageRoute(builder: (context) => const UniPayAssistantView()));
  }
}
