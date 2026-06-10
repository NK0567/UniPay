import 'package:flutter/material.dart';
import 'register_page.dart';
import '../../../dashboard/presentation/pages/main_shell_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordObscured = true;

  void _submitLogin() {
    if (_formKey.currentState!.validate()) {
      // Redirection vers le tableau de bord principal après connexion réussie
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const MainShellPage()),
      );
    }
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
                const SizedBox(height: 40),
                const Text(
                  'Se connecter',
                  style: TextStyle(color: Color(0xFF1E293B), fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 40),

                // 📧 Champ Identifiant
                _buildFieldLabel('Email ou téléphone'),
                TextFormField(
                  controller: _identifierController,
                  style: const TextStyle(color: Colors.black),
                  decoration: _inputDecoration('Entrez votre email ou téléphone'),
                  validator: (value) => value == null || value.isEmpty ? 'Ce champ est requis' : null,
                ),
                const SizedBox(height: 20),

                // 🔒 Champ Mot de passe
                _buildFieldLabel('Mot de passe'),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _isPasswordObscured,
                  style: const TextStyle(color: Colors.black),
                  decoration: _inputDecoration('Entrez votre mot de passe').copyWith(
                    suffixIcon: IconButton(
                      icon: Icon(_isPasswordObscured ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: Colors.grey),
                      onPressed: () => setState(() => _isPasswordObscured = !_isPasswordObscured),
                    ),
                  ),
                  validator: (value) => value == null || value.isEmpty ? 'Mot de passe requis' : null,
                ),
                
                // 🔄 Mot de passe oublié
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {},
                    child: const Text('Mot de passe oublié ?', style: TextStyle(color: Color(0xFF4E4AF2), fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(height: 32),

                // 🚀 Bouton Se connecter
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _submitLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4E4AF2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: const Text('Se connecter', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 32),

                // Link vers Inscription
                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => const RegisterPage())),
                    child: RichText(
                      text: const TextSpan(
                        text: 'Pas encore de compte ? ',
                        style: TextStyle(color: Color(0xFF64748B)),
                        children: [
                          TextSpan(text: 'S\'inscrire', style: TextStyle(color: Color(0xFF4E4AF2), fontWeight: FontWeight.bold)),
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