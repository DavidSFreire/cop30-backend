const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

// Registrar um novo usuário
exports.register = (req, res) => {
    const { username, password, role } = req.body; // Adicione 'role' para definir tipo de usuário
    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    // Hash da senha
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 é o saltRounds

    db.run(`INSERT INTO Users (username, password, role) VALUES (?, ?, ?)`,
        [username, hashedPassword, role || 'user'], // Default role is 'user'
        function (err) {
            if (err) {
                // Erro de UNIQUE constraint para username
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ message: 'Nome de usuário já existe.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Usuário registrado com sucesso.', id: this.lastID });
        });
};

// Login de usuário
exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    db.get(`SELECT * FROM Users WHERE username = ?`, [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // Comparar senha
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // Gerar token JWT
        const token = generateToken({ id: user.id, username: user.username, role: user.role });
        res.status(200).json({ message: 'Login realizado com sucesso.', token: token, user: { id: user.id, username: user.username, role: user.role } });
    });
};