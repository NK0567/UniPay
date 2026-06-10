import 'package:flutter/material.dart';
import 'card_activation_view.dart';
import 'card_dashboard_view.dart';

class VirtualCardScreen extends StatefulWidget {
  const VirtualCardScreen({super.key});

  @override
  State<VirtualCardScreen> createState() => _VirtualCardScreenState();
}

class _VirtualCardScreenState extends State<VirtualCardScreen> {
  // Cet état sera géré par ton State Management (Bloc, Provider) lié au Back-end
  bool _isCardActivated = false;

  // Seuil de la carte (Plafond dynamique) lié directement au portefeuille
  double _spendingLimit = 150000; 

  void _activateCard() {
    setState(() {
      _isCardActivated = true;
    });
  }

  void _updateLimit(double newLimit) {
    setState(() {
      _spendingLimit = newLimit;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Carte Virtuelle',
          style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _isCardActivated
            ? CardDashboardView(
                spendingLimit: _spendingLimit,
                onLimitChanged: _updateLimit,
              )
            : CardActivationView(
                onActivate: _activateCard,
              ),
      ),
    );
  }
}