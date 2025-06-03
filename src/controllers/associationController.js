const db = require('../config/database');

// Associar Angel e Visitor
exports.createAssociation = (req, res) => {
    const { angel_id, visitor_id } = req.body;
    if (!angel_id || !visitor_id) {
        return res.status(400).json({ message: 'angel_id e visitor_id são obrigatórios.' });
    }

    // 1. Verificar se o Angel existe
    db.get(`SELECT id, visitors_count FROM Angels WHERE id = ?`, [angel_id], (err, angel) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!angel) {
            return res.status(404).json({ message: 'Angel não encontrado.' });
        }

        // 2. Verificar o limite de 3 visitors
        if (angel.visitors_count >= 3) {
            return res.status(400).json({ message: `Angel ${angel.id} já atingiu o limite de 3 visitors.` });
        }

        // 3. Verificar se o Visitor existe
        db.get(`SELECT id FROM Visitors WHERE id = ?`, [visitor_id], (err, visitor) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!visitor) {
                return res.status(404).json({ message: 'Visitor não encontrado.' });
            }

            // 4. Verificar se a associação já existe para evitar duplicatas
            db.get(`SELECT id FROM Associations WHERE angel_id = ? AND visitor_id = ?`, [angel_id, visitor_id], (err, existingAssociation) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (existingAssociation) {
                    return res.status(409).json({ message: 'Esta associação já existe.' });
                }

                // 5. Criar a associação
                db.run(`INSERT INTO Associations (angel_id, visitor_id) VALUES (?, ?)`,
                    [angel_id, visitor_id],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        // 6. Incrementar o contador de visitors do Angel
                        db.run(`UPDATE Angels SET visitors_count = visitors_count + 1 WHERE id = ?`, [angel_id], (updateErr) => {
                            if (updateErr) {
                                console.error('Erro ao atualizar visitors_count para o Angel:', updateErr.message);
                                // A associação foi criada, mas o contador falhou. Pode ser necessário um rollback em sistemas mais robustos.
                                return res.status(500).json({ message: 'Associação criada, mas houve um erro ao atualizar o contador do Angel.', error: updateErr.message, id: this.lastID });
                            }
                            res.status(201).json({ message: 'Associação criada com sucesso.', id: this.lastID });
                        });
                    });
            });
        });
    });
};

// Listar Associações (Adicionado para completude, se já não tiver)
exports.listAssociations = (req, res) => {
    db.all(`SELECT 
                A.id as association_id,
                An.name as angel_name,
                V.name as visitor_name
            FROM Associations A
            JOIN Angels An ON A.angel_id = An.id
            JOIN Visitors V ON A.visitor_id = V.id`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
};

// Deletar Associação (Adicionado para completude, se já não tiver)
exports.deleteAssociation = (req, res) => {
    const { id } = req.params;

    // 1. Obter a associação para pegar o angel_id
    db.get(`SELECT angel_id FROM Associations WHERE id = ?`, [id], (err, association) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!association) {
            return res.status(404).json({ message: 'Associação não encontrada.' });
        }

        // 2. Excluir a associação
        db.run(`DELETE FROM Associations WHERE id = ?`, [id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Associação não encontrada para exclusão.' });
            }

            // 3. Decrementar o contador de visitors do Angel
            db.run(`UPDATE Angels SET visitors_count = visitors_count - 1 WHERE id = ?`, [association.angel_id], (updateErr) => {
                if (updateErr) {
                    console.error('Erro ao decrementar visitors_count para o Angel:', updateErr.message);
                    return res.status(500).json({ message: 'Associação excluída, mas houve um erro ao atualizar o contador do Angel.', error: updateErr.message });
                }
                res.status(200).json({ message: 'Associação excluída com sucesso.' });
            });
        });
    });
};