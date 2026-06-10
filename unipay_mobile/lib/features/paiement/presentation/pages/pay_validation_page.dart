import 'package:flutter/material.dart';

class PayValidationPage extends StatefulWidget {
  final String totalUSD;
  final String amountXAF;

  const PayValidationPage({
    super.key,
    required this.totalUSD,
    required this.amountXAF,
  });

  @override
  State<PayValidationPage> createState() => _PayValidationPageState();
}

class _CloseButton extends StatelessWidget {
  const _CloseButton();

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.close, color: Color(0xFF1E293B)),
      onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
    );
  }
}

class _PayValidationPageState extends State<PayValidationPage> {
  String _pinCode = '';
  final int _pinLength = 6; // Code PIN à 6 chiffres pour UniPay
  List<int> _shuffledNumbers = [];

  @override
  void initState() {
    super.initState();
    _generateRotatedKeyboard();
  }

  // 🎲 Mélange aléatoire du pavé numérique (Logique de sécurité UniPay)
  void _generateRotatedKeyboard() {
    final List<int> baseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    baseNumbers.shuffle(); // Rotation aléatoire complète
    setState(() {
      _shuffledNumbers = baseNumbers;
    });
  }

  void _onKeyPress(int number) {
    if (_pinCode.length < _pinLength) {
      setState(() {
        _pinCode += number.toString();
      });

      // 🚀 Dès que le code PIN est complet, on déclenche la validation
      if (_pinCode.length == _pinLength) {
        _verifyAndProcessPayment();
      }
    }
  }

  void _onDeletePress() {
    if (_pinCode.isNotEmpty) {
      setState(() {
        _pinCode = _pinCode.substring(0, _pinCode.length - 1);
      });
    }
  }

  void _verifyAndProcessPayment() {
    // Simulation d'un traitement de paiement
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: Color(0xFF4E4AF2)),
      ),
    );

    Future.delayed(const Duration(seconds: 2), () {
      Navigator.pop(context); // Ferme le loader
      
      // Ici, tu rediriges vers l'écran de succès final (Écran 13)
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Paiement de ${widget.amountXAF} FCFA validé avec succès !'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
      Navigator.of(context).popUntil((route) => route.isFirst);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: const [_CloseButton()],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    // 🛡️ En-tête sécurisé
                    Container(
                      height: 64,
                      width: 64,
                      decoration: const BoxDecoration(color: Color(0xFFEEEDFD), shape: BoxShape.circle),
                      child: const Icon(Icons.lock_outline_rounded, color: Color(0xFF4E4AF2), size: 30),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Validez le paiement',
                      style: TextStyle(color: Color(0xFF1E293B), fontSize: 22, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Entrez votre code PIN secret UniPay pour confirmer le débit de ${widget.totalUSD} USD.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 14, height: 1.4),
                    ),
                    const SizedBox(height: 40),

                    // 🔒 Indicateurs visuels du Code PIN (Ronds masqués)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_pinLength, (index) {
                        bool isFilled = index < _pinCode.length;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          margin: const EdgeInsets.symmetric(horizontal: 10),
                          height: 16,
                          width: 16,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isFilled ? const Color(0xFF4E4AF2) : const Color(0xFFF1F5F9),
                            border: Border.all(
                              color: isFilled ? const Color(0xFF4E4AF2) : const Color(0xFFCBD5E1),
                              width: 1.5,
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 30),
                    
                    TextButton(
                      onPressed: () {
                        // Action mot de passe oublié
                      },
                      child: const Text(
                        'Code PIN oublié ?',
                        style: TextStyle(color: Color(0xFF4E4AF2), fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 🎛️ Pavé numérique rotatif dynamique (Bas de page fixe)
            Container(
              color: const Color(0xFFF8F9FD),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                children: [
                  // Lignes 1 à 3 du pavé dynamique
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 24,
                      childAspectRatio: 1.4,
                    ),
                    itemCount: 9,
                    itemBuilder: (context, index) {
                      int number = _shuffledNumbers[index];
                      return _buildKeyboardButton(
                        label: number.toString(),
                        onTap: () => _onKeyPress(number),
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  // Dernière ligne : Bouton vide, le 10ème chiffre aléatoire, et la touche retour
                  Row(
                    children: [
                      const Expanded(child: SizedBox.shrink()),
                      const SizedBox(width: 24),
                      Expanded(
                        child: _buildKeyboardButton(
                          label: _shuffledNumbers[9].toString(),
                          onTap: () => _onKeyPress(_shuffledNumbers[9]),
                        ),
                      ),
                      const SizedBox(width: 24),
                      Expanded(
                        child: InkWell(
                          onTap: _onDeletePress,
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: const Icon(Icons.backspace_outlined, color: Color(0xFF1E293B), size: 22),
                          ),
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
    );
  }

  Widget _buildKeyboardButton({required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0F172A).withOpacity(0.03),
              spreadRadius: 1,
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}