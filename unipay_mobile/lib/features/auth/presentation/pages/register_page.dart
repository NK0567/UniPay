import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import 'login_page.dart';
import 'otp_page.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  
  bool _isPasswordObscured = true;

  void _submitRegister() {
    if (_formKey.currentState!.validate()) {
      String fullName = _fullNameController.text.trim();
      List<String> nameParts = fullName.split(' ');
      
      String prenom = nameParts.first;
      String nom = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

      // Payload prêt pour ton API Node.js plus tard
      final registerPayload = {
        "nom": nom.isNotEmpty ? nom : prenom,
        "prenom": prenom,
        "telephone": _phoneController.text.trim(),
        "email": _emailController.text.trim(),
        "motDePasse": _passwordController.text
      };

      debugPrint("[OFFLINE TEST] Payload Inscription : $registerPayload");
      
      // Passe à l'étape OTP sans bloquer
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
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                Text(
                  'Créer un compte',
                  style: TextStyle(color: context.textColor, fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 32),
                
                _buildFieldLabel(context, 'Nom complet'),
                TextFormField(
                  controller: _fullNameController,
                  style: TextStyle(color: context.textColor),
                  decoration: _inputDecoration(context, 'Entrez votre nom'),
                  validator: (value) => value == null || value.isEmpty ? 'Veuillez entrer votre nom' : null,
                ),
                const SizedBox(height: 20),

                _buildFieldLabel(context, 'Email'),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: TextStyle(color: context.textColor),
                  decoration: _inputDecoration(context, 'Entrez votre email'),
                  validator: (value) => value == null || !value.contains('@') ? 'Email invalide' : null,
                ),
                const SizedBox(height: 20),

                _buildFieldLabel(context, 'Téléphone'),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  style: TextStyle(color: context.textColor),
                  decoration: _inputDecoration(context, '+237 6 00 00 00 00'),
                  validator: (value) => value == null || value.isEmpty ? 'Numéro de téléphone requis' : null,
                ),
                const SizedBox(height: 20),

                _buildFieldLabel(context, 'Mot de passe'),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _isPasswordObscured,
                  style: TextStyle(color: context.textColor),
                  decoration: _inputDecoration(context, '••••••••').copyWith(
                    suffixIcon: IconButton(
                      icon: Icon(_isPasswordObscured ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: context.secondaryTextColor),
                      onPressed: () => setState(() => _isPasswordObscured = !_isPasswordObscured),
                    ),
                  ),
                  validator: (value) => value == null || value.length < 6 ? 'Minimum 6 caractères' : null,
                ),
                const SizedBox(height: 40),

                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _submitRegister,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: context.primaryColor,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: Text('Créer un compte', style: TextStyle(color: context.bgColor, fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 24),

                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => const LoginPage())),
                    child: RichText(
                      text: TextSpan(
                        text: 'Déjà un compte ? ',
                        style: TextStyle(color: context.secondaryTextColor),
                        children: [
                          TextSpan(text: 'Se connecter', style: TextStyle(color: context.primaryColor, fontWeight: FontWeight.bold)),
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

  Widget _buildFieldLabel(BuildContext context, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(label, style: TextStyle(color: context.textColor, fontWeight: FontWeight.w600, fontSize: 14)),
    );
  }

  InputDecoration _inputDecoration(BuildContext context, String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: context.secondaryTextColor.withOpacity(0.7)),
      filled: true,
      fillColor: context.surfaceColor,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.primaryColor, width: 1.5)),
    );
  }
}