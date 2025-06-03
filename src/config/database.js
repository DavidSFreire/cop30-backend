// src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database/cop30.db'); // Caminho para o arquivo do banco de dados

// Cria a pasta database se ela não existir
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Cria as tabelas se elas não existirem
        db.run(`CREATE TABLE IF NOT EXISTS Angels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            city TEXT NOT NULL,
            availability TEXT NOT NULL,
            contact TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            country TEXT NOT NULL,
            interest TEXT NOT NULL,
            contact TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Associations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            angel_id INTEGER,
            visitor_id INTEGER,
            FOREIGN KEY (angel_id) REFERENCES Angels(id),
            FOREIGN KEY (visitor_id) REFERENCES Visitors(id)
        )`);
    }
});

// Garante que as operações sejam serializadas para evitar conflitos (mencionado nos requisitos)
db.serialize(() => {
    // Todas as operações de banco de dados subsequentes serão enfileiradas e executadas uma após a outra
    // db.run(...)
    // db.get(...)
    // db.all(...)
});

module.exports = db;