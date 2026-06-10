import 'package:flutter/material.dart';
import '../../../../app/colors.dart';
import '../../../dashboard/presentation/pages/main_shell_page.dart';

class PinCreationPage extends StatefulWidget {
  const PinCreationPage({super.key});

  @override
  State<PinCreationPage> createState() => _PinCreationPageState();
}

class _PinCreationPageState extends State<PinCreationPage> {
  String _pin = "";
  final int _pinLength = 4; // Code à 4 chiffres (ou 6 selon tes préférences)

  void _onNumberPressed(int number) {
    if (_pin.length < _pinLength) {
      setState(() {
        _pin += number.toString();
      });

      // Si le code est entièrement saisi
      if (_pin.length == _pinLength) {
        _submitPin();
      }
    }
  }

  void _onDeletePressed() {
    if (_pin.isNotEmpty) {
      setState(() {
        _pin = _pin.substring(0, _pin.length - 1);
      });
    }
  }

  void _submitPin() {
    // 📦 C'est ici que tu stockes le code PIN de manière sécurisée et que tu l'envoies à l'API
    debugPrint("Code PIN créé avec succès : $_pin");
    
    // TODO: Sauvegarder dans flutter_secure_storage et envoyer le hash au backend Node.js
    
    // Une fois enregistré, on bascule vers l'application principale
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const MainShellPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 40),
            // Header Text
            const Text(
              'Définir votre code PIN',
              style: TextStyle(color: Color(0xFF1E293B), fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 42.0),
              child: Text(
                'Ce code vous sera demandé pour valider vos transferts, retraits et opérations d\'épargne.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF64748B), fontSize: 14, height: 1.4),
              ),
            ),
            
            const Spacer(),
            
            // ⚪ Les indicateurs visuels du PIN (Les petits ronds)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_pinLength, (index) {
                bool isFilled = index < _pin.length;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  margin: const EdgeInsets.symmetric(horizontal: 12),
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isFilled ? const Color(0xFF4E4AF2) : const Color(0xFFE2E8F0),
                    border: Border.all(
                      color: isFilled ? const Color(0xFF4E4AF2) : const Color(0xFFCBD5E1),
                      width: 1,
                    ),
                  ),
                );
              }),
            ),
            
            const Spacer(),

            // 🎛️ Pavé numérique personnalisé (Fidèle aux exigences Fintech)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [_buildNumberButton(1), _buildNumberButton(2), _buildNumberButton(3)],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [_buildNumberButton(4), _buildNumberButton(5), _buildNumberButton(6)],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [_buildNumberButton(7), _buildNumberButton(8), _buildNumberButton(9)],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const SizedBox(width: 60, height: 60), // Espace vide à gauche du 0
                      _buildNumberButton(0),
                      _buildDeleteButton(),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // Widget pour un bouton numérique
  Widget _buildNumberButton(int number) {
    return InkWell(
      onTap: () => _onNumberPressed(number),
      borderRadius: BorderRadius.circular(30),
      child: Container(
        width: 68,
        height: 68,
        decoration: const BoxDecoration(
          color: Color(0xFFF8F9FD),
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Text(
            number.toString(),
            style: const TextStyle(color: Color(0xFF1E293B), fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }

  // Widget pour le bouton de retour / effacer
  Widget _buildDeleteButton() {
    return InkWell(
      onTap: _onDeletePressed,
      borderRadius: BorderRadius.circular(30),
      child: const SizedBox(
        width: 68,
        height: 68,
        child: Center(
          child: Icon(Icons.backspace_outlined, color: Color(0xFF1E293B), size: 22),
        ),
      ),
    );
  }
}