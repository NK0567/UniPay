const prisma = require('../../../database/prisma');

class TauxChangeRpository{
    async upsertRate(from, to, rate){
        return prisma.tauxchange.upsert({
            where: {
                deviseSource_deviseCible: {
                    deviseSource: from,
                    deviseCible: to
                }
            },
            update: {
                taux: rate,
            },
            create: {
                deviseSource: from,
                deviseCible: to,
                taux: rate
            }
        });
    }

    async getRate(from, to){
        return await prisma.TauxChange.findUnique({

            where: {
                deviseSource_deviseCible: {
                    deviseSource: from,
                    deviseCible: to
                }
            }
        });
    }
}

module.exports = new TauxChangeRpository();