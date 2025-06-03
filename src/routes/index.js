const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Importe o banco de dados, já que você o usa para /associate

const angelController = require('../controllers/angelController');
const visitorController = require('../controllers/visitorController');
const associationController = require('../controllers/associationController'); // Importe o novo controlador de associação
const authController = require('../controllers/authController'); // Importe o novo controlador de autenticação
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Importe os middlewares de autenticação

// --- Rotas de Autenticação (NÃO PROTEGIDAS - para registrar e fazer login) ---
router.post('/register', authController.register); // Rota para registrar novos usuários
router.post('/login', authController.login);       // Rota para fazer login e obter o token JWT

// --- Rotas Protegidas (Exigem um Token JWT Válido no cabeçalho Authorization) ---

// Rotas de Angels
// POST /api/angels - Criar Angel: Apenas Angels e Admins podem criar (com base no role no token)
router.post('/angels', authenticateToken, authorizeRole(['angel', 'admin']), angelController.createAngel);
// GET /api/angels - Listar Angels: Qualquer usuário autenticado pode listar
router.get('/angels', authenticateToken, angelController.listAngels);
// GET /api/angels/:id - Obter Angel por ID: Qualquer usuário autenticado pode obter
router.get('/angels/:id', authenticateToken, angelController.getAngelById);
// PUT /api/angels/:id - Atualizar Angel: Apenas Angels e Admins podem atualizar
router.put('/angels/:id', authenticateToken, authorizeRole(['angel', 'admin']), angelController.updateAngel);
// DELETE /api/angels/:id - Deletar Angel: Apenas Admins podem deletar
router.delete('/angels/:id', authenticateToken, authorizeRole('admin'), angelController.deleteAngel);
// GET /api/angels/search - Buscar Angels: Qualquer usuário autenticado pode buscar
router.get('/angels/search', authenticateToken, angelController.searchAngels);

// Rotas de Visitors
// POST /api/visitors - Criar Visitor: Qualquer usuário autenticado pode criar
router.post('/visitors', authenticateToken, visitorController.createVisitor);
// GET /api/visitors - Listar Visitors: Qualquer usuário autenticado pode listar
router.get('/visitors', authenticateToken, visitorController.listVisitors);
// GET /api/visitors/:id - Obter Visitor por ID: Qualquer usuário autenticado pode obter
router.get('/visitors/:id', authenticateToken, visitorController.getVisitorById);
// PUT /api/visitors/:id - Atualizar Visitor: Qualquer usuário autenticado pode atualizar (ajuste a role se necessário)
router.put('/visitors/:id', authenticateToken, visitorController.updateVisitor);
// DELETE /api/visitors/:id - Deletar Visitor: Apenas Admins podem deletar
router.delete('/visitors/:id', authenticateToken, authorizeRole('admin'), visitorController.deleteVisitor);

// Rotas de Associações
// POST /api/associate - Criar Associação: Apenas Angels e Admins podem criar (e com a nova lógica de limite)
router.post('/associate', authenticateToken, authorizeRole(['angel', 'admin']), associationController.createAssociation);
// GET /api/associations - Listar Associações: Qualquer usuário autenticado pode listar
router.get('/associations', authenticateToken, associationController.listAssociations);
// DELETE /api/associations/:id - Deletar Associação: Apenas Admins podem deletar (e decrementará o contador)
router.delete('/associations/:id', authenticateToken, authorizeRole('admin'), associationController.deleteAssociation);


// --- Rota de Listagem de Ambos (Angels e Visitors) - REVISADA ---
// A rota '/all' não é uma boa prática para listar entidades distintas.
// Sugiro remover esta rota se os endpoints individuais forem suficientes.
// Se ainda quiser uma rota que combine ambos, ela precisaria de lógica mais complexa.
// Por enquanto, vou comentar esta rota para evitar confusão ou comportamento inesperado.
/*
router.get('/all', authenticateToken, (req, res) => {
    // Para listar ambos, você precisaria de uma lógica que buscasse Angels e Visitors
    // e os combinasse. A maneira como estava (chamando angelController.listAngels)
    // apenas retornaria os Angels e encerraria a requisição.
    res.status(501).json({ message: 'Esta rota precisa de implementação para listar ambos.' });
});
*/

module.exports = router;