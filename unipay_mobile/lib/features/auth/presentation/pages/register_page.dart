import 'package:flutter/material.dart';
import 'login_page.dart';
import 'otp_page.dart'; // 1. Importation de la page OTP ajoutée ici

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  
  // Contrôleurs pour récupérer les saisies
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  
  bool _isPasswordObscured = true;

  void _submitRegister() {
    if (_formKey.currentState!.validate()) {
      // 🧠 Extraction et séparation du Nom et Prénom
      String fullName = _fullNameController.text.trim();
      List<String> nameParts = fullName.split(' ');
      
      String prenom = nameParts.first;
      // Si l'utilisateur a plusieurs prénoms/noms, on rassemble le reste pour le champ "nom"
      String nom = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

      // 📦 Voici le payload JSON exact prêt pour ton API Node.js
      final registerPayload = {
        "nom": nom.isNotEmpty ? nom : prenom, // Fallback si un seul nom est saisi
        "prenom": prenom,
        "telephone": _phoneController.text.trim(),
        "email": _emailController.text.trim(),
        "motDePasse": _passwordController.text
      };

      // TODO: Appeler ton AuthRepository / Dio Client ici
      debugPrint("Payload envoyé à l'API : $registerPayload");
      
      // 2. Redirection fluide vers l'écran de code OTP
      if (mounted) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => OtpPage(
              phoneNumber: _phoneController.text.trim(),
            ),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    // Libération des contrôleurs pour éviter les fuites de mémoire
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                const Text(
                  'Créer un compte',
                  style: TextStyle(color: Color(0xFF1E293B), fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 32),
                
                // 👤 Champ Nom Complet
                _buildFieldLabel('Nom complet'),
                TextFormField(
                  controller: _fullNameController,
                  style: const TextStyle(color: Colors.black),
                  decoration: _inputDecoration('Entrez votre nom'),
                  validator: (value) => value == null || value.isEmpty ? 'Veuillez entrer votre nom' : null,
                ),
                const SizedBox(height: 20),

                // 📧 Champ Email
                _buildFieldLabel('Email'),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: Colors.black),
                  decoration: _inputDecoration('Entrez votre email'),
                  validator: (value) => value == null || !value.contains('@') ? 'Email invalide' : null,
                ),
                const SizedBox(height: 20),

                // 📞 Champ Téléphone
                _buildFieldLabel('Téléphone'),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: Colors.black),
                  decoration: _inputDecoration('+237 6 00 00 00 00'),
                  validator: (value) => value == null || value.isEmpty ? 'Numéro de téléphone requis' : null,
                ),
                const SizedBox(height: 20),

                // 🔒 Champ Mot de passe
                _buildFieldLabel('Mot de passe'),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _isPasswordObscured,
                  style: const TextStyle(color: Colors.black),
                  decoration: _inputDecoration('••••••••').copyWith(
                    suffixIcon: IconButton(
                      icon: Icon(_isPasswordObscured ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: Colors.grey),
                      onPressed: () => setState(() => _isPasswordObscured = !_isPasswordObscured),
                    ),
                  ),
                  validator: (value) => value == null || value.length < 6 ? 'Minimum 6 caractères' : null,
                ),
                const SizedBox(height: 40),

                // 🚀 Bouton S'inscrire
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _submitRegister,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4E4AF2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: const Text('Créer un compte', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 24),

                // Link vers Connexion
                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => const LoginPage())),
                    child: RichText(
                      text: const TextSpan(
                        text: 'Déjà un compte ? ',
                        style: TextStyle(color: Color(0xFF64748B)),
                        children: [
                          TextSpan(text: 'Se connecter', style: TextStyle(color: Color(0xFF4E4AF2), fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(label, style: const TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.w600, fontSize: 14)),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
      filled: true,
      fillColor: const Color(0xFFF8F9FD),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF4E4AF2), width: 1.5)),
    );
  }
}