const jwt = require('jsonwebtoken');

// Sua chave secreta JWT (MUITO IMPORTANTE: Use uma chave forte e armazene em variáveis de ambiente!)
// Para este exemplo, estou colocando aqui, mas em produção, use process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'sua_super_secreta_chave_jwt_muito_segura'; // Mude esta chave!

const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null; // Token inválido ou expirado
    }
};

module.exports = {
    generateToken,
    verifyToken
};