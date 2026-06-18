import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'create_objective_page.dart';
import 'objective_detail_page.dart';

class SavingsHomePage extends StatefulWidget {
  const SavingsHomePage({super.key});

  @override
  State<SavingsHomePage> createState() => _SavingsHomePageState();
}

class _SavingsHomePageState extends State<SavingsHomePage> {
  bool _isSmartSavingsEnabled = true;

  // 📂 Liste réactive contenant les objectifs en cours et atteints
  final List<Map<String, dynamic>> _objectifs = [
    {
      'title': "Moto Honda",
      'target': 2000000.0,
      'current': 1480000.0,
      'emoji': "🏍️",
      'isStrict': true,
      'isWithdrawn': false,
      'completionDate': null,
    },
    {
      'title': "Ordinateur portable",
      'target': 1200000.0,
      'current': 540000.0,
      'emoji': "💻",
      'isStrict': false,
      'isWithdrawn': false,
      'completionDate': null,
    },
    {
      'title': "Voyage à Bali",
      'target': 1500000.0,
      'current': 1500000.0,
      'emoji': "🎉",
      'isStrict': false,
      'isWithdrawn': false,
      'completionDate': null,
    },
  ];

  void _naviguerVersCreation() async {
    final result = await Navigator.push<Map<String, dynamic>>(
      context, 
      MaterialPageRoute(builder: (context) => const CreateObjectivePage())
    );

    if (result != null) {
      setState(() {
        _objectifs.add({
          'title': result['name'],
          'target': result['targetAmount'],
          'current': result['currentAmount'],
          'emoji': "🎯",
          'isStrict': result['type'] == 'Stricte',
          'isWithdrawn': false,
          'completionDate': null,
        });
      });
    }
  }

  // 🔄 Ouvre la page de détail et récupère les états mis à jour au retour
  void _ouvrirDetailObjectif(int globalIndex, Map<String, dynamic> obj) async {
    final result = await Navigator.push<Map<String, dynamic>>(
      context, 
      MaterialPageRoute(
        builder: (context) => ObjectiveDetailPage(
          title: obj['title'], 
          isStrict: obj['isStrict'],
          initialCurrentAmount: obj['current'],
          initialTargetAmount: obj['target'],
        ),
      ),
    );

    if (result != null && mounted) {
      setState(() {
        _objectifs[globalIndex]['current'] = result['updatedCurrent'];
        
        // Si un retrait a été effectué depuis la page de détails
        if (result['isWithdrawn'] == true) {
          _objectifs[globalIndex]['isWithdrawn'] = true;
          _objectifs[globalIndex]['completionDate'] = result['completionDate'];
        } 
        // Si l'objectif est atteint via un dépôt classique
        else if (_objectifs[globalIndex]['current'] >= _objectifs[globalIndex]['target']) {
          // On assigne la date de complétion si elle n'existait pas déjà
          _objectifs[globalIndex]['completionDate'] ??= DateTime.now();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text('Épargne', style: TextStyle(color: context.textColor, fontWeight: FontWeight.bold)),
        backgroundColor: context.bgColor,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🤖 Card Toggle Épargne Intelligente
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4E4AF2), Color(0xFF6366F1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: context.primaryColor.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.auto_awesome, color: Colors.white, size: 20),
                          SizedBox(width: 10),
                          Text('Épargne intelligente', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Switch(
                        value: _isSmartSavingsEnabled,
                        activeColor: const Color(0xFF10B981),
                        onChanged: (val) => setState(() => _isSmartSavingsEnabled = val),
                      ),
                    ],
                  ),
                  if (_isSmartSavingsEnabled) ...[
                    const SizedBox(height: 12),
                    const Text(
                      'Selon vos habitudes, épargnez 7 500 XAF chaque semaine pour atteindre vos objectifs plus rapidement.',
                      style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                    ),
                  ]
                ],
              ),
            ),
            const SizedBox(height: 32),

