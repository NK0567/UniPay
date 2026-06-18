import 'package:flutter/material.dart';

class UniPayLogo extends StatelessWidget {
  final double size;
  final Color? color;

  const UniPayLogo({
    super.key, 
    this.size = 24.0, // Taille par défaut
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    // OPTION A : Si ton logo est une image PNG / JPG
    return Image.asset(
      'assets/images/logo_unipay.png',
      width: size,
      height: size,
      color: color, // Optionnel : pour forcer une couleur (ex: tout en blanc)
    );

    /* // OPTION B : Si ton logo est un SVG (nécessite le package flutter_svg)
    import 'package:flutter_svg/flutter_svg.dart';
    return SvgPicture.asset(
      'assets/images/logo_unipay.svg',
      width: size,
      height: size,
      colorFilter: color != null ? ColorFilter.mode(color!, BlendMode.srcIn) : null,
    );
    */

    /*
    // OPTION C : Si ton logo est une Icône personnalisée de type Font / Custom Icons
    return Icon(
      Icons.account_balance_wallet, // Remplace par ton icône custom si besoin
      size: size,
      color: color ?? const Color(0xFF3B36DB),
    );
    */
  }
}