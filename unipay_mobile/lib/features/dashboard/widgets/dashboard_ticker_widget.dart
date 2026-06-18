import 'dart:async';
import 'package:flutter/material.dart';
import '../services/ticker_service.dart';
import '../models/ticker_model.dart';

class DashboardTickerWidget extends StatefulWidget {
  final String utilisateurId;

  const DashboardTickerWidget({super.key, required this.utilisateurId});

  @override
  State<DashboardTickerWidget> createState() => _DashboardTickerWidgetState();
}

class _DashboardTickerWidgetState extends State<DashboardTickerWidget> {
  final TickerApiService _apiService = TickerApiService();
  
  TickerResponse? _tickerData;
  bool _isLoading = true;
  bool _hasError = false;

  Timer? _timer;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadTickerData();
  }

  void _loadTickerData() async {
    try {
      debugPrint("🔄 UniPay Ticker : Début du chargement des taux...");
      final data = await _apiService.fetchTickerConversions(widget.utilisateurId);
      
      if (!mounted) return;

      setState(() {
        _tickerData = data;
        _isLoading = false; // ✅ Arrête le chargement en cas de succès
      });
      
      if (data.listeConversions.isNotEmpty) {
        _startRotation();
      } else {
        debugPrint("⚠️ UniPay Ticker : La liste des conversions est vide.");
      }
    } catch (e) {
      debugPrint("❌ Erreur critique Ticker UniPay : $e");
      if (mounted) {
        setState(() {
          _isLoading = false; // ✅ FORCE l'arrêt du chargement même s'il y a un bug !
          _hasError = true;
        });
      }
    }
  }

  void _startRotation() {
    _timer?.cancel(); // Sécurité : on annule l'ancien timer s'il existait
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted && _tickerData != null && _tickerData!.listeConversions.isNotEmpty) {
        setState(() {
          _currentIndex = (_currentIndex + 1) % _tickerData!.listeConversions.length;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Si ça charge, on affiche un indicateur très discret sans bloquer l'interface
    if (_isLoading) {
      return const SizedBox(
        height: 16,
        width: 16,
        child: CircularProgressIndicator(
          strokeWidth: 2, 
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4E4AF2)),
        ),
      );
    }

    // Si erreur ou pas de données, on cache complètement le widget pour ne pas gâcher l'UI
    if (_hasError || _tickerData == null || _tickerData!.listeConversions.isEmpty) {
      return const SizedBox.shrink(); 
    }

    final conversionActive = _tickerData!.listeConversions[_currentIndex];
    final deviseLocale = _tickerData!.deviseLocale;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFEEEDFD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF4E4AF2).withOpacity(0.15)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.trending_up_rounded, size: 12, color: Color(0xFF4E4AF2)),
          const SizedBox(width: 4),
          Text(
            "1 $deviseLocale = ",
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Color(0xFF4E4AF2),
            ),
          ),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 400),
            transitionBuilder: (Widget child, Animation<double> animation) {
              return FadeTransition(
                opacity: animation,
                child: SlideTransition(
                  position: Tween<Offset>(
                    begin: const Offset(0.0, 0.2),
                    end: Offset.zero,
                  ).animate(animation),
                  child: child,
                ),
              );
            },
            child: Text(
              "${conversionActive.valeurConvertie.toStringAsFixed(4)} ${conversionActive.deviseCible}",
              key: ValueKey<int>(_currentIndex), 
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: Color(0xFF4E4AF2),
              ),
            ),
          ),
        ],
      ),
    );
  }
}