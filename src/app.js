// src/app.js
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Importa suas rotas
const db = require('./config/database'); // Conecta ao banco de dados

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON no corpo das requisições
app.use(bodyParser.json());

// Adiciona as rotas da sua API
app.use('/api', routes);

// Rota de teste
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bem-vindo à API da COP30!' });
});

// Tratamento de erros genérico (você pode expandir isso com um errorHandler.js)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app; // Exporta para testes