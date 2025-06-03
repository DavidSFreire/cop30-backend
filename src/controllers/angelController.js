// src/controllers/angelController.js
const db = require('../config/database');

// Cadastrar Angel
exports.createAngel = (req, res) => {
    const { name, city, availability, contact } = req.body;
    if (!name || !city || !availability || !contact) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: name, city, availability, contact.' });
    }

    db.run(`INSERT INTO Angels (name, city, availability, contact) VALUES (?, ?, ?, ?)`,
        [name, city, availability, contact],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Angel cadastrado com sucesso.', id: this.lastID });
        });
};

// Listar Angels
exports.listAngels = (req, res) => {
    db.all(`SELECT * FROM Angels`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
};

// Obter Angel por ID (exemplo)
exports.getAngelById = (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM Angels WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Angel não encontrado.' });
        }
        res.status(200).json(row);
    });
};

// Atualizar Angel (exemplo)
exports.updateAngel = (req, res) => {
    const { id } = req.params;
    const { name, city, availability, contact } = req.body;
    db.run(`UPDATE Angels SET name = ?, city = ?, availability = ?, contact = ? WHERE id = ?`,
        [name, city, availability, contact, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Angel não encontrado para atualização.' });
            }
            res.status(200).json({ message: 'Angel atualizado com sucesso.' });
        });
};

// Deletar Angel (exemplo)
exports.deleteAngel = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM Angels WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Angel não encontrado para exclusão.' });
        }
        res.status(200).json({ message: 'Angel excluído com sucesso.' });
    });
};

// Buscar Angels por cidade ou disponibilidade
exports.searchAngels = (req, res) => {
    const { city, availability } = req.query; // Pega parâmetros da query string
    let sql = `SELECT * FROM Angels WHERE 1=1`;
    const params = [];

    if (city) {
        sql += ` AND city LIKE ?`;
        params.push(`%${city}%`);
    }
    if (availability) {
        sql += ` AND availability LIKE ?`;
        params.push(`%${availability}%`);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
};