const { verifyToken } = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }

    req.user = decoded; // Adiciona o payload decodificado (ex: { id: 1, username: 'admin' }) à requisição
    next(); // Continua para a próxima função middleware/rota
};

// Opcional: Middleware para verificar se o usuário tem uma função específica (ex: 'angel', 'admin')
const authorizeRole = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para esta ação.' });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRole
};