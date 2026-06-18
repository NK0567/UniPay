import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import '../../../dashboard/presentation/pages/main_shell_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PinCreationPage extends StatefulWidget {
  // 🔄 Ajout d'un mode vérification (par défaut false pour l'inscription)
  final bool isVerificationMode;

  const PinCreationPage({
    super.key, 
    this.isVerificationMode = false,
  });

  @override
  State<PinCreationPage> createState() => _PinCreationPageState();
}

class _PinCreationPageState extends State<PinCreationPage> {
  String _pin = "";
  final int _pinLength = 4;
  bool _isError = false; // Petit effet visuel en cas de mauvais PIN

  void _onNumberPressed(int number) {
    if (_pin.length < _pinLength) {
      setState(() {
        _isError = false;
        _pin += number.toString();
      });

      if (_pin.length == _pinLength) {
        Future.delayed(const Duration(milliseconds: 200), () {
          _submitPin();
        });
      }
    }
  }

  void _onDeletePressed() {
    if (_pin.isNotEmpty) {
      setState(() {
        _isError = false;
        _pin = _pin.substring(0, _pin.length - 1);
      });
    }
  }

  void _submitPin() async {
    final prefs = await SharedPreferences.getInstance();

    if (widget.isVerificationMode) {
      // 🔐 MODE VÉRIFICATION (Appelé depuis le Dashboard)
      final savedPin = prefs.getString('user_pin') ?? "1234"; // "1234" par défaut si test hors-ligne

      if (_pin == savedPin) {
        if (mounted) {
          // ✅ Succès : On renvoie "true" au Dashboard pour dire que le PIN est bon
          Navigator.of(context).pop(true);
        }
      } else {
        // ❌ Échec : Code PIN incorrect
        setState(() {
          _pin = ""; // Reset le PIN saisi
          _isError = true;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Code PIN incorrect. Veuillez réessayer."),
              backgroundColor: Colors.red,
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    } else {
      // 📥 MODE CRÉATION INITIALE (Ton parcours de base)
      await prefs.setBool('is_user_registered', true);
      await prefs.setString('user_pin', _pin);
      debugPrint("[OFFLINE TEST] Code PIN sauvegardé localement : $_pin");
      
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const MainShellPage()),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 40),
            Text(
              widget.isVerificationMode ? 'Saisir votre code PIN' : 'Définir votre code PIN',
              style: TextStyle(color: context.textColor, fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 42.0),
              child: Text(
                widget.isVerificationMode 
                    ? 'Confirmez votre identité UniPay pour afficher votre solde sécurisé.'
                    : 'Ce code vous sera demandé pour valider vos transferts, retraits et opérations d\'épargne.',
                textAlign: TextAlign.center,
                style: TextStyle(color: context.secondaryTextColor, fontSize: 14, height: 1.4),
              ),
            ),
            
            const Spacer(),
            
            // ⚪ Les indicateurs visuels du PIN
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
                    // Devient rouge flash en cas d'erreur
                    color: _isError 
                        ? Colors.red 
                        : (isFilled ?  Color(0xFF4E4AF2) : context.borderColor),
                    border: Border.all(
                      color: _isError 
                          ? Colors.red 
                          : (isFilled ? context.primaryColor : const Color(0xFFCBD5E1)),
                      width: 1,
                    ),
                  ),
                );
              }),
            ),
            
            const Spacer(),

            // 🎛️ Pavé numérique
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
                      // Bouton Retour en arrière disponible uniquement en mode vérification
                      widget.isVerificationMode 
                          ? IconButton(
                              icon: Icon(Icons.arrow_back, color: context.textColor),
                              onPressed: () => Navigator.of(context).pop(),
                            )
                          :  SizedBox(width: 60, height: 60), 
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

  Widget _buildNumberButton(int number) {
    return InkWell(
      onTap: () => _onNumberPressed(number),
      borderRadius: BorderRadius.circular(30),
      child: Container(
        width: 68,
        height: 68,
        decoration: BoxDecoration(
          color: Color(0xFFF8F9FD),
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Text(
            number.toString(),
            style: TextStyle(color: context.textColor, fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }

  Widget _buildDeleteButton() {
    return InkWell(
      onTap: _onDeletePressed,
      borderRadius: BorderRadius.circular(30),
      child: SizedBox(
        width: 68,
        height: 68,
        child: Center(
          child: Icon(Icons.backspace_outlined, color: context.textColor, size: 22),
        ),
      ),
    );
  }
}
