//  Configuration JWT

// Contient :
/*
    * expiration token
    * secret
    * refresh token
*/
const { JWT_SECRET } = require('./.env');

module.exports = {
    secret: JWT_SECRET
};