            // 🏆 Section Mes Objectifs En Cours
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Mes objectifs', style: TextStyle(color: context.textColor, fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton.icon(
                  onPressed: _naviguerVersCreation,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Créer', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            _buildDynamicGoalList(isCompletedList: false),

            const SizedBox(height: 24),
            
            // 🏅 Section Objectifs Atteints
            Text('Objectifs atteints', style: TextStyle(color: context.textColor, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            
            _buildDynamicGoalList(isCompletedList: true),
          ],
        ),
      ),
    );
  }

  // Boucle de traitement et filtrage avec auto-destruction intégrée
  Widget _buildDynamicGoalList({required bool isCompletedList}) {
    List<Widget> listItems = [];
    final DateTime limiteAutoDestruction = DateTime.now().subtract(const Duration(days: 30));

    for (int i = 0; i < _objectifs.length; i++) {
      final obj = _objectifs[i];
      
      // Un objectif est complété s'il a atteint la cible OU s'il a été retiré
      bool isDone = (obj['current'] >= obj['target']) || (obj['isWithdrawn'] == true);
      
      // ⏱️ LOGIQUE D'AUTO-DESTRUCTION : Effacement automatique après 1 mois
      if (isDone && obj['completionDate'] != null) {
        if ((obj['completionDate'] as DateTime).isBefore(limiteAutoDestruction)) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            setState(() {
              _objectifs.removeAt(i);
            });
          });
          continue; // Saute l'élément pour éviter de l'afficher
        }
      }

      // Dispatching dans la bonne liste graphique
      if (isCompletedList == isDone) {
        listItems.add(
          _buildGoalCard(
            title: obj['title'],
            target: "${obj['target'].toInt()} FCFA",
            current: "${obj['current'].toInt()} FCFA",
            // Si retiré, on force visuellement la barre de progression à 100% (1.0)
            progress: obj['isWithdrawn'] ? 1.0 : (obj['current'] / obj['target']).clamp(0.0, 1.0),
            emoji: obj['emoji'],
            isStrict: obj['isStrict'],
            isCompleted: isDone,
            onTap: () => _ouvrirDetailObjectif(i, obj),
          ),
        );
      }
    }

    if (listItems.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Text(
          isCompletedList ? "Aucun objectif atteint pour le moment" : "Aucun objectif en cours",
          style: TextStyle(color: context.secondaryTextColor, fontSize: 14, fontStyle: FontStyle.italic),
        ),
      );
    }

    return Column(children: listItems);
  }

  Widget _buildGoalCard({
    required String title, 
    required String target, 
    required String current, 
    required double progress, 
    required String emoji, 
    required bool isStrict,
    required bool isCompleted,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isCompleted ? const Color(0xFF10B981).withOpacity(0.4) : context.borderColor),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: isCompleted ? const Color(0xFF10B981).withOpacity(0.1) : const Color(0xFF4E4AF2).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      isCompleted ? "🎉" : emoji, 
                      style: const TextStyle(fontSize: 24)
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: context.textColor)),
                          if (isStrict) ...[
                            const SizedBox(width: 6),
                            Icon(Icons.lock_outline, size: 14, color: context.secondaryTextColor),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        isCompleted ? 'Objectif atteint ou clôturé avec succès !' : '$current / $target', 
                        style: TextStyle(color: context.secondaryTextColor, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                Text(
                  '${(progress * 100).toInt()}%', 
                  style: TextStyle(
                    fontWeight: FontWeight.bold, 
                    color: isCompleted ? const Color(0xFF10B981) : const Color(0xFF4E4AF2)
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: context.borderColor,
              color: isCompleted ? const Color(0xFF10B981) : const Color(0xFF4E4AF2),
              borderRadius: BorderRadius.circular(10),
              minHeight: 7,
            ),
          ],
        ),
      ),
    );
  }
}