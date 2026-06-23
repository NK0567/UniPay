const express = require('express');
const router = express.Router();
const prisma = require('../../../database/prisma'); // Ajuste le chemin selon ton projet
const currencyHelper = require('../../../helpers/currency.helper'); // 👈 Importe ton CurrencyHelper

// 🆕 NOUVEAU : GET /api/v1/admin/agregateurs/pays-supportees
// Retourne la liste dynamique des pays pour alimenter les menus déroulants du Front
router.get('/pays-supportees', (req, res) => {
  try {
    const paysSupportes = Object.entries(currencyHelper.cartographiePays).map(([nom, config]) => ({
      code: config.code,
      nom: nom.charAt(0).toUpperCase() + nom.slice(1)
    })).sort((a, b) => a.nom.localeCompare(b.nom));

    return res.status(200).json({ success: true, data: paysSupportes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 1. GET /api/v1/admin/agregateurs -> Récupérer toutes les passerelles enregistrées
router.get('/', async (req, res) => {
  try {
    const list = await prisma.agregateur.findMany({
      orderBy: { nom: 'asc' }
    });
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST /api/v1/admin/agregateurs -> Ajouter une nouvelle passerelle
router.post('/', async (req, res) => {
  try {
    const { nom, type, pays, commissionPct, fraisFixes, operationType } = req.body;

    const nouvelAgregateur = await prisma.agregateur.create({
      data: {
        nom,
        type,
        pays: pays.toUpperCase(),
        commissionPct: parseFloat(commissionPct),
        fraisFixes: parseFloat(fraisFixes),
        operationType,
        statut: 'TEST' // Règle métier stricte : toujours injecter en mode Sandbox d'abord
      }
    });

    return res.status(201).json({ success: true, data: nouvelAgregateur });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. PATCH /api/v1/admin/agregateurs/:id/statut -> Modifier le statut d'une passerelle
router.patch('/:id/statut', async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body; // 'ACTIF', 'TEST', ou 'SUSPENDU'

    const misAJour = await prisma.agregateur.update({
      where: { id: id },
      data: { statut }
    });

    return res.status(200).json({ success: true, data: misAJour });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;