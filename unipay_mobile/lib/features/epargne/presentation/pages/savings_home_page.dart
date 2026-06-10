import 'package:flutter/material.dart';
import 'create_objective_page.dart';
import 'objective_detail_page.dart';

class SavingsHomePage extends StatefulWidget {
  const SavingsHomePage({super.key});

  @override
  State<SavingsHomePage> createState() => _SavingsHomePageState();
}

class _SavingsHomePageState extends State<SavingsHomePage> {
  bool _isSmartSavingsEnabled = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Épargne', style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
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
                boxShadow: [BoxShadow(color: const Color(0xFF4E4AF2).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
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

            // 🏆 Section Mes Objectifs
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Mes objectifs', style: TextStyle(color: Color(0xFF1E293B), fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton.icon(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CreateObjectivePage())),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Créer', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Liste d'objectifs simulés
            _buildGoalCard(
              title: "Moto Honda",
              target: "2 000 000 XAF",
              current: "1 480 000 XAF",
              progress: 0.74,
              emoji: "🏍️",
              isStrict: true,
            ),
            _buildGoalCard(
              title: "Ordinateur portable",
              target: "1 200 000 XAF",
              current: "540 000 XAF",
              progress: 0.45,
              emoji: "💻",
              isStrict: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGoalCard({required String title, required String target, required String current, required double progress, required String emoji, required bool isStrict}) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => ObjectiveDetailPage(title: title, isStrict: isStrict))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFF8F9FD),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Text(emoji, style: const TextStyle(fontSize: 32)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          if (isStrict) const Icon(Icons.lock_outline, size: 14, color: Color(0xFF64748B)),
                        ],
                      ),
                      Text('$current / $target', style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                    ],
                  ),
                ),
                Text('${(progress * 100).toInt()}%', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4E4AF2))),
              ],
            ),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: const Color(0xFFE2E8F0),
              color: const Color(0xFF4E4AF2),
              borderRadius: BorderRadius.circular(10),
              minHeight: 8,
            ),
          ],
        ),
      ),
    );
  }
}