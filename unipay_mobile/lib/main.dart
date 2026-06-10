import 'package:flutter/material.dart';
import 'app/theme.dart';
import 'features/splash/presentation/pages/splash_page.dart';
// import 'features/dashboard/presentation/pages/main_shell_page.dart';

void main() {
  runApp(const UniPayApp());
}

class UniPayApp extends StatelessWidget {
  const UniPayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UniPay',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const SplashPage(),
      // home: const MainShellPage(),
    );
  }
}