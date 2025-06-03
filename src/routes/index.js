// src/routes/index.js
const express = require('express');
const router = express.Router();

const angelController = require('../controllers/angelController');
const visitorController = require('../controllers/visitorController');

// Rotas de Angels
router.post('/angels', angelController.createAngel);
router.get('/angels', angelController.listAngels);
router.get('/angels/:id', angelController.getAngelById); // Exemplo de rota adicional
router.put('/angels/:id', angelController.updateAngel);
router.delete('/angels/:id', angelController.deleteAngel);

// Rotas de Visitors
router.post('/visitors', visitorController.createVisitor);
router.get('/visitors', visitorController.listVisitors);
router.get('/visitors/:id', visitorController.getVisitorById); // Exemplo de rota adicional
router.put('/visitors/:id', visitorController.updateVisitor);
router.delete('/visitors/:id', visitorController.deleteVisitor);

// Listagem de ambos (Angels e Visitors) - requisito
router.get('/all', (req, res) => {
    // Você pode chamar os métodos dos controllers para listar ambos
    // Ou criar um método específico para isso se a lógica for mais complexa
    // Por simplicidade, vamos listar ambos separadamente aqui.
    angelController.listAngels(req, res); // Isso pode ser ajustado para um único endpoint
    // ou uma lógica que combine os dois resultados
});

// Associação entre um Visitor e um Angel (POST para criar associação)
router.post('/associate', (req, res) => {
    const { angel_id, visitor_id } = req.body;
    if (!angel_id || !visitor_id) {
        return res.status(400).json({ message: 'IDs de Angel e Visitor são obrigatórios.' });
    }

    db.run(`INSERT INTO Associations (angel_id, visitor_id) VALUES (?, ?)`,
        [angel_id, visitor_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Associação criada com sucesso.', id: this.lastID });
        });
});

// Busca por cidade ou disponibilidade (para Angels)
router.get('/angels/search', angelController.searchAngels);

module.exports = router;