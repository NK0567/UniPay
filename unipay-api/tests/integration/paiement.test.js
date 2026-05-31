const request = require('supertest');
const app = require('../../src/app');

describe('🧪 TEST D\'INTÉGRATION - MODULE TAUX DE CHANGE', () => {
  
  it('✅ GET /api/v1/taux-change/simuler devrait renvoyer une conversion valide', async () => {
    const reponse = await request(app)
      .get('/api/v1/taux-change/simuler')
      .query({
        montant: 100,
        source: 'USD',
        cible: 'XAF'
      });

    expect(reponse.statusCode).toBe(200);
    expect(reponse.body.success).toBe(true);
    expect(reponse.body.data).toHaveProperty('montantConverti');
  });

});