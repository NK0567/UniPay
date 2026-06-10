import 'dart:async';
import 'package:flutter/material.dart';
import 'kyc_page.dart';

class OtpPage extends StatefulWidget {
  final String phoneNumber; // Pour afficher dynamiquement le numéro saisi à l'inscription
  const OtpPage({super.key, this.phoneNumber = "+237 6 73 78 09 41"});

  @override
  State<OtpPage> createState() => _OtpPageState();
}

class _OtpPageState extends State<OtpPage> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  
  int _secondsRemaining = 45;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_secondsRemaining > 0) {
          _secondsRemaining--;
        } else {
          _timer?.cancel();
        }
      });
    });
  }

  void _verifyOtp() {
    String otpCode = _controllers.map((c) => c.text).join();
    
    if (otpCode.length == 6) {
      // TODO: Plus tard, appeler l'API Node.js ici: router.post('/verify-otp')
      debugPrint("Code OTP saisi à envoyer à l'API : $otpCode");

      // Transition logique vers l'écran KYC
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const KycPage()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez entrer les 6 chiffres'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Vérification',
                style: TextStyle(color: Color(0xFF1E293B), fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              RichText(
                text: TextSpan(
                  text: 'Nous avons envoyé un code au ',
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 15, height: 1.4),
                  children: [
                    TextSpan(
                      text: widget.phoneNumber,
                      style: const TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              const Text(
                'Entrez le code reçu',
                style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.w600, fontSize: 14),
              ),
              const SizedBox(height: 16),

              // 🔢 Les 6 cases d'entrée de l'OTP
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (index) => _buildOtpBox(index)),
              ),
              const SizedBox(height: 24),

              // ⏱️ Compte à rebours du renvoi
              Center(
                child: Text(
                  _secondsRemaining > 0
                      ? 'Renvoyer le code dans  00:${_secondsRemaining.toString().padLeft(2, '0')}'
                      : 'Renvoyer le code',
                  style: TextStyle(
                    color: _secondsRemaining > 0 ? const Color(0xFF64748B) : const Color(0xFF4E4AF2),
                    fontWeight: _secondsRemaining > 0 ? FontWeight.normal : FontWeight.bold,
                  ),
                ),
              ),
              
              const Spacer(),

              // 🚀 Bouton Vérifier
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _verifyOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4E4AF2),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: const Text('Vérifier', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOtpBox(int index) {
    return SizedBox(
      width: 48,
      height: 56,
      child: TextFormField(
        controller: _controllers[index],
        focusNode: _focusNodes[index],
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold),
        maxLength: 1,
        decoration: InputDecoration(
          counterText: "",
          filled: true,
          fillColor: const Color(0xFFF8F9FD),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFF4E4AF2), width: 1.5),
          ),
        ),
        onChanged: (value) {
          if (value.isNotEmpty && index < 5) {
            _focusNodes[index + 1].requestFocus();
          }
          if (value.isEmpty && index > 0) {
            _focusNodes[index - 1].requestFocus();
          }
        },
      ),
    );
  }
}