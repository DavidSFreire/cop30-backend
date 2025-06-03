// src/controllers/visitorController.js
const db = require('../config/database');

// Cadastrar Visitor
exports.createVisitor = (req, res) => {
    const { name, country, interest, contact } = req.body;
    if (!name || !country || !interest || !contact) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: name, country, interest, contact.' });
    }

    db.run(`INSERT INTO Visitors (name, country, interest, contact) VALUES (?, ?, ?, ?)`,
        [name, country, interest, contact],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Visitor cadastrado com sucesso.', id: this.lastID });
        });
};

// Listar Visitors
exports.listVisitors = (req, res) => {
    db.all(`SELECT * FROM Visitors`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
};

// Obter Visitor por ID (exemplo)
exports.getVisitorById = (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM Visitors WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Visitor não encontrado.' });
        }
        res.status(200).json(row);
    });
};

// Atualizar Visitor (exemplo)
exports.updateVisitor = (req, res) => {
    const { id } = req.params;
    const { name, country, interest, contact } = req.body;
    db.run(`UPDATE Visitors SET name = ?, country = ?, interest = ?, contact = ? WHERE id = ?`,
        [name, country, interest, contact, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Visitor não encontrado para atualização.' });
            }
            res.status(200).json({ message: 'Visitor atualizado com sucesso.' });
        });
};

// Deletar Visitor (exemplo)
exports.deleteVisitor = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM Visitors WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Visitor não encontrado para exclusão.' });
        }
        res.status(200).json({ message: 'Visitor excluído com sucesso.' });
    });
};