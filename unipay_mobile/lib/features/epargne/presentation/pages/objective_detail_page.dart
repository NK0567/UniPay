import 'package:flutter/material.dart';
import '../../../../app/theme_extensions.dart';
import '../../../retrait/presentation/pages/withdraw_method_page.dart';

class ObjectiveDetailPage extends StatefulWidget {
  final String title;
  final bool isStrict;
  final double initialCurrentAmount;
  final double initialTargetAmount;

  const ObjectiveDetailPage({
    super.key, 
    required this.title, 
    required this.isStrict,
    required this.initialCurrentAmount,
    required this.initialTargetAmount,
  });

  @override
  State<ObjectiveDetailPage> createState() => _ObjectiveDetailPageState();
}

class _ObjectiveDetailPageState extends State<ObjectiveDetailPage> {
  late double _montantCible;
  late double _montantEpargne;
  double _soldePortefeuille = 750000.0;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _montantCible = widget.initialTargetAmount;
    _montantEpargne = widget.initialCurrentAmount;
  }

  double get _progression {
    if (_montantCible <= 0) return 0.0;
    double calcul = _montantEpargne / _montantCible;
    return calcul > 1.0 ? 1.0 : calcul;
  }

  // 🔄 Quitte l'écran en transmettant l'état d'épargne basique
  void _retournerEtMettreAJour() {
    Navigator.pop(context, {
      'updatedCurrent': _montantEpargne,
      'isWithdrawn': false,
    });
  }

  // 🏁 Action finale de validation du processus de retrait
  void _confirmerRetrait() {
    Navigator.pop(context, {
      'updatedCurrent': _montantEpargne,
      'isWithdrawn': true, // Déclenche le passage direct à 100% et le tri ciblé
      'completionDate': DateTime.now(), // Initialise la date de début des 30 jours
    });
  }

  void _navigateToWithdraw(BuildContext context, {required String amount}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => WithdrawMethodPage(initialAmount: amount),
      ),
    ).then((_) {
      // Une fois le parcours de l'écran externe terminé, on valide la clôture
      _confirmerRetrait();
    });
  }

  Future<void> _simulerAjoutArgent(double montantAAjouter) async {
    setState(() => _isLoading = true);

    try {
      await Future.delayed(const Duration(milliseconds: 1500));

      if (montantAAjouter > _soldePortefeuille) {
        throw Exception("Solde du portefeuille insuffisant");
      }

      setState(() {
        _montantEpargne += montantAAjouter; 
        _soldePortefeuille -= montantAAjouter; 
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🎉 Épargne mise à jour ! +${montantAAjouter.toInt()} FCFA'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('⚠️ Erreur : ${e.toString().replaceAll("Exception: ", "")}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showAddMoneyBottomSheet(BuildContext context) {
    final TextEditingController amountController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true, 
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (bottomSheetContext) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(bottomSheetContext).viewInsets.bottom + 24, 
          top: 24,
          left: 24,
          right: 24,
        ),
        child: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Ajouter à l\'objectif', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: context.textColor)),
              const SizedBox(height: 4),
              Text(
                'Solde disponible : ${_soldePortefeuille.toInt()} FCFA',
                style: TextStyle(color: context.secondaryTextColor, fontSize: 13),
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: amountController,
                keyboardType: TextInputType.number,
                autofocus: true,
                style: TextStyle(color: context.textColor, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  hintText: 'Ex: 50 000',
                  hintStyle: TextStyle(color: context.secondaryTextColor.withOpacity(0.5)),
                  suffixText: 'FCFA',
                  filled: true,
                  fillColor: context.surfaceColor,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Veuillez entrer un montant';
                  final double? mnt = double.tryParse(val.trim());
                  if (mnt == null || mnt <= 0) return 'Montant invalide';
                  if (mnt > _soldePortefeuille) return 'Solde insuffisant dans le portefeuille';
                  return null;
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  if (formKey.currentState!.validate()) {
                    final double montant = double.parse(amountController.text.trim());
                    Navigator.pop(bottomSheetContext); 
                    _simulerAjoutArgent(montant); 
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: context.primaryColor,
                  minimumSize: const Size(double.infinity, 54),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Confirmer le dépôt', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    String stringMontantEpargne = "${_montantEpargne.toInt()} FCFA";

    return PopScope(
      canPop: false, 
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _retournerEtMettreAJour();
      },
      child: Scaffold(
        backgroundColor: context.bgColor,
        appBar: AppBar(
          title: Text(widget.title, style: TextStyle(color: context.textColor, fontWeight: FontWeight.bold)),
          backgroundColor: context.bgColor,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back_ios_new, color: context.textColor, size: 20),
            onPressed: _retournerEtMettreAJour,
          ),
        ),
        body: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  Container(
                    height: 180,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [context.primaryColor.withOpacity(0.06), context.primaryColor.withOpacity(0.15)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: context.borderColor),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.account_balance_wallet_rounded, size: 56, color: context.primaryColor),
                        const SizedBox(height: 12),
                        const Text(
                          "UniPay Savings", 
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, letterSpacing: 0.5)
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "Coffre-fort d'épargne sécurisé", 
                          style: TextStyle(color: context.secondaryTextColor, fontSize: 12)
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  _buildStatRow(context, "Montant cible", "${_montantCible.toInt()} FCFA"),
                  const Divider(height: 32),
                  _buildStatRow(context, "Montant épargné", stringMontantEpargne),
                  const Divider(height: 32),
                  _buildStatRow(context, "Progression", "${(_progression * 100).toInt()}%", isPrimary: true),
                  const Spacer(),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _isLoading 
                            ? null 
                            : () {
                                if (widget.isStrict) {
                                  _showStrictWarning(context, stringMontantEpargne);
                                } else {
                                  _navigateToWithdraw(context, amount: stringMontantEpargne);
                                }
                              },
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(0, 56),
                            side: BorderSide(color: widget.isStrict ? Colors.red : const Color(0xFFCBD5E1)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Text(
                            widget.isStrict ? 'Casser (Strict)' : 'Retirer', 
                            style: TextStyle(color: widget.isStrict ? Colors.red : context.textColor, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : () => _showAddMoneyBottomSheet(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: context.primaryColor,
                            minimumSize: const Size(0, 56),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Ajouter de l\'argent', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (_isLoading)
              Container(
                color: Colors.black.withOpacity(0.15),
                child: const Center(
                  child: CircularProgressIndicator(color: Color(0xFF4E4AF2)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _showStrictWarning(BuildContext context, String amount) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (bottomSheetContext) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 48),
            const SizedBox(height: 16),
            const Text('Épargne Stricte', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text(
              'Cet objectif est verrouillé. Un retrait anticipé entraînera des frais de 5%.',
              textAlign: TextAlign.center,
              style: TextStyle(color: context.secondaryTextColor),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(bottomSheetContext);
                _navigateToWithdraw(context, amount: amount);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red, 
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Confirmer le retrait prématuré', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatRow(BuildContext context, String label, String value, {bool isPrimary = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: context.secondaryTextColor)),
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: isPrimary ? const Color(0xFF4E4AF2) : context.textColor)),
      ],
    );
  }
}